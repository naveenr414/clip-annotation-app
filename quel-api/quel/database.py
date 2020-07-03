from typing import Dict, List, Any
import json
import time
import random
from contextlib import contextmanager
import html
import random

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Float,
    create_engine,
    and_,
    MetaData,
    Table,
    Column,
    ForeignKey,
    PrimaryKeyConstraint,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.orm.scoping import ScopedSession

from quel.log import get_logger


log = get_logger(__name__)

Base = declarative_base()  # pylint: disable=invalid-name


class Database:
    def __init__(self, find_questions=True):
        self._engine = create_engine(
            # Separate name to avoid confusing it with the unmodified qanta db
            "sqlite:///data/quel_db.sqlite3"
        )  # pylint: disable=invalid-name
        Base.metadata.bind = self._engine

        if find_questions:
            with self._session_scope as session:
                self._all_qanta_ids = [
                    r[0] for r in session.query(Question.qanta_id).all()
                ]

    def create_all(self):
        Base.metadata.create_all(self._engine, checkfirst=True)

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

    def get_questions_by_packet(self,packet_id: int):
        with self._session_scope as session:
            questions = session.query(Packet).filter_by(packet_id=packet_id).all()
            print(questions)
            return [i.question_id for i in questions]

    def get_autocorrect(self, text: str):
        with self._session_scope as session:
            start = time.time()
            lower_bound = text.lower()
            upper_bound = text + chr(255)
            results = (
                session.query(Entity)
                .filter(and_(Entity.name >= lower_bound, Entity.name <= upper_bound))
                .order_by(Entity.name)
                .limit(5)
            )

            l = []
            for i in results:
                if i.summary!="":
                    l+=[i.name.title()+" -o- "+i.summary+"..."]
                else:
                    l+=[i.name.title()]
            log.info("Took %s time to autocorrect", time.time() - start)
            return l

    def write_dummy_packets(self,packet_num,question_ids,description,machine_tagger):
        self.create_all()
        question_list = [{'packet_id':packet_num,'question_id':i} for i in question_ids]
                
    
        with self._session_scope as session:
            session.bulk_insert_mappings(Packet,question_list)
            session.bulk_insert_mappings(PacketID,[{'packet_id':packet_num,'machine_tagger':machine_tagger,'description':description}])

        print("Inserted dummy packet! {}".format(packet_num))
                        

    def write_questions(self, questions: Dict[str, Any]):
        start = time.time()

        with self._session_scope as session:
            question_list = []
            for question in questions:
                question["tokenizations"] = str(question["tokenizations"])
                question["tokens"] = json.dumps(question["tokens"])
                question_list.append(question)
            session.bulk_insert_mappings(Question, question_list)
        log.info("Took %s time to write questions", time.time() - start)

    def write_entities(self, entities,summaries):
        start = time.time()

        all_summaries = {}
        for i in summaries:
            all_summaries[i['title'].lower().strip()] = i['text']

        with self._session_scope as session:
            entity_list = []

            for i in entities:
                name = html.unescape(i.replace("_", " "))
                name = name.lower()

                if name.lower().strip() in all_summaries:
                    actual_summary = all_summaries[name.lower().strip()]
                    if"\n\n" in actual_summary and len(actual_summary.split("\n\n")[1])>3:
                        actual_summary = actual_summary.split("\n\n")[1]
                    actual_summary = actual_summary.replace("\n\n"," ")
                    
                    entity_list.append({"name": name, "link": i,'summary':actual_summary})
                else:
                    entity_list.append({"name": name, "link": i,'summary':''})
            session.bulk_insert_mappings(Entity, entity_list)
        log.info("Took %s time to write entities", time.time() - start)

    def write_mentions(self, mentions, source_name):
        start_time = time.time()

        self.insert_email_password(source_name, "")

        with self._session_scope as session:
            mention_list = []
            for mention in mentions:
                question_id = mention["qanta_id"]

                sentence_starts = mention["tokenizations"]
                sentence_starts = [k[0] for k in sentence_starts]

                for j, sentence in enumerate(mention["mentions"]):
                    for entity in sentence:
                        start = entity["span"][0] + sentence_starts[j]
                        end = entity["span"][1] + sentence_starts[j]
                        score = entity["score"]
                        name = entity["entity"].replace("_", " ").lower()
                        mention_list.append(
                            {
                                "start": start,
                                "end": end,
                                "score": score,
                                "entity": name,
                                "question_id": question_id,
                                "deleted": 0,
                                "user_id": source_name,
                                "machine_tagged": 1,
                            }
                        )
            session.bulk_insert_mappings(Mention, mention_list)
        log.info("Took %s time to write mentions", time.time() - start_time)

    def write_mentions_character(self, mentions, source_name):
        start_time = time.time()

        self.insert_email_password(source_name, "")

        with self._session_scope as session:
            mention_list = []
            for mention in mentions:
                question_id = mention["qanta_id"]

                for entity in mention["mentions"]:
                        start = entity["span"][0]
                        end = entity["span"][1] 
                        score = entity["score"]
                        name = entity["entity"].replace("_", " ").lower()
                        mention_list.append(
                            {
                                "start": start,
                                "end": end,
                                "score": score,
                                "entity": name,
                                "question_id": question_id,
                                "deleted": 0,
                                "user_id": source_name,
                                "machine_tagged": 1,
                            }
                        )
            session.bulk_insert_mappings(Mention, mention_list)
        log.info("Took %s time to write mentions", time.time() - start_time)


    def get_questions_with_entity(self, entity):
        entity = entity.lower()
        with self._session_scope as session:
            results = session.query(Mention).filter(Mention.entity == entity)
            results = results.all()

            question_ids = [i.question_id for i in results[:5]]
            texts = [self.get_question_by_id(i)["text"] for i in question_ids]
            return texts

    def get_all_packets(self):
        with self._session_scope as session:
            results = (
                session.query(PacketID)
            )

            return [{'packet_id':i.packet_id,'description':i.description} for i in results]
            

    def get_entities(self, question_id,packet_id):
        with self._session_scope as session:        
            results = (
                session.query(Mention)
                .filter(Mention.question_id == question_id)
                .filter(Mention.deleted != 1)
            )

            results_machine = (
                session.query(PacketID)
                .filter(PacketID.packet_id==packet_id)
                )
            results_machine = [i.machine_tagger for i in results_machine]


            if(len(results_machine)>0):
                machine = results_machine[0]
            else:
                machine = "tagme"
            cutoffs = {'tagme': 0.2, 'blink': -100000, 'nel': -10000000,'none':0}

            question_dict = self.get_question_by_id(question_id)
            tokens = question_dict["tokens"]

            t = time.time()
            results = results.all()
            print("Took {} time to run the query".format(time.time() - t))
            results = [
                {
                    "start": i.start,
                    "end": i.end,
                    "entity": i.entity,
                    "id": i.mention_id,
                    "score": i.score,
                    "machine_tagged": i.machine_tagged,
                    "user_id": i.user_id,
                }
                for i in results
            ]
            
            results = sorted(results, key=lambda x: x["start"])
            results = [
                i for i in results if i["machine_tagged"] != 1 or i["user_id"] == machine and i['score']>=cutoffs[machine]
            ]

            entity_list = []
            entity_locations = []
            entity_ids = []
            entity_pointer = 0
            i = 0
            while i < len(tokens) and entity_pointer < len(results):

                while (
                    entity_pointer < len(results)
                    and results[entity_pointer]["start"] < tokens[i]["char_start"]
                ):
                    entity_pointer += 1
                if entity_pointer == len(results):
                    break
                if results[entity_pointer]["start"] == tokens[i]["char_start"]:
                    start = i
                    while results[entity_pointer]["end"] > tokens[i]["char_end"]:
                        i += 1
                    end = i

                    entity_list.append(results[entity_pointer]["entity"])
                    entity_locations.append([start, end])
                    entity_ids.append(results[entity_pointer]["id"])

                    entity_pointer += 1
                    i += 1
                else:
                    i += 1
            return entity_list, entity_locations, entity_ids

    def delete_mentions(self, mention_ids):
        with self._session_scope as session:
            for i in mention_ids:
                session.query(Mention).filter(Mention.mention_id == i).update(
                    {"deleted": 1}
                )

    def write_new_mentions(self, mentions, question_id, user_id):
        with self._session_scope as session:
            mention_list = []
            for ment in mentions:
                ment = ment.copy()
                ment["entity"] = ment["entity"].lower()
                ment["score"] = 0
                ment["question_id"] = question_id
                ment["deleted"] = 0
                ment["machine_tagged"] = 0
                ment["user_id"] = user_id
                mention_list.append(ment)
            session.bulk_insert_mappings(Mention, mention_list)

    def get_password(self, email):
        with self._session_scope as session:
            results = session.query(User).filter(User.email == email).first()
            if results:
                return results.password
            return None

    def insert_email_password(self, email, password):
        with self._session_scope as session:
            if not session.query(User).filter(User.email == email).first():
                session.bulk_insert_mappings(
                    User, [{"email": email, "password": password}]
                )
                return True
            return False

    def reset_users(self):
        with self._session_scope as session:
            session.query(User).filter(User.password != "").delete()


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

    def from_dict(self, d):
        for k in d:
            setattr(self, k, d[k])

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
            "tokens": json.loads(self.tokens),
        }


class Entity(Base):
    __tablename__ = "entities"
    entity_id = Column(Integer, primary_key=True)
    name = Column(String, index=True)
    link = Column(String)
    summary = Column(String)

    def __str__(self):
        return self.name


class Mention(Base):
    __tablename__ = "mentions"
    mention_id = Column(Integer, primary_key=True)
    entity = Column(String, ForeignKey("entities.name"), index=True)
    question_id = Column(Integer, ForeignKey("questions.qanta_id"), index=True)
    start = Column(Integer)
    end = Column(Integer)
    score = Column(Float)
    machine_tagged = Column(Integer)
    user_id = Column(String, ForeignKey("users.email"))
    deleted = Column(Integer)


class User(Base):
    __tablename__ = "users"
    email = Column(String, primary_key=True)
    password = Column(String)

    def __str__(self):
        return self.email

class Packet(Base):
    __tablename__ = "packets"
    packet_id = Column(Integer,index=True)
    question_id = Column(Integer,ForeignKey("questions.qanta_id"))

    __table_args__ = (
        PrimaryKeyConstraint('packet_id', 'question_id'),
        {},
    )

class PacketID(Base):
    __tablename__ = "packetids"
    packet_id = Column(Integer,index=True,primary_key=True)
    description = Column(String)
    machine_tagger = Column(String)

