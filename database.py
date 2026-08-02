from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,declarative_base
import os

from dotenv import load_dotenv

load_dotenv(".env")

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)
engine = create_engine(DATABASE_URL,echo=True)

SessionLocal = sessionmaker(autoflush=False,autocommit=False,bind=engine)

Base=declarative_base()