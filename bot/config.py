from dataclasses import dataclass
import os
from dotenv import load_dotenv

load_dotenv()

@dataclass
class Config:
    # Telegram
    BOT_TOKEN: str = os.getenv("BOT_TOKEN", "")
    CHANNEL_ID: str = os.getenv("CHANNEL_ID", "")          # @yourchannel or -100xxx
    ADMIN_IDS: list[int] = None                              # filled below
    WEBAPP_URL: str = os.getenv("WEBAPP_URL", "")           # https://yourdomain.com

    # Webhook
    WEBHOOK_HOST: str = os.getenv("WEBHOOK_HOST", "")       # https://yourdomain.com
    WEBHOOK_PATH: str = "/webhook"
    WEBHOOK_SECRET: str = os.getenv("WEBHOOK_SECRET", "supersecret")

    # Anthropic
    GEMINI_API_KEY : str = os.getenv("GEMINI_API_KEY", "")

    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379/0")

    # DB
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@db:5432/newsagent")

    def __post_init__(self):
        raw = os.getenv("ADMIN_IDS", "")
        self.ADMIN_IDS = [int(x.strip()) for x in raw.split(",") if x.strip()]


config = Config()
