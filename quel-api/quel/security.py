from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Depends, HTTPException
from fastapi import APIRouter
from quel.database import Database
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
from security_config import *


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token/")
print(oauth2_scheme)


db = Database()
router = APIRouter()

def create_access_token(*, data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def hash_function(password):
    return "fakehashed"+password

def decode_token(token):
    return token 

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

def authenticate_user(username,password):   
    hashed_password = db.get_password(username)
    if not hashed_password:
        return False
    return verify_password(password,hashed_password)

@router.get("/users/me")
async def read_users_me(current_user: str = Depends(get_current_active_user)):
    print("ME!")
    return current_user


@router.post("/")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form_data.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
