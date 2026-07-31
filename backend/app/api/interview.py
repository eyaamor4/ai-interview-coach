from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import (
    require_candidate,
    require_recruiter,
)
from app.models.user import User
from app.schemas.interview import (
    AnswerRequest,
    AnswerResponse,
    DashboardResponse,
    InterviewHistoryItem,
    InterviewRequest,
    InterviewResponse,
    RecruiterDashboardResponse,
)
from app.services.interview_service import interview_service


router = APIRouter(
    prefix="/interviews",
    tags=["Interviews"],
)


# ==========================
# Démarrer un entretien
# ==========================
@router.post(
    "/start",
    response_model=InterviewResponse,
)
def create_interview(
    data: InterviewRequest,
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db),
) -> InterviewResponse:
    return interview_service.start_interview(
        data=data,
        candidate_id=current_user.id,
        db=db,
    )


# ==========================
# Répondre à une question
# ==========================
@router.post(
    "/{interview_id}/answer",
    response_model=AnswerResponse,
)
def submit_answer(
    interview_id: str,
    data: AnswerRequest,
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db),
) -> AnswerResponse:
    try:
        result = interview_service.submit_answer(
            interview_id=interview_id,
            answer=data.answer,
            candidate_id=current_user.id,
            db=db,
        )

    except ValueError as error:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Interview not found.",
        )

    return result


# ==========================
# Historique du candidat
# ==========================
@router.get(
    "",
    response_model=list[InterviewHistoryItem],
)
def get_interviews(
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db),
) -> list[InterviewHistoryItem]:
    return interview_service.get_interviews(
        candidate_id=current_user.id,
        db=db,
    )


# ==========================
# Dashboard du candidat
# ==========================
@router.get(
    "/dashboard",
    response_model=DashboardResponse,
)
def get_dashboard(
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db),
) -> DashboardResponse:
    return interview_service.get_dashboard(
        candidate_id=current_user.id,
        db=db,
    )

# ==========================
# Dashboard du recruteur
# ==========================
@router.get(
    "/recruiter/dashboard",
    response_model=RecruiterDashboardResponse,
)
def recruiter_dashboard(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db),
) -> RecruiterDashboardResponse:
    return interview_service.get_recruiter_dashboard(
        db=db,
    )

# ==========================
# Détails d'un entretien pour le recruteur
# ==========================
@router.get("/recruiter/{interview_id}")
def get_recruiter_interview(
    interview_id: str,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db),
) -> dict:
    try:
        interview = (
            interview_service.get_recruiter_interview(
                interview_id=interview_id,
                db=db,
            )
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    if interview is None:
        raise HTTPException(
            status_code=404,
            detail="Interview not found.",
        )

    return interview
# ==========================
# Détails d'un entretien
# ==========================
@router.get("/{interview_id}")
def get_interview(
    interview_id: str,
    current_user: User = Depends(require_candidate),
    db: Session = Depends(get_db),
) -> dict:
    try:
        interview = interview_service.get_interview(
            interview_id=interview_id,
            candidate_id=current_user.id,
            db=db,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    if interview is None:
        raise HTTPException(
            status_code=404,
            detail="Interview not found.",
        )

    return interview