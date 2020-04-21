import os
import sys
import subprocess

import click


S3_PATH = "https://s3-us-west-2.amazonaws.com/pinafore-us-west-2/qanta-jmlr-datasets/"
FILES = [
    (S3_PATH + "qanta.2018.04.18.sqlite3", "data/qanta.2018.04.18.sqlite3"),
    (S3_PATH + "qanta.mapped.2018.04.18.json", "data/qanta.mapped.2018.04.18.json"),
    (
        S3_PATH + "wikipedia/wikipedia-titles.2018.04.18.json",
        "data/wikipedia/wikipedia-titles.2018.04.18.json",
    ),
    (S3_PATH + "qanta.mapped.2018.04.18.json", "data/qanta.mapped.2018.04.18.json"),
]


def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)


def download(remote_file: str, local_file: str):
    eprint(f"Downloading {remote_file} to {local_file}")
    subprocess.run(
        f"curl -f --create-dirs -o {local_file} {remote_file}", shell=True, check=True
    )


def download_all(overwrite=False):
    os.makedirs("data/", exist_ok=True)
    for remote_file, local_file in FILES:
        if os.path.exists(local_file):
            if overwrite:
                download(remote_file, local_file)
            else:
                eprint(f"File exists, skipping download of: {local_file}")
        else:
            download(remote_file, local_file)


@click.command()
@click.option("--overwrite-data", default=False, is_flag=True, type=bool)
def cli(overwrite_data: bool):
    download_all(overwrite=overwrite_data)


if __name__ == "__main__":
    cli()  # pylint: disable=no-value-for-parameter
