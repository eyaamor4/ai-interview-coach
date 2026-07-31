
import { useState } from "react";
import InterviewForm from "../components/InterviewForm";
import { startInterview } from "../services/api";

function Home({ onInterviewStarted }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleStartInterview = async (formData) => {
        setLoading(true);
        setError("");

        try {
            const interviewData = await startInterview(formData);

            onInterviewStarted({
                ...interviewData,
                number_of_questions: formData.number_of_questions,
            });
        } catch (requestError) {
            console.error(requestError);

            setError(
                requestError.response?.data?.detail ||
                "Impossible de démarrer l’entretien. Vérifie que le backend FastAPI fonctionne.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="home-page">
            <section className="home-content">
                <div className="home-presentation">
                    <span className="home-badge">AI Interview Coach</span>

                    <h1>
                        Prépare ton prochain
                        <span> entretien technique</span>
                    </h1>

                    <p>
                        Sélectionne le poste, le niveau et le nombre de questions. L’IA
                        générera ensuite un entretien personnalisé et évaluera tes réponses.
                    </p>

                    <div className="home-features">
                        <div>
                            <strong>Questions personnalisées</strong>
                            <span>Adaptées au poste et au niveau</span>
                        </div>

                        <div>
                            <strong>Évaluation immédiate</strong>
                            <span>Score, feedback, forces et faiblesses</span>
                        </div>

                        <div>
                            <strong>Suivi de progression</strong>
                            <span>Historique sauvegardé dans PostgreSQL</span>
                        </div>
                    </div>
                </div>

                <div className="home-form-card">
                    <InterviewForm onStart={handleStartInterview} />

                    {loading && (
                        <p className="loading-message">
                            Génération de la première question...
                        </p>
                    )}

                    {error && <p className="error-message">{error}</p>}
                </div>
            </section>
        </main>
    );
}

export default Home;