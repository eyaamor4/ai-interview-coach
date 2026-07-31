import { useState } from "react";

function QuestionCard({
    question,
    questionNumber,
    totalQuestions,
    onSubmit,
    loading,
}) {
    const [answer, setAnswer] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!answer.trim()) {
            return;
        }

        onSubmit(answer);
    };

    return (
        <section className="question-card">
            <div className="question-card-header">
                <span>
                    Question {questionNumber} sur {totalQuestions}
                </span>
            </div>

            <h1>{question}</h1>

            <form onSubmit={handleSubmit}>
                <label htmlFor="answer">Votre réponse</label>

                <textarea
                    id="answer"
                    rows="8"
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    placeholder="Écrivez votre réponse ici..."
                    disabled={loading}
                    required
                />

                <button type="submit" disabled={loading || !answer.trim()}>
                    {loading ? "Évaluation en cours..." : "Envoyer la réponse"}
                </button>
            </form>
        </section>
    );
}

export default QuestionCard;