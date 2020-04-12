from typing import Dict, Any, List
import json
import spacy
from spacy.tokens import Doc
import click
from tqdm import tqdm


Json = Dict[str, Any]


def load_questions(path: str) -> List[Json]:
    with open(path) as f:
        return [q for q in json.load(f)["questions"] if q["page"] is not None]


def extract_sentences(questions: List[Json]) -> List[Json]:
    sentences = []
    for q in questions:
        qanta_id = q["qanta_id"]
        sentence_tokenizations = q["tokenizations"]
        for idx, (start, end) in enumerate(sentence_tokenizations):
            text = q["text"][start:end]
            sentences.append(
                {
                    "text": text,
                    "start": start,
                    "end": end,
                    "qanta_id": qanta_id,
                    "sentence_idx": idx,
                }
            )
    return sentences


def write_tokenizations(sentences: List[Json], tokenized_sentences: List[Doc], out_path: str):
    for sent, tokenized in zip(sentences, tokenized_sentences):
        sent_tokens = []
        for token in tokenized:
            start = token.idx
            end = start + len(token)
            text = token.text
            sent_tokens.append({'text': text, 'start': start, 'end': end})
        sent['tokens'] = sent_tokens

    with open(out_path, 'w') as f:
        json.dump({'sentences': sentences}, f)


@click.command()
@click.argument('data_path')
@click.argument('out_path')
def main(data_path: str, out_path: str):
    questions = load_questions(path=data_path)
    sentences = extract_sentences(questions)
    nlp = spacy.load("en_core_web_sm")
    sentence_texts = [s["text"] for s in sentences]
    tokenized_sentences = list(
        nlp.pipe(tqdm(sentence_texts), n_process=-1, batch_size=512)
    )
    write_tokenizations(sentences, tokenized_sentences, out_path)


if __name__ == "__main__":
    main() # pylint: disable=no-value-for-parameter
