import axios from "axios";

const TOKEN_KEY = "access_token";
const USER_KEY = "auth_user";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================
// Gestion locale du token
// ==========================
export const getAccessToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = () => {
  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error(
      "Impossible de lire l'utilisateur sauvegardé :",
      error,
    );

    localStorage.removeItem(USER_KEY);

    return null;
  }
};

export const saveAuthData = (authData) => {
  localStorage.setItem(
    TOKEN_KEY,
    authData.access_token,
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(authData.user),
  );
};

export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = () => {
  return Boolean(getAccessToken());
};

// ==========================
// Intercepteur JWT
// ==========================
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ==========================
// Gestion des erreurs 401
// ==========================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthData();
    }

    return Promise.reject(error);
  },
);

// ==========================
// Authentification
// ==========================
export const registerUser = async (userData) => {
  const response = await api.post(
    "/auth/register",
    userData,
  );

  return response.data;
};

export const loginUser = async (credentials) => {
  const formData = new URLSearchParams();

  formData.append("username", credentials.email);
  formData.append("password", credentials.password);

  const response = await api.post(
    "/auth/login",
    formData,
    {
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
    },
  );

  saveAuthData(response.data);

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};

export const logoutUser = () => {
  clearAuthData();
};

// ==========================
// Entretiens
// ==========================
export const startInterview = async (
  interviewData,
) => {
  const response = await api.post(
    "/interviews/start",
    interviewData,
  );

  return response.data;
};

export const submitAnswer = async (
  interviewId,
  answerData,
) => {
  const response = await api.post(
    `/interviews/${interviewId}/answer`,
    answerData,
  );

  return response.data;
};

export const getInterviews = async () => {
  const response = await api.get("/interviews");

  return response.data;
};

export const getInterviewDetails = async (
  interviewId,
) => {
  const response = await api.get(
    `/interviews/${interviewId}`,
  );

  return response.data;
};

export const getDashboard = async () => {
  const response = await api.get(
    "/interviews/dashboard",
  );

  return response.data;
};
// ==========================
// Dashboard du recruteur
// ==========================
export const getRecruiterDashboard = async () => {
  const response = await api.get(
    "/interviews/recruiter/dashboard",
  );

  return response.data;
};
export const getRecruiterInterviewDetails = async (
  interviewId,
) => {
  const response = await api.get(
    `/interviews/recruiter/${interviewId}`,
  );

  return response.data;
};

export default api;