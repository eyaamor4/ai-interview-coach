from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.answer import Answer as AnswerModel
from app.models.evaluation import Evaluation as EvaluationModel
from app.models.interview import Interview as InterviewModel
from app.models.question import Question as QuestionModel

from app.schemas.interview import (
    AnswerEvaluation,
    AnswerResponse,
    DashboardLatestInterview,
    DashboardResponse,
    DashboardScoreHistoryItem,
    InterviewHistoryItem,
    InterviewRequest,
    InterviewResponse,
    RecruiterCandidateResponse,
    RecruiterDashboardResponse,
    RecruiterInterviewItem,
)
from app.services.llm_service import (
    evaluate_interview_answer,
    generate_interview_question,
)


class InterviewService:
    def start_interview(
        self,
        data: InterviewRequest,
        candidate_id: UUID,
        db: Session,
    ) -> InterviewResponse:
        question = generate_interview_question(
            job_title=data.job_title,
            level=data.level,
        )

        db_interview = InterviewModel(
            candidate_id=candidate_id,
            job_title=data.job_title,
            level=data.level,
            number_of_questions=data.number_of_questions,
            current_question=1,
            status="in_progress",
        )

        db.add(db_interview)
        db.flush()

        db_question = QuestionModel(
            interview_id=db_interview.id,
            question_text=question,
            question_number=1,
        )

        db.add(db_question)
        db.commit()

        db.refresh(db_interview)
        db.refresh(db_question)

        return InterviewResponse(
            interview_id=str(db_interview.id),
            job_title=db_interview.job_title,
            level=db_interview.level,
            current_question=db_interview.current_question,
            question=db_question.question_text,
            message="Interview started successfully.",
        )

    def get_interviews(
        self,
        candidate_id: UUID,
        db: Session,
    ) -> list[InterviewHistoryItem]:
        interviews = db.scalars(
            select(InterviewModel)
            .where(
                InterviewModel.candidate_id == candidate_id,
            )
            .order_by(
                InterviewModel.created_at.desc(),
            )
        ).all()

        return [
            InterviewHistoryItem(
                interview_id=str(interview.id),
                job_title=interview.job_title,
                level=interview.level,
                number_of_questions=interview.number_of_questions,
                status=interview.status,
                final_score=interview.final_score,
                created_at=interview.created_at,
            )
            for interview in interviews
        ]

    def get_dashboard(
        self,
        candidate_id: UUID,
        db: Session,
    ) -> DashboardResponse:
        interviews = db.scalars(
            select(InterviewModel)
            .where(
                InterviewModel.candidate_id == candidate_id,
            )
            .order_by(
                InterviewModel.created_at.desc(),
            )
        ).all()

        total_interviews = len(interviews)

        completed_interviews = sum(
            1
            for interview in interviews
            if interview.status == "completed"
        )

        in_progress_interviews = sum(
            1
            for interview in interviews
            if interview.status == "in_progress"
        )

        scores = [
            interview.final_score
            for interview in interviews
            if interview.final_score is not None
        ]

        average_score = (
            round(sum(scores) / len(scores), 2)
            if scores
            else 0.0
        )

        best_score = max(scores) if scores else None

        latest_interview_data = None

        if interviews:
            latest_interview = interviews[0]

            latest_interview_data = DashboardLatestInterview(
                interview_id=str(latest_interview.id),
                job_title=latest_interview.job_title,
                level=latest_interview.level,
                status=latest_interview.status,
                final_score=latest_interview.final_score,
                created_at=latest_interview.created_at,
            )

        score_history = [
            DashboardScoreHistoryItem(
                interview_id=str(interview.id),
                job_title=interview.job_title,
                score=interview.final_score,
                created_at=interview.created_at,
            )
            for interview in reversed(interviews)
            if interview.status == "completed"
            and interview.final_score is not None
        ]

        return DashboardResponse(
            total_interviews=total_interviews,
            completed_interviews=completed_interviews,
            in_progress_interviews=in_progress_interviews,
            average_score=average_score,
            best_score=best_score,
            latest_interview=latest_interview_data,
            score_history=score_history,
        )

    def get_interview(
        self,
        interview_id: str,
        candidate_id: UUID,
        db: Session,
    ) -> dict | None:
        interview_uuid = self._parse_interview_id(interview_id)

        db_interview = db.get(
            InterviewModel,
            interview_uuid,
        )

        if (
            db_interview is None
            or db_interview.candidate_id != candidate_id
        ):
            return None

        questions = db.scalars(
            select(QuestionModel)
            .where(
                QuestionModel.interview_id == interview_uuid,
            )
            .order_by(
                QuestionModel.question_number,
            )
        ).all()

        question_details = []

        for question in questions:
            db_answer = db.scalar(
                select(AnswerModel).where(
                    AnswerModel.question_id == question.id,
                )
            )

            evaluation_data = None
            answer_data = None

            if db_answer is not None:
                answer_data = {
                    "id": str(db_answer.id),
                    "answer_text": db_answer.answer_text,
                    "created_at": db_answer.created_at,
                }

                db_evaluation = db.scalar(
                    select(EvaluationModel).where(
                        EvaluationModel.answer_id == db_answer.id,
                    )
                )

                if db_evaluation is not None:
                    evaluation_data = {
                        "id": str(db_evaluation.id),
                        "score": db_evaluation.score,
                        "strengths": db_evaluation.strengths,
                        "weaknesses": db_evaluation.weaknesses,
                        "feedback": db_evaluation.feedback,
                        "created_at": db_evaluation.created_at,
                    }

            question_details.append(
                {
                    "id": str(question.id),
                    "question_number": question.question_number,
                    "question_text": question.question_text,
                    "created_at": question.created_at,
                    "answer": answer_data,
                    "evaluation": evaluation_data,
                }
            )

        return {
            "interview_id": str(db_interview.id),
            "job_title": db_interview.job_title,
            "level": db_interview.level,
            "number_of_questions": db_interview.number_of_questions,
            "current_question": db_interview.current_question,
            "status": db_interview.status,
            "final_score": db_interview.final_score,
            "created_at": db_interview.created_at,
            "questions": question_details,
        }

    def submit_answer(
        self,
        interview_id: str,
        answer: str,
        candidate_id: UUID,
        db: Session,
    ) -> AnswerResponse | None:
        interview_uuid = self._parse_interview_id(interview_id)

        db_interview = db.get(
            InterviewModel,
            interview_uuid,
        )

        if (
            db_interview is None
            or db_interview.candidate_id != candidate_id
        ):
            return None

        if db_interview.status == "completed":
            raise ValueError(
                "Cet entretien est déjà terminé."
            )

        question_number = db_interview.current_question

        db_question = db.scalar(
            select(QuestionModel).where(
                QuestionModel.interview_id == interview_uuid,
                QuestionModel.question_number == question_number,
            )
        )

        if db_question is None:
            raise ValueError(
                "La question actuelle est introuvable dans la base de données."
            )

        existing_answer = db.scalar(
            select(AnswerModel).where(
                AnswerModel.question_id == db_question.id,
            )
        )

        if existing_answer is not None:
            raise ValueError(
                "Une réponse a déjà été enregistrée pour cette question."
            )

        evaluation_data = evaluate_interview_answer(
            question=db_question.question_text,
            answer=answer,
            job_title=db_interview.job_title,
            level=db_interview.level,
        )

        db_answer = AnswerModel(
            question_id=db_question.id,
            answer_text=answer,
        )

        db.add(db_answer)
        db.flush()

        db_evaluation = EvaluationModel(
            answer_id=db_answer.id,
            score=evaluation_data["score"],
            strengths=evaluation_data["strengths"],
            weaknesses=evaluation_data["weaknesses"],
            feedback=evaluation_data["feedback"],
        )

        db.add(db_evaluation)

        evaluation = AnswerEvaluation(
            **evaluation_data,
        )

        if question_number >= db_interview.number_of_questions:
            db_interview.status = "completed"

            db.flush()

            scores = db.scalars(
                select(EvaluationModel.score)
                .join(
                    AnswerModel,
                    EvaluationModel.answer_id == AnswerModel.id,
                )
                .join(
                    QuestionModel,
                    AnswerModel.question_id == QuestionModel.id,
                )
                .where(
                    QuestionModel.interview_id == interview_uuid,
                )
            ).all()

            final_score = round(
                sum(scores) / len(scores) * 10,
                2,
            )

            db_interview.final_score = final_score

            db.commit()

            return AnswerResponse(
                interview_id=interview_id,
                question_number=question_number,
                evaluation=evaluation,
                interview_completed=True,
                next_question=None,
                final_score=final_score,
            )

        next_question = generate_interview_question(
            job_title=db_interview.job_title,
            level=db_interview.level,
        )

        next_question_number = question_number + 1

        db_next_question = QuestionModel(
            interview_id=interview_uuid,
            question_text=next_question,
            question_number=next_question_number,
        )

        db.add(db_next_question)

        db_interview.current_question = next_question_number

        db.commit()

        return AnswerResponse(
            interview_id=interview_id,
            question_number=question_number,
            evaluation=evaluation,
            interview_completed=False,
            next_question=next_question,
            final_score=None,
        )
    def get_recruiter_dashboard(
        self,
        db: Session,
    ) -> RecruiterDashboardResponse:
        interviews = db.scalars(
            select(InterviewModel)
            .order_by(InterviewModel.created_at.desc())
        ).all()

        candidates = {
            interview.candidate_id
            for interview in interviews
        }

        scores = [
            interview.final_score
            for interview in interviews
            if interview.final_score is not None
        ]

        recruiter_interviews = []

        for interview in interviews:
            candidate = interview.candidate

            recruiter_interviews.append(
                RecruiterInterviewItem(
                    interview_id=str(interview.id),
                    job_title=interview.job_title,
                    level=interview.level,
                    number_of_questions=interview.number_of_questions,
                    status=interview.status,
                    final_score=interview.final_score,
                    created_at=interview.created_at,
                    candidate=RecruiterCandidateResponse(
                        id=str(candidate.id),
                        full_name=candidate.full_name,
                        email=candidate.email,
                        role=candidate.role,
                    ),
                )
            )

        return RecruiterDashboardResponse(
            total_candidates=len(candidates),
            total_interviews=len(interviews),
            completed_interviews=sum(
                1
                for interview in interviews
                if interview.status == "completed"
            ),
            in_progress_interviews=sum(
                1
                for interview in interviews
                if interview.status == "in_progress"
            ),
            average_score=(
                round(sum(scores) / len(scores), 2)
                if scores
                else 0.0
            ),
            interviews=recruiter_interviews,
        )
    def get_recruiter_interview(
        self,
        interview_id: str,
        db: Session,
    ) -> dict | None:
        interview_uuid = self._parse_interview_id(
            interview_id,
        )

        db_interview = db.get(
            InterviewModel,
            interview_uuid,
        )

        if db_interview is None:
            return None

        questions = db.scalars(
            select(QuestionModel)
            .where(
                QuestionModel.interview_id == interview_uuid,
            )
            .order_by(
                QuestionModel.question_number,
            )
        ).all()

        question_details = []

        for question in questions:
            db_answer = db.scalar(
                select(AnswerModel).where(
                    AnswerModel.question_id == question.id,
                )
            )

            answer_data = None
            evaluation_data = None

            if db_answer is not None:
                answer_data = {
                    "id": str(db_answer.id),
                    "answer_text": db_answer.answer_text,
                    "created_at": db_answer.created_at,
                }

                db_evaluation = db.scalar(
                    select(EvaluationModel).where(
                        EvaluationModel.answer_id
                        == db_answer.id,
                    )
                )

                if db_evaluation is not None:
                    evaluation_data = {
                        "id": str(db_evaluation.id),
                        "score": db_evaluation.score,
                        "strengths": db_evaluation.strengths,
                        "weaknesses": db_evaluation.weaknesses,
                        "feedback": db_evaluation.feedback,
                        "created_at": db_evaluation.created_at,
                    }

            question_details.append(
                {
                    "id": str(question.id),
                    "question_number": question.question_number,
                    "question_text": question.question_text,
                    "created_at": question.created_at,
                    "answer": answer_data,
                    "evaluation": evaluation_data,
                }
            )

        candidate = db_interview.candidate

        return {
            "interview_id": str(db_interview.id),
            "job_title": db_interview.job_title,
            "level": db_interview.level,
            "number_of_questions": db_interview.number_of_questions,
            "current_question": db_interview.current_question,
            "status": db_interview.status,
            "final_score": db_interview.final_score,
            "created_at": db_interview.created_at,
            "candidate": {
                "id": str(candidate.id),
                "full_name": candidate.full_name,
                "email": candidate.email,
                "role": candidate.role,
            },
            "questions": question_details,
        }
    @staticmethod
    def _parse_interview_id(
        interview_id: str,
    ) -> UUID:
        try:
            return UUID(interview_id)

        except ValueError as error:
            raise ValueError(
                "L'identifiant de l'entretien est invalide."
            ) from error


interview_service = InterviewService()