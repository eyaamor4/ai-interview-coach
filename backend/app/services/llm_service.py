from groq import Groq

from app.core.config import settings
import json
from typing import Any
from sqlalchemy.orm import Session

from app.models.interview import Interview as InterviewModel

def generate_interview_question(
    job_title: str,
    level: str,
) -> str:
    if not settings.GROQ_API_KEY:
        raise ValueError("La clé GROQ_API_KEY est absente du fichier .env.")

    client = Groq(api_key=settings.GROQ_API_KEY)

    prompt = f"""
Tu es un recruteur technique expérimenté.

Génère une seule question d'entretien technique pour le poste suivant :
- Poste : {job_title}
- Niveau : {level}

Contraintes :
- La question doit être adaptée au niveau du candidat.
- Elle doit être claire et précise.
- Ne donne pas la réponse.
- Retourne uniquement la question.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        temperature=0.7,
        max_tokens=200,
    )

    question = response.choices[0].message.content

    if not question:
        raise ValueError("Groq n’a retourné aucune question.")

    return question.strip()

def evaluate_interview_answer(
    question: str,
    answer: str,
    job_title: str,
    level: str,
) -> dict[str, Any]:
    if not settings.GROQ_API_KEY:
        raise ValueError("La clé GROQ_API_KEY est absente du fichier .env.")

    client = Groq(api_key=settings.GROQ_API_KEY)

    prompt = f"""
Tu es un recruteur technique expérimenté.

Poste : {job_title}
Niveau : {level}

Question :
{question}

Réponse du candidat :
{answer}

Évalue la réponse de manière juste et adaptée au niveau demandé.

Retourne uniquement un objet JSON valide avec cette structure exacte :
{{
  "score": 7.5,
  "strengths": ["point positif 1", "point positif 2"],
  "weaknesses": ["élément manquant 1"],
  "feedback": "Commentaire court et utile"
}}

Contraintes :
- score compris entre 0 et 10 ;
- aucun texte avant ou après le JSON ;
- strengths et weaknesses doivent être des listes de chaînes ;
- le feedback doit être concis.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        temperature=0.2,
        max_tokens=500,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content

    if not content:
        raise ValueError("Groq n’a retourné aucune évaluation.")

    evaluation = json.loads(content)

    score = float(evaluation.get("score", 0))

    if score < 0 or score > 10:
        raise ValueError("Le score retourné par Groq est invalide.")

    return {
        "score": score,
        "strengths": evaluation.get("strengths", []),
        "weaknesses": evaluation.get("weaknesses", []),
        "feedback": evaluation.get("feedback", ""),
    }