import { useState } from "react";

import { registerUser } from "../services/api";

function Register({
    onRegisterSuccess,
    onGoToLogin,
}) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const cleanedFullName = fullName.trim();
        const cleanedEmail = email
            .trim()
            .toLowerCase();

        if (
            !cleanedFullName ||
            !cleanedEmail ||
            !password.trim()
        ) {
            setError(
                "Veuillez remplir tous les champs.",
            );
            return;
        }

        if (cleanedFullName.length < 2) {
            setError(
                "Le nom complet doit contenir au moins 2 caractères.",
            );
            return;
        }

        if (password.length < 8) {
            setError(
                "Le mot de passe doit contenir au moins 8 caractères.",
            );
            return;
        }

        if (password.length > 100) {
            setError(
                "Le mot de passe ne doit pas dépasser 100 caractères.",
            );
            return;
        }

        try {
            setLoading(true);

            await registerUser({
                full_name: cleanedFullName,
                email: cleanedEmail,
                password,
            });

            setSuccess(
                "Votre compte a été créé avec succès. Redirection vers la connexion...",
            );

            setTimeout(() => {
                onRegisterSuccess?.();
            }, 1000);
        } catch (requestError) {
            console.error(
                "Erreur lors de l’inscription :",
                requestError,
            );

            const detail =
                requestError.response?.data?.detail;

            if (Array.isArray(detail)) {
                const messages = detail
                    .map((item) => {
                        const field =
                            item.loc?.[
                            item.loc.length - 1
                            ];

                        if (
                            field === "password" &&
                            item.type ===
                            "string_too_short"
                        ) {
                            return "Le mot de passe doit contenir au moins 8 caractères.";
                        }

                        if (
                            field === "password" &&
                            item.type ===
                            "string_too_long"
                        ) {
                            return "Le mot de passe ne doit pas dépasser 100 caractères.";
                        }

                        if (field === "email") {
                            return "L’adresse email saisie n’est pas valide.";
                        }

                        if (
                            field === "full_name" &&
                            item.type ===
                            "string_too_short"
                        ) {
                            return "Le nom complet doit contenir au moins 2 caractères.";
                        }

                        if (
                            field === "full_name" &&
                            item.type ===
                            "string_too_long"
                        ) {
                            return "Le nom complet ne doit pas dépasser 150 caractères.";
                        }

                        return (
                            item.msg ||
                            "Une information saisie est invalide."
                        );
                    })
                    .join(" ");

                setError(messages);
            } else if (
                typeof detail === "string"
            ) {
                setError(detail);
            } else {
                setError(
                    "Impossible de créer le compte. Vérifiez les informations saisies.",
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <div className="auth-header">
                    <p className="auth-badge">
                        AI Interview Coach
                    </p>

                    <h1>Créer un compte</h1>

                    <p>
                        Créez votre compte pour commencer vos
                        entraînements.
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <div className="form-group">
                        <label htmlFor="register-name">
                            Nom complet
                        </label>

                        <input
                            id="register-name"
                            type="text"
                            value={fullName}
                            onChange={(event) =>
                                setFullName(
                                    event.target.value,
                                )
                            }
                            placeholder="Eya Amor"
                            autoComplete="name"
                            minLength={2}
                            maxLength={150}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-email">
                            Adresse email
                        </label>

                        <input
                            id="register-email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(
                                    event.target.value,
                                )
                            }
                            placeholder="eya@example.com"
                            autoComplete="email"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-password">
                            Mot de passe
                        </label>

                        <input
                            id="register-password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value,
                                )
                            }
                            placeholder="Au moins 8 caractères"
                            autoComplete="new-password"
                            minLength={8}
                            maxLength={100}
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div
                            className="auth-error"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    {success && (
                        <div
                            className="auth-success"
                            role="status"
                        >
                            {success}
                        </div>
                    )}

                    <button
                        className="auth-submit-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Création en cours..."
                            : "Créer mon compte"}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>
                        Vous avez déjà un compte ?
                    </span>

                    <button
                        type="button"
                        className="auth-link-button"
                        onClick={onGoToLogin}
                        disabled={loading}
                    >
                        Se connecter
                    </button>
                </div>
            </section>
        </main>
    );
}

export default Register;