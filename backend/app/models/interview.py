from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID as PostgreSQLUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.question import Question


class Interview(Base):
    __tablename__ = "interviews"

    id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    candidate_id: Mapped[UUID | None] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    job_title: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    level: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    number_of_questions: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=5,
    )

    current_question: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="in_progress",
    )

    final_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        default=None,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    # Relation vers le candidat
    candidate: Mapped["User | None"] = relationship(
        back_populates="interviews",
    )

    # Relation vers les questions de l'entretien
    questions: Mapped[list["Question"]] = relationship(
        back_populates="interview",
        cascade="all, delete-orphan",
    )