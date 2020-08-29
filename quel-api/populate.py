import json
from typing import List, Tuple
from collections import defaultdict
import pickle

import click

from quel.database import Database
from quel.log import get_logger


log = get_logger(__name__)


def write_questions(
    db,
    question_file="data/qanta.mapped.2018.04.18.json",
    token_file="data/qanta_tokenized.json",
):
    with open(question_file) as f:
        questions = {q["qanta_id"]: q for q in json.load(f)["questions"]}

    with open(token_file) as f:
        question_sentences = json.load(f)["sentences"]

    sentences_by_qanta_id = defaultdict(list)
    for sent in question_sentences:
        sentences_by_qanta_id[sent["qanta_id"]].append(sent)

    db_rows = []
    for qanta_id in sentences_by_qanta_id:
        sentences = sorted(
            sentences_by_qanta_id[qanta_id], key=lambda x: x["sentence_idx"]
        )
        question = questions[qanta_id]
        question["tokens"] = merge_question_sentences(
            question["tokenizations"], sentences
        )
        db_rows.append(question)

    db.write_questions(db_rows)


def merge_question_sentences(tokenizations: List[Tuple[int, int]], sentences: List):
    token_position = 0
    tokens = []
    for (start, _), sent in zip(tokenizations, sentences):
        sentence_idx = sent["sentence_idx"]
        for t in sent["tokens"]:
            tokens.append(
                {
                    "text": t["text"],
                    "char_start": start + t["start"],
                    "char_end": start + t["end"],
                    "token_idx": token_position,
                    "sentence_idx": sentence_idx,
                }
            )
            token_position += 1

    return tokens


def write_entities(db, entity_location="data/all_wiki.json",redirect_location="data/all_wiki_redirects.csv"):
    with open(entity_location) as f:
        entities = json.load(f)

    with open(redirect_location,encoding='utf-8') as f:
        redirects = {}
        line = f.readline()
        while line != '':   
            splitted = line.replace("\n","").split('","')
            first,second = splitted[0],splitted[1]
            first = first[1:].lower().replace("_"," ").strip()
            second = second[:-1].lower().replace("_"," ").strip()

            if first!=second:
                redirects[first] = second
            line = f.readline()
    print("Redirects length {}".format(len(redirects)))
    
    db.write_entities(entities,redirects)


def write_mentions(db, tagme_location="data/all_tagme.json",blink_location="data/all_blink.json",nel_location="data/all_nel.json"):
    with open(tagme_location) as f:
        mentions = json.load(f)
    db.write_mentions_character(mentions, "tagme")

    with open(blink_location) as f:
        mentions = json.load(f)
    db.write_mentions_character(mentions, "blink")

    with open(nel_location) as f:
        mentions = json.load(f)
    db.write_mentions_character(mentions, "nel")



@click.command()
def main():
    db = Database(find_questions=False)
    db.create_all()

    log.info("Writing entities")
    write_entities(db)

    log.info("Writing mentions")
    write_mentions(db)

    log.info("Writing questions")
    write_questions(db)



if __name__ == "__main__":
    main()
