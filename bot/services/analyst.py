"""Analyst Agent — AI-анализ новостей через Gemini."""

import json
from google import genai
from config import config

client = genai.Client(api_key=config.GEMINI_API_KEY)

ANALYSE_PROMPT = """Ты — Analyst Agent новостного Telegram-канала про технологии и AI.

Проанализируй новость и верни ТОЛЬКО JSON без markdown:
{
  "importance": <1-10>,
  "viral_score": <1-10>,
  "category": <"AI"|"Crypto"|"Tech"|"Other">,
  "tags": ["тег1","тег2","тег3"],
  "summary": "<1-2 предложения на русском>",
  "publish": <true если importance>=7 и viral>=6>
}

TITLE: {title}
URL: {url}"""


async def analyse_news(title: str, url: str = "") -> dict:
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=ANALYSE_PROMPT.format(
                title=title,
                url=url
            ),
        )

        raw = (
            response.text
            .strip()
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        return json.loads(raw)

    except Exception as e:
        print(f"[analyst] error: {e}")

        return {
            "importance": 5,
            "viral_score": 5,
            "category": "Other",
            "tags": [],
            "summary": title,
            "publish": False,
        }
