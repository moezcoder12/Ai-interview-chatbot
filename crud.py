from sqlalchemy.orm import Session
from sqlalchemy import func

from models import User , InterviewSession , Answer

def create_user(
    db:Session,
    name:str,
    email:str,
    date_of_birth
):
    user=User(
        name=name,
        email=email,
        date_of_birth=date_of_birth
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

def get_user_by_email(
        db:Session,
        email:str
):
    return (
        db.query(User)
        .filter(User.email==email)
        .first()
    )

def create_interview_session(
        db:Session,
        user_id:int
):
    session=InterviewSession(
        user_id=user_id,
        score=0,
        status="In Progress"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def save_answer(
        db:Session,
        session_id:int,
        question_id:int,
        candidate_answer:str,
        ai_score:int,
        feedback:str,
        followup_count:int
):
    answer=Answer(
        session_id=session_id,
        question_id=question_id,
        candidate_answer=candidate_answer,
        ai_score=ai_score,
        feedback=feedback,
        followup_count=followup_count
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)
    return answer

def complete_interview(
    db: Session,
    session_id: int,
    final_score: int
    ):
    interview = (
        db.query(InterviewSession)
        .filter(InterviewSession.id == session_id)
        .first()
    )

    if interview is None:
        return None

    interview.score = final_score
    interview.status = "Completed"
    interview.completed_at = func.now()

    db.commit()
    db.refresh(interview)

    return interview

def get_interview_session(
    db: Session,
    session_id: int
    ):
    return (
        db.query(InterviewSession)
        .filter(InterviewSession.id == session_id)
        .first()
    )