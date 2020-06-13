FROM python:3.7

RUN pip install poetry
RUN mkdir /app
WORKDIR /app
VOLUME /app/data

COPY pyproject.toml poetry.lock /app/
RUN poetry install

EXPOSE 8000

COPY . /app

CMD ["poetry", "run", "uvicorn", "quel.web:app", "--host", "0.0.0.0", "--port", "8000"]