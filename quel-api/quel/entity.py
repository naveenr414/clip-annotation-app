import json
from fastapi import APIRouter
from pydantic import BaseModel  # pylint: disable=no-name-in-module
from starlette.responses import Response
from starlette.status import HTTP_401_UNAUTHORIZED
from quel.database import Database
import json

router = APIRouter()


class Entity(BaseModel):
    question_id: int
    word_numbers: list
    entities: list


@router.post("/new_entity")
async def write_entity(entity: Entity):
    db = Database()
    qanta_id = entity.question_id
    old_entities = db.get_entities(qanta_id)
    question_dict = db.get_question_by_id(qanta_id)
    tokens = db.flatten_tokens(question_dict)
    # Convert our current entities into a better format

    old_entity_ids = [i["id"] for i in old_entities]
    for i in old_entities:
        del i["id"]
    old_start_ends = [(i["start"], i["end"]) for i in old_entities]

    our_entities = []
    for i in range(len(entity.word_numbers)):
        our_entities.append(
            {
                "start": entity.word_numbers[i][0],
                "end": entity.word_numbers[i][1],
                "entity": entity.entities[i],
            }
        )

    for i in range(len(our_entities)):
        our_entities[i]["start"] = tokens[our_entities[i]["start"]]["start"]
        our_entities[i]["end"] = tokens[our_entities[i]["end"]]["end"]
    our_start_ends = [(i["start"], i["end"]) for i in our_entities]

    edited = []
    deleted = []

    edited_ids = []
    update_entities = []

    for i in range(len(old_entities)):
        if old_entities[i] not in our_entities and old_start_ends[i] in our_start_ends:
            edited.append(old_entities[i])
            edited_ids.append(old_entity_ids[i])
            update_entities.append(
                (
                    old_entity_ids[i],
                    our_entities[our_start_ends.index(old_start_ends[i])]["entity"],
                )
            )
        elif old_entities[i] not in our_entities:
            deleted.append(old_entities[i])
            edited_ids.append(old_entity_ids[i])

    new_entities = []
    for i in range(len(our_entities)):
        if our_start_ends[i] not in old_start_ends:
            new_entities.append(our_entities[i])

    db.update_edited(edited_ids)
    db.write_new_mentions(new_entities, qanta_id)
    db.update_updated_mentions(update_entities)

    print("The edited entities are {}".format(edited))
    print("The deleted entities are {}".format(deleted))
    print("The new entities are {}".format(new_entities))

    return {"success": True}
