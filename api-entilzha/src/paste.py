import json
from fastapi import APIRouter
from pydantic import BaseModel
from starlette.responses import Response
from starlette.status import HTTP_401_UNAUTHORIZED
import json 

router = APIRouter()

class Paste(BaseModel):
    content: str
    is_url: bool

class Entity(BaseModel):
    question_id: int
    word_numbers: list 
    entities: list


@router.post("/new_entity")
async def write_entity(entity: Entity):
    f = json.loads(open("entity.json").read())
    print(entity)
    question_id = str(entity.question_id)
    entity_names = entity.entities
    word_numbers = entity.word_numbers 
    f[question_id]["entities"] = entity_names
    f[question_id]["locations"] = word_numbers 

    print("Writing {}".format(f))

    w = open("entity.json","w")
    w.write(json.dumps(f))
    w.close()
    
    return {'success': True}
