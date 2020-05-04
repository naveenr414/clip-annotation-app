from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from quel import entity
from quel import qanta
from quel import security


app = FastAPI()
origins = [
    "http://localhost:8000",
    "http://localhost:3000",
    "http://localhost:2020",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex="https://.*\.ngrok\.io",
    allow_credentials=True,
    allow_methods=["*", "POST"],
    allow_headers=["*", "POST"],
)

app.include_router(entity.router, prefix="/api/entity/v1")
app.include_router(qanta.router, prefix="/api/qanta/v1")
app.include_router(security.router, prefix="/token")
