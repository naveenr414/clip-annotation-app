import json
import random
from contextlib import contextmanager

from sqlalchemy import Column, Integer, String, Boolean, Float, create_engine, and_
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session

from sqlalchemy.orm.scoping import ScopedSession


Base = declarative_base()  # pylint: disable=invalid-name


class Database:
    def __init__(self):
        self._engine = create_engine(
            "sqlite:///data/qanta.2018.04.18.sqlite3"
        )  # pylint: disable=invalid-name
        Base.metadata.bind = self._engine
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
    __tablename__ = "ENTITIES"
    name = Column(String, primary_key=True)
    link = Column(String)

    def __str__(self):
        return self.name


class Mention:
    __tablename__ = "MENTIONS"
    entity = Column(String)
    question_id = Column(Integer)
    start = Column(Integer)
    end = Column(Integer)
    edited = Column(Integer)
    score = Column(Float)
