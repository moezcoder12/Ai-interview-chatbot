from pydantic import BaseModel,EmailStr,Field
from datetime import date


class UserCreate(BaseModel):
    name:str= Field(min_length=2,max_length=100)
    email: EmailStr
    date_of_birth: date


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True


class StartInterviewRequest(BaseModel):
    user_id: int


class AnswerRequest(BaseModel):
    session_id: int
    answer: str