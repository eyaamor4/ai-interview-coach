import { useState } from "react";
import QuestionCard from "../components/QuestionCard";
import EvaluationCard from "../components/EvaluationCard";
import { submitAnswer } from "../services/api";

function Interview({ interview, onInterviewCompleted }) {
    const [currentQuestion, setCurrentQuestion] = useState(
        interview.question,
    );

    const [questionNumber, setQuestionNumber] = useState(1);
    const [evaluation, setEvaluation] = useState(null);
    const [nextQuestion, setNextQuestion] = useState(null);
    const [finalScore, setFinalScore] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const totalQuestions = interview.number_of_questions;

    const handleSubmitAnswer = async (answerText) => {
        setLoading(true);
        setError("");

        try {
            const response = await submitAnswer(
                interview.interview_id,
                {
                    answer: answerText,
                },
            );

            setEvaluation(response.evaluation);
            setNextQuestion(response.next_question || null);

            if (response.interview_completed) {
                setFinalScore(response.final_score);
            }
        } catch (requestError) {
            console.error(requestError);

            setError(
                requestError.response?.data?.detail ||
                "Impossible d’évaluer la réponse. Vérifie le backend.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleNextQuestion = () => {
        if (finalScore !== null) {
            onInterviewCompleted({
                interviewId: interview.interview_id,
                jobTitle: interview.job_title,
                level: interview.level,
                totalQuestions,
                finalScore,
            });

            return;
        }

        if (!nextQuestion) {
            setError("La prochaine question est introuvable.");
            return;
        }

        setCurrentQuestion(nextQuestion);
        setQuestionNumber(
            (previousNumber) => previousNumber + 1,
        );
        setEvaluation(null);
        setNextQuestion(null);
        setError("");
    };

    const isLastQuestion = finalScore !== null;

    return (
        <main className="interview-page">
            <section className="interview-header-card">
                <div>
                    <span className="interview-status">
                        Entretien en cours
                    </span>

                    <h1>{interview.job_title}</h1>
                </div>

                <span className="level-badge">
                    {interview.level}
                </span>
            </section>

            <div className="interview-progress">
                <div className="progress-information">
                    <span>
                        Question {questionNumber} sur {totalQuestions}
                    </span>

                    <span>
                        {Math.round(
                            (questionNumber / totalQuestions) * 100,
                        )}{" "}
                        %
                    </span>
                </div>

                <div className="progress-bar">
                    <div
                        style={{
                            width: `${(questionNumber / totalQuestions) * 100
                                }%`,
                        }}
                    />
                </div>
            </div>

            {error && (
                <div className="error-message">{error}</div>
            )}

            {!evaluation ? (
                <QuestionCard
                    key={questionNumber}
                    question={currentQuestion}
                    questionNumber={questionNumber}
                    totalQuestions={totalQuestions}
                    onSubmit={handleSubmitAnswer}
                    loading={loading}
                />
            ) : (
                <EvaluationCard
                    evaluation={evaluation}
                    onNextQuestion={handleNextQuestion}
                    isLastQuestion={isLastQuestion}
                />
            )}
        </main>
    );
}

export default Interview;