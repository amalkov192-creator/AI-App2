"""
Admin handlers — команды для редактора.
Открывают Mini App, показывают очередь, принимают решения.
"""
from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import (
    Message, CallbackQuery,
    InlineKeyboardMarkup, InlineKeyboardButton,
    WebAppInfo,
)
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from config import config
from database import NewsItem, AsyncSessionLocal
from services.publisher import publish_to_channel
from middlewares.auth import admin_only

router = Router()


def main_keyboard() -> InlineKeyboardMarkup:
    """Главная клавиатура с кнопкой открытия Mini App."""
    return InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(
            text="📱 Открыть Dashboard",
            web_app=WebAppInfo(url=config.WEBAPP_URL),
        ),
        InlineKeyboardButton(text="📋 Очередь", callback_data="queue"),
    ], [
        InlineKeyboardButton(text="📊 Статистика", callback_data="stats"),
        InlineKeyboardButton(text="🔄 Запустить сбор", callback_data="collect"),
    ]])


@router.message(Command("start"))
@admin_only
async def cmd_start(message: Message):
    await message.answer(
        "👋 <b>NewsAgent Dashboard</b>\n\n"
        "Управляй новостным каналом прямо из Telegram.\n"
        "Открой Mini App для полного интерфейса или используй быстрые команды.",
        parse_mode="HTML",
        reply_markup=main_keyboard(),
    )


@router.message(Command("help"))
@admin_only
async def cmd_help(message: Message):
    await message.answer(
        "<b>Команды бота:</b>\n\n"
        "/start — главное меню\n"
        "/queue — очередь на одобрение\n"
        "/stats — статистика канала\n"
        "/collect — запустить сбор новостей\n"
        "/publish &lt;id&gt; — опубликовать новость\n"
        "/reject &lt;id&gt; — отклонить новость\n"
        "/app — открыть Mini App",
        parse_mode="HTML",
    )


@router.message(Command("app"))
@admin_only
async def cmd_app(message: Message):
    """Открывает Mini App одной кнопкой."""
    await message.answer(
        "🚀 Открой полный дашборд:",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[[
            InlineKeyboardButton(
                text="📱 NewsAgent Dashboard",
                web_app=WebAppInfo(url=config.WEBAPP_URL),
            )
        ]]),
    )


@router.message(Command("queue"))
@admin_only
async def cmd_queue(message: Message):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(NewsItem)
            .where(NewsItem.status == "pending")
            .order_by(desc(NewsItem.importance))
            .limit(5)
        )
        items = result.scalars().all()

    if not items:
        await message.answer("✅ Очередь пуста — всё обработано!")
        return

    for item in items:
        kb = InlineKeyboardMarkup(inline_keyboard=[[
            InlineKeyboardButton(text="✅ Опубликовать", callback_data=f"pub:{item.id}"),
            InlineKeyboardButton(text="❌ Отклонить", callback_data=f"rej:{item.id}"),
        ]])
        cat_emoji = {"AI":"🤖","Crypto":"₿","Tech":"💻"}.get(item.category, "📰")
        await message.answer(
            f"{cat_emoji} <b>{item.title}</b>\n\n"
            f"⚡ Важность: {item.importance}/10 | 🔥 Вирал: {item.viral_score}/10\n"
            f"📝 {item.summary}",
            parse_mode="HTML",
            reply_markup=kb,
        )


@router.message(Command("stats"))
@admin_only
async def cmd_stats(message: Message):
    async with AsyncSessionLocal() as session:
        from sqlalchemy import func
        total = (await session.execute(select(func.count(NewsItem.id)))).scalar()
        published = (await session.execute(
            select(func.count(NewsItem.id)).where(NewsItem.status == "published")
        )).scalar()
        pending = (await session.execute(
            select(func.count(NewsItem.id)).where(NewsItem.status == "pending")
        )).scalar()

    await message.answer(
        f"📊 <b>Статистика NewsAgent</b>\n\n"
        f"📰 Всего новостей: {total}\n"
        f"✅ Опубликовано: {published}\n"
        f"⏳ В очереди: {pending}\n"
        f"❌ Отклонено: {total - published - pending}",
        parse_mode="HTML",
    )


@router.message(Command("collect"))
@admin_only
async def cmd_collect(message: Message):
    from services.collector import collect_and_analyse
    msg = await message.answer("🔄 Запускаю сбор новостей...")
    async with AsyncSessionLocal() as session:
        new_items = await collect_and_analyse(session)
    await msg.edit_text(
        f"✅ Собрано <b>{len(new_items)}</b> новых новостей.\n"
        "Используй /queue для просмотра очереди.",
        parse_mode="HTML",
    )


@router.message(Command("publish"))
@admin_only
async def cmd_publish(message: Message):
    parts = message.text.split()
    if len(parts) < 2 or not parts[1].isdigit():
        await message.answer("Использование: /publish <id>")
        return
    news_id = int(parts[1])
    async with AsyncSessionLocal() as session:
        item = await session.get(NewsItem, news_id)
        if not item:
            await message.answer("❌ Новость не найдена")
            return
        ok = await publish_to_channel(message.bot, item, session)
    await message.answer("✅ Опубликовано!" if ok else "❌ Ошибка публикации")


@router.message(Command("reject"))
@admin_only
async def cmd_reject(message: Message):
    parts = message.text.split()
    if len(parts) < 2 or not parts[1].isdigit():
        await message.answer("Использование: /reject <id>")
        return
    news_id = int(parts[1])
    async with AsyncSessionLocal() as session:
        item = await session.get(NewsItem, news_id)
        if not item:
            await message.answer("❌ Новость не найдена")
            return
        item.status = "rejected"
        await session.commit()
    await message.answer("✅ Новость отклонена")


# ── Callback: inline кнопки ──
@router.callback_query(F.data.startswith("pub:"))
async def cb_publish(call: CallbackQuery):
    news_id = int(call.data.split(":")[1])
    async with AsyncSessionLocal() as session:
        item = await session.get(NewsItem, news_id)
        ok = await publish_to_channel(call.bot, item, session) if item else False
    await call.answer("✅ Опубликовано!" if ok else "❌ Ошибка")
    await call.message.edit_reply_markup(reply_markup=None)


@router.callback_query(F.data.startswith("rej:"))
async def cb_reject(call: CallbackQuery):
    news_id = int(call.data.split(":")[1])
    async with AsyncSessionLocal() as session:
        item = await session.get(NewsItem, news_id)
        if item:
            item.status = "rejected"
            await session.commit()
    await call.answer("❌ Отклонено")
    await call.message.edit_reply_markup(reply_markup=None)


@router.callback_query(F.data == "queue")
async def cb_queue(call: CallbackQuery):
    await call.answer()
    await cmd_queue(call.message)


@router.callback_query(F.data == "stats")
async def cb_stats(call: CallbackQuery):
    await call.answer()
    await cmd_stats(call.message)


@router.callback_query(F.data == "collect")
async def cb_collect(call: CallbackQuery):
    await call.answer("Запускаю сбор...", show_alert=False)
    await cmd_collect(call.message)
