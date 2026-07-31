import os

from dotenv import load_dotenv


load_dotenv()


class Settings:
    GROQ_API_KEY: str | None = os.getenv("GROQ_API_KEY")
    DATABASE_URL: str | None = os.getenv("DATABASE_URL")

    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY",
        "change-this-secret-key",
    )

    JWT_ALGORITHM: str = os.getenv(
        "JWT_ALGORITHM",
        "HS256",
    )

    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv(
            "ACCESS_TOKEN_EXPIRE_MINUTES",
            "1440",
        ),
    )


settings = Settings()