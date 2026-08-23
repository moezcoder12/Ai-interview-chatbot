from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi import HTTPException

class InterviewException(Exception):
    def __init__(self, message:str):
        self.message=message

async def interview_exception_handler(
        reuest:Request,
        exc:InterviewException
):
    return JSONResponse(
        status_code=400,
        content={
            "success":False,
            "message":exc.message
        }
    )
async def http_exception_handler(
        request:Request,
        exc:HTTPException
):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success":False,
            "message":exc.detail
        }
    )
async def global_exception_handler(
        request:Request,
        exc:Exception
):
    return JSONResponse(
        status_code=500,
        content={
            "success":False,
            "message":"Internal Server Error"
        }
    )

