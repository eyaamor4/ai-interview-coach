# 🚀 AI Interview Coach

## 📌 Overview

**AI Interview Coach** is a full-stack AI-powered application designed to help candidates prepare for technical interviews and enable recruiters to evaluate candidate performance.

Powered by **Llama 3 through the Groq API**, the platform generates technical interview questions, evaluates candidate answers, and provides personalized AI-generated feedback.

The application features two dedicated interfaces: Candidate and Recruiter.

## ✨ Features

### 👩‍💻 Candidate Dashboard

- AI-generated technical interviews tailored to job roles and experience levels.
- Interactive interview practice.
- Automated answer evaluation using Llama 3.
- Personalized feedback and performance analysis.
- Interview history and progress tracking.

### 👨‍💼 Recruiter Dashboard

- Access candidate interview sessions.
- Review detailed interview reports.
- Analyze AI-generated evaluations.
- Monitor candidate performance.

## 🧠 AI Capabilities

The platform integrates **Llama 3 via Groq API** to provide:

- Technical interview question generation.
- Candidate answer evaluation.
- AI-powered feedback.
- Personalized interview preparation.

## 🛠️ Tech Stack

| Layer              | Technologies      |
| ------------------ | ----------------- |
| LLM                | Llama 3, Groq API |
| Backend            | Python, FastAPI   |
| ORM                | SQLAlchemy        |
| Database           | PostgreSQL 16     |
| Frontend           | React, Vite       |
| Authentication     | JWT               |
| Containerization   | Docker            |
| Orchestration      | Docker Compose    |
| CI/CD              | GitHub Actions    |
| Container Registry | Docker Hub        |
| Version Control    | Git, GitHub       |

## 🏗️ Architecture

The application uses a multi-container architecture orchestrated with Docker Compose.

```text
             AI INTERVIEW COACH
                     |
          +----------+----------+
          |                     |
     React + Vite          FastAPI
     Frontend              Backend
          |                     |
          |              +------+------+
          |              |             |
          |          PostgreSQL    Groq API
          |          Database      (Llama 3)
          |              |             |
          +--------------+-------------+
                         |
                  Docker Compose
```

## ⚙️ DevOps & CI/CD

DevOps practices implemented in this project:

- Dockerized frontend, backend, and PostgreSQL database.
- Multi-container orchestration using Docker Compose.
- Automated CI workflows using GitHub Actions.
- Automated Docker image building.
- Docker image publishing to Docker Hub.

## 🚀 Installation & Setup

### Prerequisites

- Git
- Docker
- Docker Compose
- Groq API key

### 1. Clone the repository

```bash
git clone https://github.com/eyaamor4/ai-interview-coach.git
cd ai-interview-coach
```

### 2. Configure environment variables

Create the backend environment file:

```bash
backend/.env
```

Configure the required variables, including your Groq API key and database connection settings, according to the backend configuration.

**Important:** Never commit API keys, passwords, or other sensitive credentials.

### 3. Build and run the application

```bash
docker compose up --build
```

### 4. Access the application

| Service           | URL                                                      |
| ----------------- | -------------------------------------------------------- |
| Frontend          | [http://localhost:5173](http://localhost:5173)           |
| Backend API       | [http://localhost:8000](http://localhost:8000)           |
| API Documentation | [http://localhost:8000/docs](http://localhost:8000/docs) |
| PostgreSQL        | localhost:5433                                           |

### 5. Stop the application

```bash
docker compose down
```

To stop the application and remove its containers while preserving the database volume:

```bash
docker compose down
```

## 🎯 What I Learned

Through this project, I strengthened my skills in:

- Generative AI and LLM integration.
- Prompt engineering and AI-powered evaluation.
- REST API development with FastAPI.
- Full-stack development with React.
- Database management with PostgreSQL.
- Docker and container orchestration.
- CI/CD automation with GitHub Actions.
- End-to-end application development.

## 👩‍💻 Author

**Eya Amor**

AI Engineer | Generative AI | LLMs | Python | Full-Stack Development | DevOps

- GitHub: [@eyaamor4](https://github.com/eyaamor4)
- Project: [AI Interview Coach](https://github.com/eyaamor4/ai-interview-coach)

---

⭐ If you find this project interesting, feel free to explore the repository and give it a star!
