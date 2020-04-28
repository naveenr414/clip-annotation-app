from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Depends, HTTPException
from fastapi import APIRouter
from quel.database import Database

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

db = Database()
router = APIRouter()

def hash_function(password):
    return "fakehashed"+password

def decode_token(token):
    return db.get_password(token)

def insert_email_password(email,password):
    return db.insert_email_password(email,hash_function(password))

async def get_current_user(token: str = Depends(oauth2_scheme)):
    print("Token {}".format(token))
    user = decode_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

async def get_current_active_user(current_user: str = Depends(get_current_user)):
    return current_user

@router.get("/users/me")
async def read_users_me(current_user: str = Depends(get_current_active_user)):
    return current_user


@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    password = db.get_password(form_data.username)
    if not password:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    hashed_password = hash_function(form_data.password)
    if not hashed_password == password:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    print("Logged in!")
    return {"access_token": form_data.username.lower(), "token_type": "bearer"}
