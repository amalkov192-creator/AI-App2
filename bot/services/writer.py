"""
Writer Agent — генерирует готовый пост для Telegram канала.
"""

import asyncio

from google import genai

from config import config
from database import NewsItem

client = genai.Client(api_key=config.GEMINI_API_KEY)

CATEGORY_EMOJI = {
    "AI": "🤖",
    "Crypto": "₿",
    "Tech": "💻",
    "Other": "📰",
}

WRITER_PROMPT = """Ты — Writer Agent новостного Telegram-канала про технологии и AI.

Напиши пост для канала на основе новости. Требования:
- Язык: русский
- Длина: 3-5 предложений, максимум 600 символов
- Тон: экспертный но доступный, без воды
- Начни с самого важного (inverted pyramid)
- Добавь 1-2 эмодзи органично внутри текста
- В конце: ключевой вывод или вопрос для аудитории
- НЕ добавляй хэштеги
- НЕ используй markdown разметку

Новость:
Заголовок: {title}
Краткое содержание: {summary}
Категория: {category}
Важность: {importance}/10
"""


async def generate_post(item: NewsItem) -> str:
    """Генерирует текст поста через Gemini."""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=WRITER_PROMPT.format(
                title=item.title,
                summary=item.summary or item.title,
                category=item.category,
                importance=item.importance,
            ),
        )

        return response.text.strip()

    except Exception as e:
        print(f"[writer] error: {e}")

        return item.summary or item.title


async def generate_ab_variants(item: NewsItem) -> tuple[str, str]:
    """Генерирует A/B варианты поста."""

    prompt_a = (
        WRITER_PROMPT.format(
            title=item.title,
            summary=item.summary or item.title,
            category=item.category,
            importance=item.importance,
        )
        + "\n\nВариант A: сделай акцент на фактах и цифрах."
    )

    prompt_b = (
        WRITER_PROMPT.format(
            title=item.title,
            summary=item.summary or item.title,
            category=item.category,
            importance=item.importance,
        )
        + "\n\nВариант B: сделай акцент на влиянии для читателя."
    )

    async def generate(prompt: str) -> str:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        return response.text.strip()

    try:
        result_a, result_b = await asyncio.gather(
            generate(prompt_a),
            generate(prompt_b),
        )

        return result_a, result_b

    except Exception as e:
        print(f"[writer] ab error: {e}")

        text = item.summary or item.title

        return text, text