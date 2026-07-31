function EvaluationCard({
    evaluation,
    onNextQuestion,
    isLastQuestion,
}) {
    const strengths = evaluation.strengths || [];
    const weaknesses = evaluation.weaknesses || [];

    return (
        <section className="evaluation-card">
            <div className="evaluation-header">
                <div>
                    <span>Évaluation terminée</span>
                    <h2>Résultat de votre réponse</h2>
                </div>

                <div className="score-circle">
                    <strong>{evaluation.score * 10}</strong>
                    <span>/ 100</span>
                </div>
            </div>

            <div className="evaluation-grid">
                <div className="evaluation-block strengths-block">
                    <h3>Points forts</h3>

                    {strengths.length > 0 ? (
                        <ul>
                            {strengths.map((strength, index) => (
                                <li key={`${strength}-${index}`}>{strength}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>Aucun point fort indiqué.</p>
                    )}
                </div>

                <div className="evaluation-block weaknesses-block">
                    <h3>Points à améliorer</h3>

                    {weaknesses.length > 0 ? (
                        <ul>
                            {weaknesses.map((weakness, index) => (
                                <li key={`${weakness}-${index}`}>{weakness}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>Aucun point faible indiqué.</p>
                    )}
                </div>
            </div>

            <div className="feedback-block">
                <h3>Feedback</h3>
                <p>{evaluation.feedback}</p>
            </div>

            <button
                className="next-question-button"
                type="button"
                onClick={onNextQuestion}
            >
                {isLastQuestion
                    ? "Voir le résultat final"
                    : "Passer à la question suivante"}
            </button>
        </section>
    );
}

export default EvaluationCard;