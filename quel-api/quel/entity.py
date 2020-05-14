import json
from fastapi import APIRouter
from pydantic import BaseModel  # pylint: disable=no-name-in-module
from starlette.responses import Response
from starlette.status import HTTP_401_UNAUTHORIZED
from quel.database import Database
import quel.security as security

db = Database()
router = APIRouter()


class Entity(BaseModel):
    question_id: int
    word_numbers: list
    entities: list
    user_id: str


@router.post("/new_entity")
async def write_entity(entity: Entity):
    user_id = security.decode_token(entity.user_id)
    qanta_id = entity.question_id
    old_entities, old_entity_locations, old_entity_ids = db.get_entities(qanta_id)
    question_dict = db.get_question_by_id(qanta_id)
    tokens = question_dict["tokens"]
    # Convert our current entities into a better format

    old_entity_tuples = []
    for i in range(len(old_entities)):
        start = tokens[old_entity_locations[i][0]]["char_start"]
        end = tokens[old_entity_locations[i][1]]["char_end"]
        entity_name = old_entities[i]

        old_entity_tuples.append((start, end, entity_name))

    new_entity_tuples = []
    for i in range(len(entity.word_numbers)):
        new_entity_tuples.append(
            (
                tokens[entity.word_numbers[i][0]]["char_start"],
                tokens[entity.word_numbers[i][1]]["char_end"],
                entity.entities[i],
            )
        )

    deleted_ids = []

    for i, tup in enumerate(old_entity_tuples):
        if tup not in new_entity_tuples:
            deleted_ids.append(old_entity_ids[i])

    new_entities = []
    for i in new_entity_tuples:
        if i not in old_entity_tuples:
            new_entities.append({"start": i[0], "end": i[1], "entity": i[2]})

    print("Deleting {}".format(deleted_ids))
    print("Writing {}".format(new_entities))

    db.delete_mentions(deleted_ids)
    db.write_new_mentions(new_entities, qanta_id, user_id)

    return {"success": True}

@router.get("/all_questions/{entity_name}")
def get_questions(entity_name):
    return db.get_questions_with_entity(entity_name)
