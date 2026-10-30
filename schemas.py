from pydantic import BaseModel,EmailStr,Field
from datetime import date
from datetime import datetime
from typing import Optional

class LoginRequest(BaseModel):
    email:EmailStr
    password:str

class TokenResponse(BaseModel):
    access_token:str
    token_type:str

class UserCreate(BaseModel):
    name:str= Field(min_length=2,max_length=100)
    email: EmailStr
    password:str=Field(min_length=6,max_length=100)
    date_of_birth: date


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    date_of_birth: Optional[date] = None
    role: str = "candidate"

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email:EmailStr
    password:str

class LoginResponse(BaseModel):
    message:str
    user_id:int
    name:str
    email:EmailStr
    access_token:str
    token_type:str

class StartInterviewRequest(BaseModel):
    user_id: int


class AnswerRequest(BaseModel):
    session_id: int
    answer: str

class CandidateReport(BaseModel):

    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True


class AnswerReport(BaseModel):

    question_id: int
    question: str
    expected_answer: str
    candidate_answer: str
    ai_score: int
    feedback: str
    followup_count: int


class InterviewReport(BaseModel):

    session_id: int

    candidate: CandidateReport

    score: int
    percentage: float

    status: str

    started_at: datetime
    completed_at: datetime | None

    answers: list[AnswerReport]