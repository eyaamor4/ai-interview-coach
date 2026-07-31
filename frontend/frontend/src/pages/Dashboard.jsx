import { useEffect, useState } from "react";

import { getDashboard } from "../services/api";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

function Dashboard({
    onBack,
    onViewHistory,
    onViewDetails,
}) {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getDashboard();

                setDashboard(data);
            } catch (requestError) {
                console.error(
                    "Erreur lors du chargement du dashboard :",
                    requestError,
                );

                setError(
                    "Impossible de charger les statistiques.",
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "—";
        }

        return new Intl.DateTimeFormat("fr-FR", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(dateValue));
    };

    const formatScore = (score) => {
        if (score === null || score === undefined) {
            return "—";
        }

        return `${score} / 100`;
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

    if (loading) {
        return (
            <main className="dashboard-page">
                <div className="dashboard-message">
                    Chargement du dashboard...
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="dashboard-page">
                <section className="dashboard-error">
                    <p>{error}</p>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onBack}
                    >
                        Retour à l’accueil
                    </button>
                </section>
            </main>
        );
    }



    if (!dashboard) {
        return null;
    }
    
    const latestInterview = dashboard.latest_interview;

    const scoreHistory = (
        dashboard.score_history ?? []
    ).map((item, index) => ({
        ...item,
        interviewLabel: `Entretien ${index + 1}`,
        shortDate: new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "2-digit",
        }).format(new Date(item.created_at)),
    }));
    return (
        <main className="dashboard-page">
            <section className="dashboard-container">
                <div className="dashboard-header">
                    <div>
                        <span className="dashboard-badge">
                            Vue globale
                        </span>

                        <h1>Dashboard</h1>

                        <p>
                            Suis tes entretiens et l’évolution de tes
                            performances.
                        </p>
                    </div>

                    <div className="dashboard-header-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onViewHistory}
                        >
                            Voir l’historique
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onBack}
                        >
                            Retour à l’accueil
                        </button>
                    </div>
                </div>

                <section className="dashboard-stats-grid">
                    <article className="dashboard-stat-card">
                        <span>Total des entretiens</span>
                        <strong>
                            {dashboard.total_interviews}
                        </strong>
                        <p>Tous les entretiens enregistrés</p>
                    </article>

                    <article className="dashboard-stat-card">
                        <span>Entretiens terminés</span>
                        <strong>
                            {dashboard.completed_interviews}
                        </strong>
                        <p>Entretiens entièrement complétés</p>
                    </article>

                    <article className="dashboard-stat-card">
                        <span>Entretiens en cours</span>
                        <strong>
                            {dashboard.in_progress_interviews}
                        </strong>
                        <p>Entretiens qui restent à terminer</p>
                    </article>

                    <article className="dashboard-stat-card">
                        <span>Score moyen</span>
                        <strong>
                            {formatScore(
                                dashboard.average_score,
                            )}
                        </strong>
                        <p>Moyenne des scores enregistrés</p>
                    </article>

                    <article className="dashboard-stat-card">
                        <span>Meilleur score</span>
                        <strong>
                            {formatScore(dashboard.best_score)}
                        </strong>
                        <p>Meilleure performance obtenue</p>
                    </article>
                </section>
                <section className="dashboard-chart-panel">
                    <div className="dashboard-panel-header">
                        <div>
                            <span>Performances</span>
                            <h2>Évolution des scores</h2>
                        </div>
                    </div>

                    {scoreHistory.length > 0 ? (
                        <div className="dashboard-chart">
                            <ResponsiveContainer
                                width="100%"
                                height={320}
                            >
                                <LineChart
                                    data={scoreHistory}
                                    margin={{
                                        top: 20,
                                        right: 20,
                                        left: 0,
                                        bottom: 10,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="shortDate"
                                        tickLine={false}
                                        axisLine={false}
                                    />

                                    <YAxis
                                        domain={[0, 100]}
                                        tickLine={false}
                                        axisLine={false}
                                    />

                                    <Tooltip
                                        formatter={(value) => [
                                            `${value} / 100`,
                                            "Score",
                                        ]}
                                        labelFormatter={(_, payload) => {
                                            if (!payload?.length) {
                                                return "";
                                            }

                                            const item = payload[0].payload;

                                            return `${item.job_title} — ${item.shortDate}`;
                                        }}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#5b4cff"
                                        strokeWidth={3}
                                        dot={{
                                            r: 5,
                                            fill: "#5b4cff",
                                        }}
                                        activeDot={{
                                            r: 7,
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="dashboard-empty">
                            Aucun score disponible pour afficher le graphique.
                        </div>
                    )}
                </section>
                <section className="dashboard-content-grid">
                    <article className="dashboard-panel">
                        <div className="dashboard-panel-header">
                            <div>
                                <span>Dernière activité</span>
                                <h2>Dernier entretien</h2>
                            </div>
                        </div>

                        {latestInterview ? (
                            <div className="latest-interview">
                                <div className="latest-interview-main">
                                    <span>Poste</span>
                                    <h3>
                                        {latestInterview.job_title}
                                    </h3>

                                    <p>
                                        Niveau :{" "}
                                        <strong>
                                            {latestInterview.level}
                                        </strong>
                                    </p>
                                </div>

                                <div className="latest-interview-details">
                                    <div>
                                        <span>Statut</span>

                                        <strong>
                                            {formatStatus(
                                                latestInterview.status,
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Score</span>

                                        <strong>
                                            {formatScore(
                                                latestInterview.final_score,
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Date</span>

                                        <strong>
                                            {formatDate(
                                                latestInterview.created_at,
                                            )}
                                        </strong>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="details-button"
                                    onClick={() =>
                                        onViewDetails(
                                            latestInterview.interview_id,
                                        )
                                    }
                                >
                                    Voir les détails
                                </button>
                            </div>
                        ) : (
                            <div className="dashboard-empty">
                                Aucun entretien enregistré.
                            </div>
                        )}
                    </article>

                    <article className="dashboard-panel">
                        <div className="dashboard-panel-header">
                            <div>
                                <span>Progression</span>
                                <h2>Taux de complétion</h2>
                            </div>
                        </div>

                        <div className="completion-section">
                            <div className="completion-value">
                                <strong>
                                    {dashboard.total_interviews > 0
                                        ? Math.round(
                                            (dashboard.completed_interviews /
                                                dashboard.total_interviews) *
                                            100,
                                        )
                                        : 0}
                                </strong>

                                <span>%</span>
                            </div>

                            <p>
                                Pourcentage des entretiens terminés.
                            </p>

                            <div className="completion-bar">
                                <div
                                    className="completion-bar-value"
                                    style={{
                                        width: `${dashboard.total_interviews > 0
                                            ? Math.round(
                                                (dashboard.completed_interviews /
                                                    dashboard.total_interviews) *
                                                100,
                                            )
                                            : 0
                                            }%`,
                                    }}
                                />
                            </div>
                        </div>
                    </article>
                </section>
            </section>
        </main>
    );

}
export default Dashboard;
