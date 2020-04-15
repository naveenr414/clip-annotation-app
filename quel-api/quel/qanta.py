import json
from fastapi import APIRouter
from quel.database import Database


db = Database()
router = APIRouter()


@router.get("/api/qanta/v1/random")
def get_random_question():
    return db.get_random_question()


@router.get("/api/qanta/v1/{qanta_id}")
def get_question(qanta_id: int):
    all_entities = json.loads(open("entity.json").read())
    question_dict = db.get_question_by_id(qanta_id)
    question_dict["text"] = question_dict["text"].replace(chr(160), " ")
    question_dict["entities"] = all_entities[str(qanta_id)]["entities"]
    question_dict["entity_locations"] = all_entities[str(qanta_id)]["locations"]
    return question_dict
