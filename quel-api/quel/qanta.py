import json
from fastapi import APIRouter
from quel.database import Database
import quel.security as security
from pydantic import BaseModel  # pylint: disable=no-name-in-module
import time

db = Database()
router = APIRouter()

class Packet(BaseModel):
    question_nums: str
    question_id: str
    description: str
    machine_tagger: str


@router.post("/api/qanta/v1/new_packet")
async def write_packet(packet: Packet):
    question_nums = packet.question_nums.split(",")
    question_nums = [int(i) for i in question_nums]
    packet_id = int(packet.question_id)
    description = packet.description
    machine_tagger = packet.machine_tagger.lower()
    db.write_dummy_packets(packet_id,question_nums,description,machine_tagger)

@router.get("/api/qanta/v1/random")
def get_random_question():
    return db.get_random_question()


@router.get("/api/qanta/v1/{qanta_id}")
def get_question(qanta_id: str):

    qanta_id, packet_id = qanta_id.split("_")
    qanta_id = int(qanta_id)
    packet_id = int(packet_id)
    
    question_dict = db.get_question_by_id(qanta_id)

    question_dict["text"] = question_dict["text"].replace(chr(160), " ")
    entity_list, entity_locations, _, machine_tagged = db.get_entities(qanta_id,packet_id)

    question_dict["entities"] = entity_list
    question_dict["entity_locations"] = entity_locations
    question_dict["machine_tagged"] = machine_tagged

    return question_dict

@router.get("/api/qanta/packet_write/{packet_id}")
def write_packet(packet_num: int):
    db.write_dummy_packets(packet_num)

@router.get("/api/qanta/packet/{packet_id}")
def get_packet(packet_id: int):
    return db.get_questions_by_packet(packet_id)

@router.get("/api/qanta/autocorrect/{text}")
def autocorrect(text: str):
    return db.get_autocorrect(text)

@router.get("/api/qanta/summary/{text}")
def get_summary(text: str):
    return db.get_summary(text)

@router.get("/api/qanta/all_packets/")
def get_all_packets():
    return db.get_all_packets()
