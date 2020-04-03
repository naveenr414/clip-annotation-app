from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

import paste
import qanta


app = FastAPI()
origins = [
    "http://localhost:8000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*","POST"],
    allow_headers=["*","POST"],
)

app.include_router(paste.router, prefix='/api/paste/v1')
app.include_router(qanta.router, prefix='/api/qanta/v1')
