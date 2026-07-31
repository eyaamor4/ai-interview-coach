import { useEffect, useState } from "react";


import { getRecruiterDashboard } from "../services/api";

function RecruiterDashboard({ onViewDetails }) {


    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getRecruiterDashboard();

                setDashboard(data);
            } catch (requestError) {
                console.error(
                    "Erreur lors du chargement du dashboard recruteur :",
                    requestError,
                );

                const detail =
                    requestError.response?.data?.detail;

                setError(
                    typeof detail === "string"
                        ? detail
                        : "Impossible de charger le dashboard recruteur.",
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) {
        return (
            <main className="dashboard-page">
                <section className="dashboard-container">
                    <p>Chargement du dashboard recruteur...</p>
                </section>
            </main>
        );
    }

    if (error) {
        return (
            <main className="dashboard-page">
                <section className="dashboard-container">
                    <div className="error-message">
                        {error}
                    </div>
                </section>
            </main>
        );
    }

    if (!dashboard) {
        return null;
    }

    const interviews = dashboard.interviews ?? [];

    return (
        <main className="dashboard-page">
            <section className="dashboard-container">
                <div className="dashboard-header">
                    <div>
                        <span className="page-badge">
                            Espace recruteur
                        </span>

                        <h1>Dashboard recruteur</h1>

                        <p>
                            Consultez les candidats et leurs
                            entretiens.
                        </p>
                    </div>
                </div>

                <div className="dashboard-stats">
                    <article className="stat-card">
                        <span>Candidats</span>

                        <strong>
                            {dashboard.total_candidates ?? 0}
                        </strong>
                    </article>

                    <article className="stat-card">
                        <span>Entretiens</span>

                        <strong>
                            {dashboard.total_interviews ?? 0}
                        </strong>
                    </article>

                    <article className="stat-card">
                        <span>Terminés</span>

                        <strong>
                            {dashboard.completed_interviews ?? 0}
                        </strong>
                    </article>

                    <article className="stat-card">
                        <span>En cours</span>

                        <strong>
                            {dashboard.in_progress_interviews ?? 0}
                        </strong>
                    </article>

                    <article className="stat-card">
                        <span>Score moyen</span>

                        <strong>
                            {dashboard.average_score ?? 0} / 100
                        </strong>
                    </article>
                </div>

                <section className="history-section">
                    <div className="section-header">
                        <div>
                            <h2>Liste des entretiens</h2>

                            <p>
                                Tous les entretiens réalisés par les
                                candidats.
                            </p>
                        </div>
                    </div>

                    {interviews.length === 0 ? (
                        <div className="empty-state">
                            <h3>Aucun entretien</h3>

                            <p>
                                Aucun candidat n’a encore réalisé
                                d’entretien.
                            </p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Candidat</th>
                                        <th>Email</th>
                                        <th>Poste</th>
                                        <th>Niveau</th>
                                        <th>Statut</th>
                                        <th>Score</th>
                                        <th>Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {interviews.map((interview) => {
                                        const candidate =
                                            interview.candidate;

                                        return (
                                            <tr
                                                key={
                                                    interview.interview_id
                                                }
                                            >
                                                <td>
                                                    {candidate?.full_name ??
                                                        "Candidat inconnu"}
                                                </td>

                                                <td>
                                                    {candidate?.email ??
                                                        "Email indisponible"}
                                                </td>

                                                <td>
                                                    {interview.job_title}
                                                </td>

                                                <td>
                                                    {interview.level}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`status-badge ${interview.status ===
                                                            "completed"
                                                            ? "status-completed"
                                                            : "status-progress"
                                                            }`}
                                                    >
                                                        {interview.status ===
                                                            "completed"
                                                            ? "Terminé"
                                                            : "En cours"}
                                                    </span>
                                                </td>

                                                <td>
                                                    {interview.final_score !==
                                                        null &&
                                                        interview.final_score !==
                                                        undefined
                                                        ? `${interview.final_score} / 100`
                                                        : "—"}
                                                </td>

                                                <td>
                                                    {new Date(
                                                        interview.created_at,
                                                    ).toLocaleDateString(
                                                        "fr-FR",
                                                    )}
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="details-button"
                                                        onClick={() =>
                                                            onViewDetails(interview.interview_id)
                                                        }
                                                    >
                                                        Voir les détails
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </section>
        </main>
    );
}

export default RecruiterDashboard;