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


def write_entities(db, entity_location="data/all_wiki.json"):
    with open(entity_location) as f:
        entities = json.load(f)
    db.write_entities(entities)


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

def create_prefixes(wiki_location="data/all_wiki.json",redirect_location="data/all_wiki_redirects.csv"):
    f = json.loads(open("all_wiki.json").read())
    print("Loaded in f")
    without_description = [{'clean_name':i['clean_name'],'popularity':i["popularity"],'name':i["name"]} for i in f]
    print("Got clean name")

    def format_entity(entity):
        # &quot;, &amp;, &lt;, and &gt;
        entity = entity.lower().replace(" ","_")
        specials = ["&quot;","&amp;","&lt;","&gt;","&apos;"]
        actuals = ['"',"&","<",">","'"]
        for i in range(len(specials)):
            entity = entity.replace(specials[i],actuals[i])

        if entity in ["<unk_wid>"]:
            entity = "no_entity_found"
                   
        e = ""
        for i in entity:
            if ord(i)>255:
                e+="\\u"+("0000"+hex(ord(i))[2:])[-4:]
            else:
                e+=i
        return e


    g = open("all_wiki_redirects.csv",encoding='utf-8').read().split("\n")
    redirects = []
    for i in g:
        redirect,name = i.split(",")[0],i.split(",")[1]
        name = name[1:-1]
        redirect = redirect[1:-1]
        name = format_entity(name)
        redirects.append({'clean_name':unidecode(redirect.lower().replace("_"," ")),'name':name})

    without_description+=redirects
    def fast_search(l,prefix_num):
        start = time.time()
        prefixes = {}
        for num,info in enumerate(l):
            if num%10000 == 0:
                print("{} out of {}".format(num,len(l)))
            i = info["clean_name"]
            for j in range(len(i)-prefix_num+1):
                prefix = i[j:j+prefix_num]
                if prefix not in prefixes:
                    prefixes[prefix] = set()
                prefixes[prefix].add(num)
        print("Took {} time to init".format(time.time()-start))
        return prefixes
    prefixes = fast_search(without_description,3)
    w = open("quel/prefixes.p","w")
    w.write(pickle.dumps(prefixes))
    w.close()
    w = open("quel/wiki_pages.p","w")
    w.write(pickle.dumps(without_description))
    w.close()


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
