from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.interview import router as interview_router
from app.core.database import Base, engine
from app.models.answer import Answer
from app.models.evaluation import Evaluation
from app.models.interview import Interview
from app.models.question import Question
from app.models.user import User


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Interview Coach API",
    description="API pour générer et évaluer des entretiens techniques",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interview_router)
app.include_router(auth_router)


@app.get("/")
def home() -> dict[str, str]:
    return {
        "message": "AI Interview Coach API fonctionne correctement."
    }


@app.get("/health")
def health_check() -> dict[str, str]:
    return {
        "status": "healthy"
    }