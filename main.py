from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from fastapi import FastAPI,Path
from pydantic import BaseModel,Field
from typing import Annotated
from dotenv import load_dotenv
from database import engine,SessionLocal
from sqlalchemy.orm import Session
from fastapi import Depends
import crud
import schemas
import models
import os
load_dotenv(".env")
API_KEY=os.getenv("OPENROUTER_API_KEY")

models.Base.metadata.create_all(bind=engine)

model=ChatOpenAI(
    api_key=API_KEY,
    base_url="https://openrouter.ai/api/v1",
    model="meta-llama/llama-3.3-70b-instruct"
)
app=FastAPI()
parser=JsonOutputParser()

def get_db():
    db=SessionLocal()
    try:
        yield db

    finally:
        db.close()


prompt = PromptTemplate(
    template="""
You are an AI Interviewer.

Question:
{question}

Expected Answer:
{expected_answer}

Candidate Answer:
{candidate_answer}

Previous Feedback:
{previous_feedback}

Previous Followup Question:
{followup_question}

Followup Attempts:
{followup_count}

Evaluate the answer.

Return ONLY JSON.

{{
    "correct": true,
    "score": 10,
    "feedback": "...",
    "needs_followup": false,
    "followup_question": ""
}}

Rules:

If the answer is incomplete but partially correct:

correct=false

needs_followup=true

Generate ONE follow-up question.

If answer is completely correct:

correct=true

needs_followup=false

followup_question=""

If followup_count is 2 or greater:

- Do NOT generate another follow-up question.
- Set needs_followup to false.
- Evaluate the final answer and give the final score.
"""
)

chain= prompt|model|parser

class Question(BaseModel):
    id: Annotated[int,Field(...,description="Id of the question",examples=[1, 3, 4])]
    question: Annotated[str,Field(...,description="Question text")]
    answer:Annotated[str,Field(...,description='Answer of the given question.')]
    marks:Annotated[int,Field(...,description='Obtained marks of the questions')]

iq_questions=[
    Question(
    id=1,
    question='At the end of the concert, 10 people greet each other. How many times will they greet each other?',
    answer='45',
    marks=10
),
Question(
    id=2,
    question='How much is half a quarter one tenth of 400?',
    answer='5',
    marks=10
),
Question(
    id=3,
    question='For every Christmas since Vanyas birth, his parents deposit as many coins into as he is old. Now there are 21 coins in the bank. How old is Vanya?',
    answer='6',
    marks=10
),
Question(
    id=4,
    question='7 candles were burning. 3 of them were extinguished. How many candles are left?',
    answer='7',
    marks=10
),
Question(
    id=5,
    question='The length of the fish head is 9 centimeters, the tail is the sum of the lengths of the head and half of the body, the body is the sum of the lengths of the tail and head. Can you tell the length of the fish in cm?',
    answer='72',
    marks=10
),
Question(
    id=6,
    question='''What is the missing number? 
    3, 10, 21, __, 73''',
    answer='52',
    marks=10
),
Question(
    id=7,
    question='Which car wheel does not spin when making a right turn?',
    answer='Spare',
    marks=10
),
Question(
    id=8,
    question='''Odd One Out
    Question:
    Apple, Banana, Mango, Carrot, Orange''',
    answer='Carrot',
    marks=10
),
Question(
    id=9,
    question='''What letter comes next in the sequence?
    A, C, F, J, O, ?''',
    answer='U',
    marks=10
),
Question(
    id=10,
    question='''A fair coin is tossed twice.
    What is the probability of getting heads on both tosses?''',
    answer='1/4',
    marks=10
)
]

@app.get('/questions/{question_id}')
def get_question(question_id:int=Path(...,gt=0)):
    for question in iq_questions:
        if question.id == question_id:
            return {
                'id':question.id,
                'question':question.question,
                'marks':question.marks
            }
    return {'message':'Question not found.'}


@app.post('/submit-answer')
def submit_answer(
    request:schemas.AnswerRequest,
    db:Session=Depends(get_db)
    ):
    interview = crud.get_interview_session(
    db=db,
    session_id=request.session_id
    )

    if interview is None:
     return {
        "message": "Interview not found."
    }

    current_question = interview.current_question

    for question in iq_questions:

        if question.id == current_question:

            try:
                response = chain.invoke({
                    "question": question.question,
                    "expected_answer": question.answer,
                    "candidate_answer": request.answer,
                    "previous_feedback": interview.last_feedback,
                    "followup_question": interview.last_followup,
                    "followup_count":interview.followup_count
                })
            except Exception as e:
                return {
                    "message": "AI evaluation failed",
                    "error": str(e)
    }
            
            if response["needs_followup"]:

                interview.last_feedback = response["feedback"]
                interview.last_followup = response["followup_question"]

                if interview.followup_count >= 2:

                    interview.followup_count = 0

                else:

                    interview.followup_count += 1

                    db.commit()
                    db.refresh(interview)

                    return {
                        "correct": False,
                        "feedback": response["feedback"],
                        "followup_question": response["followup_question"]
                    }
            if response["correct"]:
                interview.score += min(response["score"], question.marks)
            crud.save_answer(
            db=db,
            session_id=interview.id,
            question_id=question.id,
            candidate_answer=request.answer,
            ai_score=response["score"],
            feedback=response["feedback"],
            followup_count=interview.followup_count
            )
            interview.last_feedback = ""
            interview.last_followup = ""
            interview.followup_count = 0
            interview.current_question += 1

            db.commit()
            db.refresh(interview)
                
            if interview.current_question > len(iq_questions):
                crud.complete_interview(
                db=db,
                session_id=interview.id,
                final_score=interview.score
                )
                return {
                    "message": "Interview Completed",
                    "correct": response["correct"],
                    "feedback": response["feedback"],
                    "total_score": interview.score
                }
                
            next_question = iq_questions[interview.current_question - 1]

            return {
                "correct": response["correct"],
                "feedback": response["feedback"],
                "total_score": interview.score,
                "next_question": {
                    "id": next_question.id,
                    "question": next_question.question,
                    "marks": next_question.marks
                }
            }
    return {"message": "Question not found"}
@app.post('/start-interview')
def start_interview(
    request:schemas.StartInterviewRequest,
    db:Session=Depends(get_db)
    ):
    user = (
    db.query(models.User)
    .filter(models.User.id == request.user_id)
    .first()
    )

    if user is None:
        return {
            "message": "User not found."
        }
    interview = crud.create_interview_session(
        db=db,
        user_id=request.user_id
    )
    return {
        "session_id":interview.id,
        "question":{
            "id":iq_questions[0].id,
            "question":iq_questions[0].question,
            "marks":iq_questions[0].marks
        }
    }
@app.post("/users")
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
    ):

    existing_user = crud.get_user_by_email(db, user.email)

    if existing_user:
        return {
            "message": "Email already exists."
        }

    new_user = crud.create_user(
        db=db,
        name=user.name,
        email=user.email,
        date_of_birth=user.date_of_birth
    )

    return {
        "message": "User created successfully.",
        "user": new_user
    }