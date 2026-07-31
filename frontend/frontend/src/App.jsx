import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Home from "./pages/Home";
import Interview from "./pages/Interview";
import InterviewDetails from "./pages/InterviewDetails";
import Login from "./pages/Login";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import Register from "./pages/Register";

import {
  getStoredUser,
  isAuthenticated,
  logoutUser,
} from "./services/api";

import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    if (!isAuthenticated()) {
      return null;
    }

    return getStoredUser();
  });

  const [selectedInterviewId, setSelectedInterviewId] =
    useState(null);

  const [interview, setInterview] = useState(null);

  const [completedInterview, setCompletedInterview] =
    useState(null);

  const [currentPage, setCurrentPage] = useState(() => {
    if (!isAuthenticated()) {
      return "login";
    }

    const storedUser = getStoredUser();

    return storedUser?.role === "recruiter"
      ? "recruiter-dashboard"
      : "home";
  });

  const resetInterviewState = () => {
    setInterview(null);
    setCompletedInterview(null);
    setSelectedInterviewId(null);
  };

  const handleLogin = (authenticatedUser) => {
    setUser(authenticatedUser);
    resetInterviewState();

    if (authenticatedUser.role === "recruiter") {
      setCurrentPage("recruiter-dashboard");
    } else {
      setCurrentPage("home");
    }
  };

  const handleGoToRegister = () => {
    setCurrentPage("register");
  };

  const handleGoToLogin = () => {
    setCurrentPage("login");
  };

  const handleRegisterSuccess = () => {
    setCurrentPage("login");
  };

  const handleLogout = () => {
    logoutUser();

    setUser(null);
    resetInterviewState();
    setCurrentPage("login");
  };

  const handleInterviewStarted = (interviewData) => {
    setInterview(interviewData);
    setCompletedInterview(null);
    setSelectedInterviewId(null);
    setCurrentPage("interview");
  };

  const handleInterviewCompleted = (result) => {
    setCompletedInterview(result);
    setInterview(null);
    setCurrentPage("result");
  };

  const handleRestart = () => {
    resetInterviewState();
    setCurrentPage("home");
  };

  const handleShowHistory = () => {
    resetInterviewState();
    setCurrentPage("history");
  };

  const handleShowDashboard = () => {
    resetInterviewState();
    setCurrentPage("dashboard");
  };

  const handleShowRecruiterDashboard = () => {
    resetInterviewState();
    setCurrentPage("recruiter-dashboard");
  };

  const handleGoHome = () => {
    resetInterviewState();

    if (user?.role === "recruiter") {
      setCurrentPage("recruiter-dashboard");
    } else {
      setCurrentPage("home");
    }
  };

  /*
   * Détails accessibles au candidat.
   */
  const handleCandidateViewDetails = (interviewId) => {
    setSelectedInterviewId(interviewId);
    setCurrentPage("details");
  };

  const handleBackToHistory = () => {
    setSelectedInterviewId(null);
    setCurrentPage("history");
  };

  /*
   * Détails accessibles au recruteur.
   */
  const handleRecruiterViewDetails = (interviewId) => {
    setSelectedInterviewId(interviewId);
    setCurrentPage("recruiter-details");
  };

  const handleBackToRecruiterDashboard = () => {
    setSelectedInterviewId(null);
    setCurrentPage("recruiter-dashboard");
  };

  if (!user) {
    return (
      <div className="app">
        {currentPage === "register" ? (
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            onGoToLogin={handleGoToLogin}
          />
        ) : (
          <Login
            onLogin={handleLogin}
            onGoToRegister={handleGoToRegister}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <button
          type="button"
          className="logo logo-button"
          onClick={handleGoHome}
        >
          <span className="logo-icon">AI</span>

          <span>Interview Coach</span>
        </button>

        <div className="navbar-actions">
          <span className="navbar-text">
            Bonjour, {user.full_name}
          </span>

          {user.role === "candidate" && (
            <>
              <button
                type="button"
                className="history-nav-button"
                onClick={handleShowDashboard}
              >
                Dashboard
              </button>

              <button
                type="button"
                className="history-nav-button"
                onClick={handleShowHistory}
              >
                Historique
              </button>
            </>
          )}

          {user.role === "recruiter" && (
            <button
              type="button"
              className="history-nav-button"
              onClick={handleShowRecruiterDashboard}
            >
              Dashboard recruteur
            </button>
          )}

          <button
            type="button"
            className="history-nav-button logout-button"
            onClick={handleLogout}
          >
            Déconnexion
          </button>
        </div>
      </nav>

      {currentPage === "recruiter-dashboard" &&
        user.role === "recruiter" && (
          <RecruiterDashboard
            onViewDetails={handleRecruiterViewDetails}
          />
        )}

      {currentPage === "recruiter-details" &&
        user.role === "recruiter" &&
        selectedInterviewId && (
          <InterviewDetails
            interviewId={selectedInterviewId}
            mode="recruiter"
            onBack={handleBackToRecruiterDashboard}
          />
        )}

      {currentPage === "home" &&
        user.role === "candidate" && (
          <Home
            onInterviewStarted={handleInterviewStarted}
          />
        )}

      {currentPage === "interview" &&
        user.role === "candidate" &&
        interview && (
          <Interview
            interview={interview}
            onInterviewCompleted={
              handleInterviewCompleted
            }
          />
        )}

      {currentPage === "dashboard" &&
        user.role === "candidate" && (
          <Dashboard
            onBack={handleGoHome}
            onViewHistory={handleShowHistory}
            onViewDetails={handleCandidateViewDetails}
          />
        )}

      {currentPage === "history" &&
        user.role === "candidate" && (
          <History
            onBack={handleGoHome}
            onViewDetails={handleCandidateViewDetails}
          />
        )}

      {currentPage === "details" &&
        user.role === "candidate" &&
        selectedInterviewId && (
          <InterviewDetails
            interviewId={selectedInterviewId}
            mode="candidate"
            onBack={handleBackToHistory}
          />
        )}

      {currentPage === "result" &&
        user.role === "candidate" &&
        completedInterview && (
          <main className="result-page">
            <section className="result-card">
              <span className="result-badge">
                Entretien terminé
              </span>

              <h1>Félicitations !</h1>

              <p>
                Tu as terminé ton entretien pour le poste de{" "}
                <strong>
                  {completedInterview.jobTitle}
                </strong>
                .
              </p>

              <div className="final-score">
                <strong>
                  {completedInterview.finalScore}
                </strong>

                <span>/ 100</span>
              </div>

              <p className="final-score-label">
                Score final de l’entretien
              </p>

              <div className="result-summary">
                <div>
                  <span>Poste</span>

                  <strong>
                    {completedInterview.jobTitle}
                  </strong>
                </div>

                <div>
                  <span>Niveau</span>

                  <strong>
                    {completedInterview.level}
                  </strong>
                </div>

                <div>
                  <span>Questions répondues</span>

                  <strong>
                    {completedInterview.totalQuestions}
                  </strong>
                </div>
              </div>

              <div className="result-actions">
                <button
                  type="button"
                  onClick={handleRestart}
                >
                  Commencer un nouvel entretien
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleShowHistory}
                >
                  Voir l’historique
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleShowDashboard}
                >
                  Voir le dashboard
                </button>
              </div>
            </section>
          </main>
        )}
    </div>
  );
}

export default App;