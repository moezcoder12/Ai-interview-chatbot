from langchain_openai import ChatOpenAI
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from voice.speech_to_text import transcribe_audio
from voice.text_to_speech import speak
from pydantic import BaseModel,Field
from typing import Annotated
from dotenv import load_dotenv
from database import engine,SessionLocal,get_db
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends,HTTPException,UploadFile,File,Path,FastAPI,status
from exceptions import (
    InterviewException,
    interview_exception_handler,
    http_exception_handler,
    global_exception_handler
)
from security import hash_password
from schemas import LoginRequest,TokenResponse
from security import verify_password,create_access_token,verify_access_token
import crud
import schemas
import models
import os
load_dotenv(".env")
API_KEY=os.getenv("OPENAI_API_KEY")

models.Base.metadata.create_all(bind=engine)

model=ChatOpenAI(
    api_key=API_KEY,
    model="gpt-5.6-terra"
)
app=FastAPI()
oauth2_scheme=OAuth2PasswordBearer(tokenUrl="login")
app.add_exception_handler(
    InterviewException,
    interview_exception_handler
)
app.add_exception_handler(
    HTTPException,
    http_exception_handler
)
app.add_exception_handler(
    Exception,
    global_exception_handler
)
parser=JsonOutputParser()

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    payload = verify_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user_id = payload.get("user_id")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user

def get_current_admin(
        current_user:models.User=Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
    return current_user

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
def evaluate_candidate(
    question,
    candidate_answer,
    previous_feedback="",
    followup_question="",
    followup_count=0
):

    response = chain.invoke({
        "question": question.question,
        "expected_answer": question.answer,
        "candidate_answer": candidate_answer,
        "previous_feedback": previous_feedback,
        "followup_question": followup_question,
        "followup_count": followup_count
    })

    return response

def process_answer(session_id: int,answer: str,db: Session):
    interview = crud.get_interview_session(
        db=db,
        session_id=session_id
    )
    if interview is None:
        raise HTTPException(status_code=404,detail="Interview not found")
    current_question = interview.current_question
    for question in iq_questions:

        if question.id != current_question:
            continue

        response = evaluate_candidate(
            question=question,
            candidate_answer=answer,
            previous_feedback=interview.last_feedback,
            followup_question=interview.last_followup,
            followup_count=interview.followup_count
        )
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
            interview.score += min(
                response["score"],
                question.marks
            )

        crud.save_answer(
            db=db,
            session_id=interview.id,
            question_id=question.id,
            candidate_answer=answer,
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

        next_question = iq_questions[
            interview.current_question - 1
        ]

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

    raise HTTPException(status_code=404,detail="Question not found")

def build_interview_report(
    interview,
    answers,
    user
    ):

    answer_reports = []

    for answer in answers:

        question = iq_questions[
            answer.question_id - 1
        ]

        answer_reports.append(

            schemas.AnswerReport(
                question_id=question.id,
                question=question.question,
                expected_answer=question.answer,
                candidate_answer=answer.candidate_answer,
                ai_score=answer.ai_score,
                feedback=answer.feedback,
                followup_count=answer.followup_count
            )
        )

    percentage = round(
        (interview.score / 100) * 100,
        2
    )

    report = schemas.InterviewReport(

        session_id=interview.id,

        candidate=schemas.CandidateReport(
            id=user.id,
            name=user.name,
            email=user.email
        ),

        score=interview.score,
        percentage=percentage,

        status=interview.status,

        started_at=interview.started_at,
        completed_at=interview.completed_at,

        answers=answer_reports
    )

    return report

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
    raise HTTPException(status_code=404,detail="Question not found")

@app.get("/me", response_model=schemas.UserResponse)
def get_me(
    current_user: models.User = Depends(get_current_user)
):
    return current_user

@app.post("/login", response_model=schemas.LoginResponse)
def login(
    data: schemas.LoginRequest,
    db: Session = Depends(get_db)
):
    user = crud.get_user_by_email(
        db,
        data.email
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token({
        "user_id": user.id,
        "email": user.email
    })

    return {
        "message": "Login successful",
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "access_token": access_token,
        "token_type": "bearer"
    }


@app.post("/submit-answer")
def submit_answer(
    request: schemas.AnswerRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    interview = crud.get_interview_session(
        db=db,
        session_id=request.session_id
    )

    if interview is None:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found"
        )

    if interview.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to access this interview"
        )

    return process_answer(
        session_id=request.session_id,
        answer=request.answer,
        db=db
    )
@app.post("/submit-audio")
async def submit_audio(session_id: int, audio: UploadFile = File(...), db: Session = Depends(get_db)):

    os.makedirs("recordings", exist_ok=True)

    audio_path = f"recordings/{audio.filename}"

    with open(audio_path, "wb") as f:
        f.write(await audio.read())
    transcript = transcribe_audio(audio_path)

    if os.path.exists(audio_path):
        os.remove(audio_path)
    result = process_answer(
    session_id=session_id,
    answer=transcript,
    db=db
    )
    if "feedback" in result:
        await speak(result["feedback"])

    if "next_question" in result:

        next_q = result["next_question"]["question"]

        await speak(next_q)
    return {
        "transcript": transcript,
        "result": result
    }
@app.post("/start-interview")
async def start_interview(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    interview = crud.create_interview_session(
        db=db,
        user_id=current_user.id
    )

    question_text = iq_questions[0].question

    await speak(question_text)

    return {
        "session_id": interview.id,
        "question": {
            "id": iq_questions[0].id,
            "question": iq_questions[0].question,
            "marks": iq_questions[0].marks
        }
    }
@app.post("/users")
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db)
    ):

    existing_user = crud.get_user_by_email(
        db,
        user.email
    )

    if existing_user:
        return {
            "message": "Email already exists."
        }

    hashed_password = hash_password(user.password)

    new_user = crud.create_user(
        db=db,
        name=user.name,
        email=user.email,
        password=hashed_password,
        date_of_birth=user.date_of_birth
    )

    return {
        "message": "User created successfully.",
        "user": new_user
    }
@app.get(
    "/report/{session_id}",
    response_model=schemas.InterviewReport
)
def get_report(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    interview = crud.get_interview_session(
        db=db,
        session_id=session_id
    )

    if interview is None:
        raise HTTPException(
            status_code=404,
            detail="Interview session not found"
        )

    if interview.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to access this interview"
        )

    if interview.status != "Completed":
        raise HTTPException(
            status_code=400,
            detail="Interview is not completed yet."
        )

    return crud.generate_report(
        db=db,
        session_id=session_id,
        iq_questions=iq_questions
    )

@app.get("/admin/interviews")
def get_all_interviews(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):

    interviews = crud.get_all_interviews(db)

    results = []

    for interview in interviews:

        user = interview.user

        results.append({
            "session_id": interview.id,
            "candidate": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            },
            "score": interview.score,
            "status": interview.status,
            "started_at": interview.started_at,
            "completed_at": interview.completed_at
        })

    return results

@app.get(
    "/admin/interviews/{session_id}",
    response_model=schemas.InterviewReport
)
def admin_interview_report(
    session_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):

    report = crud.generate_report(
        db=db,
        session_id=session_id,
        iq_questions=iq_questions
    )

    if report is None:
        raise HTTPException(
            status_code=404,
            detail="Interview not found"
        )

    return report

@app.delete("/admin/candidates/{user_id}")
def delete_candidate(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):

    if user_id == current_admin.id:
        raise HTTPException(
            status_code=400,
            detail="Admin cannot delete itself"
        )

    user = crud.delete_user(
        db=db,
        user_id=user_id
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )

    return {
        "message": "Candidate deleted successfully",
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }