# Instructions for Backend Web API

## Downloading data

Download the following files to `data/` from [datasets.qanta.org](http://datasets.qanta.org)

* [`qanta.2018.04.18.sqlite3`](https://s3-us-west-2.amazonaws.com/pinafore-us-west-2/qanta-jmlr-datasets/qanta.2018.04.18.sqlite3)
* [`qanta.mapped.2018.04.18.json`](https://s3-us-west-2.amazonaws.com/pinafore-us-west-2/qanta-jmlr-datasets/qanta.mapped.2018.04.18.json)

## Preprocessing

To preprocess the data for the web api, follow these instructions

## Running

To run the web API do:

```bash
$ poetry install
$ poetry run uvicorn quel.web:app --reload
```
