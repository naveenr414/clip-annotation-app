FROM python:3.7

RUN apt update
RUN mkdir -p /app/src
WORKDIR /app/src
ADD requirements.txt /app/src/requirements.txt
RUN pip install -r requirements.txt