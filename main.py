from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from fastapi import FastAPI,Path
from pydantic import BaseModel,Field
from typing import Annotated
from dotenv import load_dotenv
import json
import os
import uuid
load_dotenv(".env")
API_KEY=os.getenv("OPENROUTER_API_KEY")

model=ChatOpenAI(
    api_key=API_KEY,
    base_url="https://openrouter.ai/api/v1",
    model="meta-llama/llama-3.3-70b-instruct"
)
app=FastAPI()
parser=JsonOutputParser()

prompt = PromptTemplate(
    template="""
You are an AI Interviewer.

Question:
{question}

Expected Answer:
{expected_answer}

Candidate Answer:
{candidate_answer}

Evaluate the candidate answer.

Rules:
1. Return ONLY valid JSON.
2. Use EXACTLY these keys:
   - correct (boolean)
   - score (integer from 0 to 10)
   - feedback (string)

Example:
{{
    "correct": true,
    "score": 10,
    "feedback": "Good answer"
}}
""",
    input_variables=[
        "question",
        "expected_answer",
        "candidate_answer"
    ]
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
sessions={}

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

class AnswerRequest(BaseModel):
    session_id:str
    answer:str

@app.post('/submit-answer')
def submit_answer(request: AnswerRequest):

    if request.session_id not in sessions:
        return {'message': 'Invalid session'}

    session = sessions[request.session_id]
    current_question = session["current_question"]

    for question in iq_questions:

        if question.id == current_question:

            try:
                response = chain.invoke({
                    "question": question.question,
                    "expected_answer": question.answer,
                    "candidate_answer": request.answer
                })
            except Exception as e:
                return {
                    "message": "AI evaluation failed",
                    "error": str(e)
    }
            print(response)
            print(type(response))
            print(response.keys())
            score = min(response["score"], question.marks)
            if response["correct"]:
                session["score"] += question.marks
            session["current_question"] += 1
                
            if session["current_question"] > len(iq_questions):
                return {
                    "message": "Interview Completed",
                    "correct": response["correct"],
                    "feedback": response["feedback"],
                    "total_score": session["score"]
                }
                
            next_question = iq_questions[session["current_question"] - 1]

            return {
                "correct": response["correct"],
                "feedback": response["feedback"],
                "total_score": session["score"],
                "next_question": {
                    "id": next_question.id,
                    "question": next_question.question,
                    "marks": next_question.marks
                }
            }
    return {"message": "Question not found"}
@app.post('/start-interview')
def start_interview():
    session_id=str(uuid.uuid4())
    sessions[session_id]={
        "current_question":1,
        "score":0
    }
    return {
        "session_id":session_id,
        "question":{
            "id":iq_questions[0].id,
            "question":iq_questions[0].question,
            "marks":iq_questions[0].marks
        }
    }

print ("My name is Moez UL Islam")