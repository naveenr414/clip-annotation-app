import json
from contextlib import contextmanager
import random

from fastapi import APIRouter
from sqlalchemy import Column, Integer, String, Boolean, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


Base = declarative_base()  # pylint: disable=invalid-name
engine = create_engine(
    "sqlite:///data/qanta.2018.04.18.sqlite3"
)  # pylint: disable=invalid-name
Session = sessionmaker(bind=engine)  # pylint: disable=invalid-name


@contextmanager
def create_session():
    sess = Session()
    yield sess
    sess.close()


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
        }


with create_session() as sess:
    all_qanta_ids = [r[0] for r in sess.query(Question.qanta_id).all()]

router = APIRouter()


@router.get("/api/qanta/v1/random")
def get_random_question():
    with create_session() as sess:
        qanta_id = random.choice(all_qanta_ids)
        question = sess.query(Question).filter_by(qanta_id=qanta_id).first()
    return question.to_dict()


@router.get("/api/qanta/v1/{qanta_id}")
def get_question(qanta_id: int):
    all_entities = json.loads(open("entity.json").read())
    with create_session() as sess:
        question = sess.query(Question).filter_by(qanta_id=qanta_id).first()
    question_dict = question.to_dict()
    question_dict["text"] = question_dict["text"].replace(chr(160), " ")
    question_dict["entities"] = all_entities[str(qanta_id)]["entities"]
    question_dict["entity_locations"] = all_entities[str(qanta_id)]["locations"]
    return question_dict
