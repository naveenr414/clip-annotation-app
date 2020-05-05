import json

from quel.populate import merge_question_sentences


def test_merge_question_sentences():
    with open("tests/fixtures/question_2.json") as f:
        question = json.load(f)

    with open("tests/fixtures/qanta_tokenized.json") as f:
        sentences = json.load(f)["sentences"]

    tokens = merge_question_sentences(question["tokenizations"], sentences)

    print(tokens)
    text = question["text"]
    for t in tokens:
        start = t["start"]
        end = t["end"]
        assert t["text"] == text[start:end]
