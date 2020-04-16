from database import Question, Database, Entity, Mention
import json
import html


def write_tokens(token_file, database):
    conn = sqlite3.connect(database)
    c = conn.cursor()

    tokens = json.loads(open(token_file).read())
    by_qanta_id = {}

    all_sentences = tokens["sentences"]
    for sent in all_sentences:
        if sent["qanta_id"] not in by_qanta_id:
            by_qanta_id[sent["qanta_id"]] = []
        by_qanta_id[sent["qanta_id"]].append(sent["tokens"])
    for qanta_id in by_qanta_id:
        c.execute(
            "UPDATE QUESTIONS SET TOKENS=? WHERE QANTA_ID=?",
            [json.dumps(by_qanta_id[qanta_id]), qanta_id],
        )
        if qanta_id % 1000 == 0:
            print(qanta_id)
    conn.commit()
    conn.close()


def write_entities(entity_location, database):
    conn = sqlite3.connect(database)
    c = conn.cursor()

    c.execute("CREATE TABLE ENTITIES (NAME TEXT, LINK TEXT)")

    entities = json.loads(open(entity_location).read())
    total_entities = len(entities)

    on = 0
    written = 0

    for i in entities:
        name = html.unescape(i.replace("_", " "))
        name = name.lower()

        c.execute("INSERT OR IGNORE INTO ENTITIES (NAME,LINK) VALUES (?,?)", [name, i])
        on += 1

        if on % 1000 == 0:
            print(on, total_entities)
    conn.commit()
    conn.close()


def write_mentions(mention_location, database):
    conn = sqlite3.connect(database)
    c = conn.cursor()

    mentions = json.loads(open(mention_location).read())
    for mention in mentions:
        question_id = mention["qanta_id"]

        for sentence in mention["mentions"]:
            for entity in sentence:
                start = entity["span"][0]
                end = entity["span"][1]
                score = entity["score"]
                name = entity["entity"].replace("_", " ")
                c.execute(
                    "INSERT INTO MENTIONS (ENTITY,QUESTION_ID,START,END,EDITED,SCORE) VALUES (?,?,?,?,0,?)",
                    [name, question_id, start, end, score],
                )
    conn.commit()
    conn.close()
