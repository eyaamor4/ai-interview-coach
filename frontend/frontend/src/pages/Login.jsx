import { useState } from "react";

import { loginUser } from "../services/api";

function Login({ onLogin, onGoToRegister }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!email.trim() || !password.trim()) {
            setError(
                "Veuillez saisir votre email et votre mot de passe.",
            );

            return;
        }

        try {
            setLoading(true);

            const authData = await loginUser({
                email: email.trim(),
                password,
            });

            if (onLogin) {
                onLogin(authData.user);
            }
        } catch (requestError) {
            console.error(
                "Erreur lors de la connexion :",
                requestError,
            );

            const message =
                requestError.response?.data?.detail ||
                "Impossible de se connecter. Vérifiez vos informations.";

            setError(message);
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

                    <h1>Connexion</h1>

                    <p>
                        Connectez-vous pour accéder à vos entretiens,
                        votre historique et votre tableau de bord.
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <div className="form-group">
                        <label htmlFor="login-email">
                            Adresse email
                        </label>

                        <input
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="eya@example.com"
                            autoComplete="email"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="login-password">
                            Mot de passe
                        </label>

                        <input
                            id="login-password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Votre mot de passe"
                            autoComplete="current-password"
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

                    <button
                        className="auth-submit-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Connexion en cours..."
                            : "Se connecter"}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>Vous n’avez pas encore de compte ?</span>

                    <button
                        type="button"
                        className="auth-link-button"
                        onClick={onGoToRegister}
                        disabled={loading}
                    >
                        Créer un compte
                    </button>
                </div>
            </section>
        </main>
    );
}

export default Login;