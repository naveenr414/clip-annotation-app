import json
import click
import os
import sys

from sqlalchemy import Table, Column, Integer, String, MetaData, create_engine
from sqlalchemy.ext.declarative import declarative_base


from quel.database import Question, Database, Entity, Mention
from quel.log import get_logger


log = get_logger(__name__)


def write_questions(db, question_file="data/qanta.mapped.2018.04.18.json"):
    with open(question_file) as f:
        questions = json.load(f)["questions"]
    db.write_questions(questions)


def write_tokens(db, token_file="data/qanta_tokenized.json"):
    with open(token_file) as f:
        tokens = json.load(f)
    by_qanta_id = {}

    all_sentences = tokens["sentences"]
    for sent in all_sentences:
        if sent["qanta_id"] not in by_qanta_id:
            by_qanta_id[sent["qanta_id"]] = []
        by_qanta_id[sent["qanta_id"]].append(sent["tokens"])

    db.write_tokens(by_qanta_id)


def write_entities(db, entity_location="data/wikipedia-titles.2018.04.18.json"):
    with open(entity_location) as f:
        entities = json.load(f)
    db.write_entities(entities)


def write_mentions(db, mention_location="data/qanta.question_w_mentions.train.json"):
    with open(mention_location) as f:
        mentions = json.load(f)
    db.write_mentions(mentions,"tagme")


@click.command()
def main():
    db = Database(find_questions=False)
    db.create_all()
    log.info("Writing questions")
    write_questions(db)

    log.info("Writing tokens")
    write_tokens(db)

    log.info("Writing entities")
    write_entities(db)

    log.info("Writing mentions")
    write_mentions(db)


if __name__ == "__main__":
    main()
