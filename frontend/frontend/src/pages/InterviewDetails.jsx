import { useEffect, useState } from "react";

import {
    getInterviewDetails,
    getRecruiterInterviewDetails,
} from "../services/api";

function InterviewDetails({
    interviewId,
    onBack,
    mode = "candidate",
}) {
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadInterview = async () => {
            try {
                setLoading(true);
                setError("");

                const data =
                    mode === "recruiter"
                        ? await getRecruiterInterviewDetails(
                            interviewId,
                        )
                        : await getInterviewDetails(
                            interviewId,
                        );

                setInterview(data);
            } catch (requestError) {
                console.error(
                    "Erreur lors du chargement des détails :",
                    requestError,
                );

                const detail =
                    requestError.response?.data?.detail;

                setError(
                    typeof detail === "string"
                        ? detail
                        : "Impossible de charger les détails de cet entretien.",
                );
            } finally {
                setLoading(false);
            }
        };

        loadInterview();
    }, [interviewId, mode]);

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "—";
        }

        return new Intl.DateTimeFormat("fr-FR", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(dateValue));
    };

    const formatStatus = (status) => {
        if (status === "completed") {
            return "Terminé";
        }

        if (status === "in_progress") {
            return "En cours";
        }

        return status ?? "—";
    };

    const backButtonLabel =
        mode === "recruiter"
            ? "Retour au dashboard recruteur"
            : "Retour à l’historique";

    if (loading) {
        return (
            <main className="details-page">
                <div className="details-message">
                    Chargement des détails...
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="details-page">
                <div className="details-error">
                    <p>{error}</p>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onBack}
                    >
                        {backButtonLabel}
                    </button>
                </div>
            </main>
        );
    }

    if (!interview) {
        return null;
    }

    const questions = interview.questions ?? [];

    return (
        <main className="details-page">
            <section className="details-container">
                <div className="details-header">
                    <div>
                        <span className="history-badge">
                            {mode === "recruiter"
                                ? "Rapport candidat"
                                : "Rapport d’entretien"}
                        </span>

                        <h1>Détails de l’entretien</h1>

                        <p>
                            Questions, réponses et évaluations
                            détaillées.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onBack}
                    >
                        {backButtonLabel}
                    </button>
                </div>

                {mode === "recruiter" &&
                    interview.candidate && (
                        <section className="candidate-details-card">
                            <div>
                                <span>Nom du candidat</span>
                                <strong>
                                    {
                                        interview.candidate
                                            .full_name
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Email</span>
                                <strong>
                                    {
                                        interview.candidate
                                            .email
                                    }
                                </strong>
                            </div>
                        </section>
                    )}

                <section className="details-summary">
                    <div>
                        <span>Poste</span>
                        <strong>
                            {interview.job_title}
                        </strong>
                    </div>

                    <div>
                        <span>Niveau</span>
                        <strong>
                            {interview.level}
                        </strong>
                    </div>

                    <div>
                        <span>Statut</span>
                        <strong>
                            {formatStatus(
                                interview.status,
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Score final</span>
                        <strong>
                            {interview.final_score ===
                                null ||
                                interview.final_score ===
                                undefined
                                ? "—"
                                : `${interview.final_score} / 100`}
                        </strong>
                    </div>

                    <div>
                        <span>Date</span>
                        <strong>
                            {formatDate(
                                interview.created_at,
                            )}
                        </strong>
                    </div>
                </section>

                {questions.length === 0 ? (
                    <div className="details-message">
                        Aucune question enregistrée pour cet
                        entretien.
                    </div>
                ) : (
                    <div className="question-details-list">
                        {questions.map((question) => {
                            const evaluation =
                                question.evaluation;

                            const strengths =
                                evaluation?.strengths ??
                                [];

                            const weaknesses =
                                evaluation?.weaknesses ??
                                [];

                            return (
                                <article
                                    className="question-details-card"
                                    key={question.id}
                                >
                                    <div className="question-details-header">
                                        <span>
                                            Question{" "}
                                            {
                                                question.question_number
                                            }
                                        </span>

                                        {evaluation && (
                                            <strong>
                                                {
                                                    evaluation.score
                                                }{" "}
                                                / 10
                                            </strong>
                                        )}
                                    </div>

                                    <h2>
                                        {
                                            question.question_text
                                        }
                                    </h2>

                                    <div className="detail-section">
                                        <h3>Réponse</h3>

                                        <p>
                                            {question.answer
                                                ?.answer_text ??
                                                "Aucune réponse enregistrée."}
                                        </p>
                                    </div>

                                    {evaluation ? (
                                        <>
                                            <div className="detail-grid">
                                                <div className="strengths-box">
                                                    <h3>
                                                        Points
                                                        forts
                                                    </h3>

                                                    {strengths.length >
                                                        0 ? (
                                                        <ul>
                                                            {strengths.map(
                                                                (
                                                                    strength,
                                                                    index,
                                                                ) => (
                                                                    <li
                                                                        key={`${strength}-${index}`}
                                                                    >
                                                                        {
                                                                            strength
                                                                        }
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    ) : (
                                                        <p>
                                                            Aucun
                                                            point
                                                            fort
                                                            identifié.
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="weaknesses-box">
                                                    <h3>
                                                        Points à
                                                        améliorer
                                                    </h3>

                                                    {weaknesses.length >
                                                        0 ? (
                                                        <ul>
                                                            {weaknesses.map(
                                                                (
                                                                    weakness,
                                                                    index,
                                                                ) => (
                                                                    <li
                                                                        key={`${weakness}-${index}`}
                                                                    >
                                                                        {
                                                                            weakness
                                                                        }
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    ) : (
                                                        <p>
                                                            Aucun
                                                            point
                                                            faible
                                                            identifié.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="feedback-box">
                                                <h3>
                                                    Feedback
                                                </h3>

                                                <p>
                                                    {evaluation.feedback ??
                                                        "Aucun feedback enregistré."}
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="details-message">
                                            Cette question n’a pas
                                            encore été évaluée.
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}

export default InterviewDetails;