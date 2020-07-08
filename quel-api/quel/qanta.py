import json
from fastapi import APIRouter
from quel.database import Database
import quel.security as security
import time

db = Database()
router = APIRouter()


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
    entity_list, entity_locations, _ = db.get_entities(qanta_id,packet_id)

    question_dict["entities"] = entity_list
    question_dict["entity_locations"] = entity_locations

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
