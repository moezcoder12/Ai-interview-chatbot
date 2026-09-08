from sqlalchemy.orm import Session
from sqlalchemy import func
from schemas import InterviewReport, CandidateReport, AnswerReport

from models import User , InterviewSession , Answer

def create_user(
    db:Session,
    name:str,
    email:str,
    password:str,
    date_of_birth
):
    user=User(
        name=name,
        email=email,
        password=password,
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

def get_interview_report(db: Session, session_id: int):

    return (
        db.query(InterviewSession)
        .filter(
            InterviewSession.id == session_id
        )
        .first()
    )

def get_answers_by_session(db: Session, session_id: int):
    return (
        db.query(Answer)
        .filter(
            Answer.session_id == session_id
        )
        .order_by(Answer.question_id)
        .all()
    )
def generate_report(db: Session, session_id: int, iq_questions: list):

    interview = get_interview_report(db, session_id)

    if interview is None:
        return None

    user = interview.user

    answers = get_answers_by_session(
        db,
        session_id
    )

    answer_reports = []

    for answer in answers:

        question = next(
            (
                q for q in iq_questions
                if q.id == answer.question_id
            ),
            None
        )

        answer_reports.append(
            AnswerReport(
                question_id=answer.question_id,
                question=question.question if question else "",
                expected_answer=question.answer if question else "",
                candidate_answer=answer.candidate_answer,
                ai_score=answer.ai_score,
                feedback=answer.feedback,
                followup_count=answer.followup_count
            )
        )

    percentage = (
        interview.score / 100
    ) * 100

    return InterviewReport(
        session_id=interview.id,

        candidate=CandidateReport(
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

def get_all_interviews(
    db: Session
):
    return (
        db.query(InterviewSession)
        .order_by(InterviewSession.id.desc())
        .all()
    )
def delete_user(
    db: Session,
    user_id: int
):

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        return None

    db.delete(user)
    db.commit()

    return user