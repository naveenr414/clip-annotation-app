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
    question_dict = db.get_question_by_id(qanta_id)

    CUTOFF = 0.2

    new_tokens = db.flatten_tokens(question_dict)
    question_dict["tokens"] = new_tokens
    question_dict["text"] = question_dict["text"].replace(chr(160), " ")
    question_dict["entities"] = db.get_entities(qanta_id)

    entity_list = []
    entity_locations = []
    entity_pointer = 0
    i = 0
    while i < len(new_tokens) and entity_pointer < len(question_dict["entities"]):

        while (
            entity_pointer < len(question_dict["entities"])
            and question_dict["entities"][entity_pointer]["start"]
            < new_tokens[i]["start"]
        ):
            entity_pointer += 1

        if entity_pointer == len(question_dict["entities"]):
            break

        if question_dict["entities"][entity_pointer]["start"] == new_tokens[i]["start"]:
            start = i
            while (
                question_dict["entities"][entity_pointer]["end"] > new_tokens[i]["end"]
            ):
                i += 1
            end = i

            if (
                question_dict["entities"][entity_pointer]["score"] == -1
                or question_dict["entities"][entity_pointer]["score"] > CUTOFF
            ):
                entity_list.append(question_dict["entities"][entity_pointer]["entity"])
                entity_locations.append([start, end])

            entity_pointer += 1
            i += 1
        else:
            i += 1

    question_dict["entities"] = entity_list
    question_dict["entity_locations"] = entity_locations

    return question_dict


@router.get("/api/qanta/autocorrect/{text}")
def autocorrect(text: str):
    return db.get_autocorrect(text)
