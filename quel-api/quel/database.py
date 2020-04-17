import json
import random
from contextlib import contextmanager
import html

from sqlalchemy import Column, Integer, String, Boolean, Float, create_engine, and_, MetaData,Table,Column, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session

from sqlalchemy.orm.scoping import ScopedSession

import time 


Base = declarative_base()  # pylint: disable=invalid-name


class Database:
    def __init__(self,find_questions=True):
        self._engine = create_engine(
            "sqlite:///data/qanta.2018.04.18.sqlite3"
        )  # pylint: disable=invalid-name
        Base.metadata.bind = self._engine

        if find_questions:
            with self._session_scope as session:
                self._all_qanta_ids = [r[0] for r in session.query(Question.qanta_id).all()]

    def create_all(self):
        Base.metadata.create_all(self._engine)

    def drop_all(self):
        Base.metadata.drop_all(self._engine)

    def reset_all(self):
        self.drop_all()
        self.create_all()

    @property
    @contextmanager
    def _session_scope(self) -> ScopedSession:
        session = scoped_session(sessionmaker(bind=self._engine))
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def get_all_qanta_ids(self):
        return self._all_qanta_ids

    def get_random_question(self):
        with self._session_scope as session:
            qanta_id = random.choice(self._all_qanta_ids)
            question = session.query(Question).filter_by(qanta_id=qanta_id).first()
            return question.to_dict()

    def get_question_by_id(self, qanta_id: int):
        with self._session_scope as session:
            question = session.query(Question).filter_by(qanta_id=qanta_id).first()
            return question.to_dict()

    def get_autocorrect(self, text: str):
        with self._session_scope as session:
            lower_bound = text.lower()
            upper_bound = text + chr(255)
            results = (
                session.query(Entity)
                .filter(and_(Entity.name >= lower_bound, Entity.name <= upper_bound))
                .order_by(Entity.name)
                .limit(5)
            )
            return [str(i) for i in results]

    def write_questions(self,info):
        start = time.time()

        with self._session_scope as session:
            num_written = 0
            total = len(info)

            question_list = []

            for question in info:
                num_written+=1
                question["tokenizations"] = str(question["tokenizations"])
                question["tokens"] = ""
                question_list.append(question)

            session.bulk_insert_mappings(Question,question_list)

        print("Took {} time to write questions".format(time.time()-start))


    def add_tokens(self,by_qanta_id):
        start = time.time()

        with self._session_scope as session:
            total_tokens = len(by_qanta_id)
            written = 0

            for qanta_id in by_qanta_id:
                question_id = qanta_id
                tokens = json.dumps(by_qanta_id[qanta_id])
                session.query(Question).filter(Question.qanta_id == question_id).update({"tokens":tokens})
                written+=1

        print("Took {} time to write tokens".format(time.time()-start))


    def write_entities(self,entities):
        start = time.time()
        
        with self._session_scope as session:
            on = 0
            total_entities = len(entities)

            entity_list = []

            for i in entities:
                name = html.unescape(i.replace("_", " "))
                name = name.lower()
                entity_list.append({'name':name,'link':i})

            session.bulk_insert_mappings(Entity,entity_list)
            
            print("Finished writing entities, now saving")
        print("Took {} time to write entities".format(time.time()-start))


    def write_mentions(self,mentions):
        start=  time.time()
        total_mentions = len(mentions)
        with self._session_scope as session:
            mention_list = []
            for i,mention in enumerate(mentions):
                question_id = mention["qanta_id"]

                for sentence in mention["mentions"]:
                    for entity in sentence:
                        start = entity["span"][0]
                        end = entity["span"][1]
                        score = entity["score"]
                        name = entity["entity"].replace("_", " ")
                        mention_list.append({'start':start,'end':end,'score':score,'name':name,'question_id':question_id,'edited':0})

            session.bulk_insert_mappings(Mention,mention_list)

        print("Took {} time to write metions".format(time.time()-start))

    def get_entities(self,question_id):
        with self._session_scope as session:
            results =session.query(Mention).filter(Mention.question_id == question_id)
            l = results.all()
            l = [{'start':i.start,'end':i.end,'entity':i.entity} for i in l]
            l = sorted(l,key=lambda x: x['start'])
            return l


    def create_all_tables(self):
        Base.metadata.create_all(self._engine)

class Question(Base):
    __tablename__ = "questions"
    qanta_id = Column(Integer, primary_key=True)
    text = Column(String)
    first_sentence = Column(String)
    tokenizations = Column(String)
    answer = Column(String)
    page = Column(String)
    fold = Column(String)
    gameplay = Column(Boolean)
    category = Column(String)
    subcategory = Column(String)
    tournament = Column(String)
    difficulty = Column(String)
    year = Column(Integer)
    proto_id = Column(Integer)
    qdb_id = Column(Integer)
    dataset = Column(String)
    tokens = Column(String)

    def from_dict(self,d):
        for k in d:
            setattr(self,k,d[k])

    def to_dict(self):
        return {
            "qanta_id": self.qanta_id,
            "text": self.text,
            "tokenizations": json.loads(self.tokenizations),
            "answer": self.answer,
            "page": self.page,
            "fold": self.fold,
            "gameplay": self.gameplay,
            "category": self.category,
            "subcategory": self.subcategory,
            "tournament": self.tournament,
            "difficulty": self.difficulty,
            "year": self.year,
            "proto_id": self.proto_id,
            "qdb_id": self.proto_id,
            "dataset": self.dataset,
            "tokens": self.tokens,
        }


class Entity(Base):
    __tablename__ = "entities"
    entity_id = Column(Integer,primary_key=True)
    name = Column(String)
    link = Column(String)

    def __str__(self):
        return self.name


class Mention(Base):
    __tablename__ = "mentions"
    mention_id = Column(Integer,primary_key=True)
    entity = Column(String,ForeignKey('entities.name'))
    question_id = Column(Integer,ForeignKey('questions.qanta_id'))
    start = Column(Integer)
    end = Column(Integer)
    edited = Column(Integer)
    score = Column(Float)
