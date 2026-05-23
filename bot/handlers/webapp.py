"""
WebApp handler — принимает данные из Mini App (approve/reject/chat).
Telegram Mini App отправляет данные через sendData() → message.web_app_data.
"""
import json
from aiogram import Router, F
from aiogram.types import Message
from sqlalchemy.ext.asyncio import AsyncSession

from database import NewsItem, AsyncSessionLocal
from services.publisher import publish_to_channel
from middlewares.auth import admin_only

router = Router()


@router.message(F.web_app_data)
@admin_only
async def handle_webapp_data(message: Message):
    """
    Mini App шлёт JSON через Telegram.sendData():
    { "action": "approve"|"reject", "news_id": 123 }
    """
    try:
        data = json.loads(message.web_app_data.data)
        action = data.get("action")
        news_id = data.get("news_id")

        if not action or not news_id:
            await message.answer("⚠ Некорректные данные из Mini App")
            return

        async with AsyncSessionLocal() as session:
            item = await session.get(NewsItem, news_id)
            if not item:
                await message.answer(f"❌ Новость #{news_id} не найдена")
                return

            if action == "approve":
                ok = await publish_to_channel(message.bot, item, session)
                await message.answer(
                    f"✅ Новость опубликована в канал!" if ok else "❌ Ошибка публикации"
                )
            elif action == "reject":
                item.status = "rejected"
                await session.commit()
                await message.answer(f"❌ Новость #{news_id} отклонена")
            else:
                await message.answer(f"⚠ Неизвестное действие: {action}")

    except json.JSONDecodeError:
        await message.answer("⚠ Ошибка парсинга данных из Mini App")
    except Exception as e:
        await message.answer(f"⚠ Ошибка: {e}")
