import { useEffect, useState } from "react";

import { getInterviews } from "../services/api";

function History({ onBack, onViewDetails }) {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [levelFilter, setLevelFilter] = useState("all");

    useEffect(() => {
        const loadInterviews = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getInterviews();

                setInterviews(data);
            } catch (requestError) {
                console.error(
                    "Erreur lors du chargement de l'historique :",
                    requestError,
                );

                setError(
                    "Impossible de charger l’historique des entretiens.",
                );
            } finally {
                setLoading(false);
            }
        };

        loadInterviews();
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

    const filteredInterviews = interviews.filter((interview) => {
        const jobTitle = interview.job_title ?? "";
        const level = interview.level ?? "";
        const status = interview.status ?? "";

        const matchesSearch = jobTitle
            .toLowerCase()
            .includes(searchTerm.trim().toLowerCase());

        const matchesStatus =
            statusFilter === "all" ||
            status === statusFilter;

        const matchesLevel =
            levelFilter === "all" ||
            level === levelFilter;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesLevel
        );
    });

    const resetFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setLevelFilter("all");
    };

    return (
        <main className="history-page">
            <section className="history-card">
                <div className="history-header">
                    <div>
                        <span className="history-badge">
                            Suivi des performances
                        </span>

                        <h1>Historique des entretiens</h1>

                        <p>
                            Consulte tes anciens entretiens et tes scores.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onBack}
                    >
                        Retour à l’accueil
                    </button>
                </div>

                <div className="history-filters">
                    <input
                        type="text"
                        placeholder="Rechercher par poste..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                    />

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                    >
                        <option value="all">
                            Tous les statuts
                        </option>

                        <option value="completed">
                            Terminé
                        </option>

                        <option value="in_progress">
                            En cours
                        </option>
                    </select>

                    <select
                        value={levelFilter}
                        onChange={(event) =>
                            setLevelFilter(event.target.value)
                        }
                    >
                        <option value="all">
                            Tous les niveaux
                        </option>

                        <option value="Junior">
                            Junior
                        </option>

                        <option value="Mid">
                            Mid
                        </option>

                        <option value="Senior">
                            Senior
                        </option>
                    </select>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={resetFilters}
                    >
                        Réinitialiser
                    </button>
                </div>

                {!loading && !error && interviews.length > 0 && (
                    <div className="history-results-count">
                        {filteredInterviews.length} entretien
                        {filteredInterviews.length > 1 ? "s" : ""} trouvé
                        {filteredInterviews.length > 1 ? "s" : ""}
                    </div>
                )}

                {loading && (
                    <div className="history-message">
                        Chargement de l’historique...
                    </div>
                )}

                {!loading && error && (
                    <div className="history-error">
                        {error}
                    </div>
                )}

                {!loading &&
                    !error &&
                    interviews.length === 0 && (
                        <div className="history-message">
                            Aucun entretien enregistré pour le moment.
                        </div>
                    )}

                {!loading &&
                    !error &&
                    interviews.length > 0 &&
                    filteredInterviews.length === 0 && (
                        <div className="history-message">
                            Aucun entretien ne correspond aux filtres.
                        </div>
                    )}

                {!loading &&
                    !error &&
                    filteredInterviews.length > 0 && (
                        <div className="history-table-container">
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Poste</th>
                                        <th>Niveau</th>
                                        <th>Questions</th>
                                        <th>Statut</th>
                                        <th>Score</th>
                                        <th>Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredInterviews.map(
                                        (interview) => (
                                            <tr
                                                key={
                                                    interview.interview_id
                                                }
                                            >
                                                <td>
                                                    <strong>
                                                        {
                                                            interview.job_title
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {interview.level}
                                                </td>

                                                <td>
                                                    {
                                                        interview.number_of_questions
                                                    }
                                                </td>

                                                <td>
                                                    <span
                                                        className={`status-badge status-${interview.status}`}
                                                    >
                                                        {formatStatus(
                                                            interview.status,
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <strong>
                                                        {formatScore(
                                                            interview.final_score,
                                                        )}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        interview.created_at,
                                                    )}
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="details-button"
                                                        onClick={() =>
                                                            onViewDetails(
                                                                interview.interview_id,
                                                            )
                                                        }
                                                    >
                                                        Voir les détails
                                                    </button>
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
            </section>
        </main>
    );
}

export default History;