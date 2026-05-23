"""Publisher Agent — генерирует пост через Writer Agent и публикует в канал."""
from aiogram import Bot
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from sqlalchemy.ext.asyncio import AsyncSession
from database import NewsItem
from datetime import datetime
from config import config
from services.writer import generate_post

CATEGORY_EMOJI = {"AI": "🤖", "Crypto": "₿", "Tech": "💻", "Other": "📰"}


async def format_post(item: NewsItem) -> str:
    """Генерирует текст поста: Writer Agent + теги + ссылка."""
    emoji = CATEGORY_EMOJI.get(item.category, "📰")
    tags = " ".join(f"#{t.strip()}" for t in item.tags.split(",") if t.strip())

    # Writer Agent генерирует основной текст
    body = await generate_post(item)

    parts = [f"{emoji} {body}"]
    if tags:
        parts.append(f"\n{tags}")
    if item.source_url:
        parts.append(f'\n<a href="{item.source_url}">Источник →</a>')

    return "\n".join(parts)


async def publish_to_channel(bot: Bot, item: NewsItem, session: AsyncSession) -> bool:
    try:
        text = await format_post(item)
        msg = await bot.send_message(
            chat_id=config.CHANNEL_ID,
            text=text,
            parse_mode="HTML",
            disable_web_page_preview=False,
        )
        item.status = "published"
        item.published_at = datetime.utcnow()
        item.tg_message_id = msg.message_id
        await session.commit()
        return True
    except Exception as e:
        print(f"[publisher] error: {e}")
        return False
