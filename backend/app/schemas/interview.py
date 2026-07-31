from datetime import datetime
from typing import List

from pydantic import BaseModel, EmailStr, Field


class InterviewRequest(BaseModel):
    job_title: str = Field(
        ...,
        examples=["AI Engineer"],
    )
    level: str = Field(
        ...,
        examples=["Junior"],
    )
    number_of_questions: int = Field(
        default=5,
        ge=1,
        le=20,
        examples=[5],
    )


class InterviewResponse(BaseModel):
    interview_id: str
    job_title: str
    level: str
    current_question: int
    question: str
    message: str


class InterviewHistoryItem(BaseModel):
    interview_id: str
    job_title: str
    level: str
    number_of_questions: int
    status: str
    final_score: float | None
    created_at: datetime


class DashboardLatestInterview(BaseModel):
    interview_id: str
    job_title: str
    level: str
    status: str
    final_score: float | None
    created_at: datetime

class DashboardScoreHistoryItem(BaseModel):
    interview_id: str
    job_title: str
    score: float
    created_at: datetime
    
class DashboardResponse(BaseModel):
    total_interviews: int
    completed_interviews: int
    in_progress_interviews: int
    average_score: float
    best_score: float | None
    latest_interview: DashboardLatestInterview | None
    score_history: List[DashboardScoreHistoryItem]


class AnswerRequest(BaseModel):
    answer: str = Field(
        ...,
        min_length=2,
        examples=[
            "Un CNN est adapté aux images car il extrait des caractéristiques spatiales."
        ],
    )


class AnswerEvaluation(BaseModel):
    score: float
    strengths: List[str]
    weaknesses: List[str]
    feedback: str


class AnswerResponse(BaseModel):
    interview_id: str
    question_number: int
    evaluation: AnswerEvaluation
    interview_completed: bool
    next_question: str | None = None
    final_score: float | None = None


class RecruiterCandidateResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: str


class RecruiterInterviewItem(BaseModel):
    interview_id: str
    job_title: str
    level: str
    number_of_questions: int
    status: str
    final_score: float | None
    created_at: datetime
    candidate: RecruiterCandidateResponse


class RecruiterDashboardResponse(BaseModel):
    total_candidates: int
    total_interviews: int
    completed_interviews: int
    in_progress_interviews: int
    average_score: float
    interviews: List[RecruiterInterviewItem]