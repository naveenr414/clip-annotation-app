from database import Question, Database, Entity, Mention
import json
from sqlalchemy import Table, Column, Integer, String, MetaData,create_engine
from sqlalchemy.ext.declarative import declarative_base
import click

def write_questions(db,question_file="data/qanta.mapped.2018.04.18.json"):
    info = json.loads(open(question_file).read())["questions"]
    db.write_questions(info)

def write_tokens(db,token_file="tmp/qanta_tokenized.json"):
    tokens = json.loads(open(token_file).read())
    by_qanta_id = {}

    all_sentences = tokens["sentences"]
    for sent in all_sentences:
        if sent["qanta_id"] not in by_qanta_id:
            by_qanta_id[sent["qanta_id"]] = []
        by_qanta_id[sent["qanta_id"]].append(sent["tokens"])

    db.add_tokens(by_qanta_id)
        

    return True

def write_entities(db,entity_location="data/wikipedia-titles.2018.04.18.json"):
    entities = json.loads(open(entity_location).read())
    db.write_entities(entities)
    return True


def write_mentions(db,mention_location="data/qanta.question_w_mentions.train.json"):
    mentions = json.loads(open(mention_location).read())
    db.write_mentions(mentions)

    return True

@click.command()
def main():
    
    db = Database(find_questions=False)
    db.create_all()
    print("Writing questions")
    write_questions(db)
    print("Writing tokens")
    write_tokens(db)
    print("Writing entities")
    write_entities(db)
    print("Writing mentions")
    write_mentions(db)

if __name__ == "__main__":
    main()  

