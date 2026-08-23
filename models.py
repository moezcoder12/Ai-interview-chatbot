from sqlalchemy import Column, Integer, String, Date, TIMESTAMP, text, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    date_of_birth = Column(Date)
    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    interviews = relationship(
    "InterviewSession",
    back_populates="user",
    cascade="all, delete"
    )


class InterviewSession(Base):

    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)

    user_id = Column(Integer,ForeignKey("users.id",ondelete="CASCADE"))

    score = Column(Integer,default=0,nullable=False)

    started_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )

    completed_at = Column(TIMESTAMP)
    current_question = Column(Integer, default=1)

    followup_count = Column(Integer, default=0)

    last_feedback = Column(String(1000), default="")

    last_followup = Column(String(1000), default="")

    status = Column(String(20),default="In Progress")

    user = relationship(
    "User",
    back_populates="interviews"
    )

    answers = relationship(
        "Answer",
        back_populates="session",
        cascade="all, delete"
    )


class Answer(Base):

    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, autoincrement=True)

    session_id = Column(Integer,ForeignKey("interview_sessions.id",ondelete="CASCADE"))

    question_id = Column(Integer)

    candidate_answer = Column(String(1000),nullable=False)

    ai_score = Column(Integer)

    feedback = Column(String(1000),nullable=False)

    followup_count = Column(Integer)


    session = relationship(
    "InterviewSession",
    back_populates="answers"
    )