from datetime import datetime,timedelta, timezone

from argon2 import PasswordHasher
from argon2.exceptions import VerificationError,VerifyMismatchError
from jose import jwt
from dotenv import load_dotenv
import os
load_dotenv(".env")
SECRET_KEY=os.getenv("SECRET_KEY")
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES= 60

# Password Hashing
password_hasher=PasswordHasher()

def hash_password(password:str)->str:

    return password_hasher.hash(password)

def verify_password(plain_password:str,hashed_password:str)->bool:
    try:
        return password_hasher.verify(hashed_password,plain_password)
    except (VerifyMismatchError,VerificationError):
        return False

# Jwt token generation

def create_access_token(data:dict,expires_delta:timedelta|None=None)->str:
    to_encode=data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = (
            datetime.now(timezone.utc)
            + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )

    to_encode.update({
        "exp": expire
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def verify_access_token(token: str) -> dict | None:

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except Exception:
        return None