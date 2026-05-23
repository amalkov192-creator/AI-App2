"""
Точка входа бота.
- webhook (prod): aiohttp сервер на :8080, /webhook + /api/*
- polling (dev): asyncio polling без сервера
"""
import asyncio
import logging
from aiogram.client.default import DefaultBotProperties
from aiogram import Bot
from aiohttp import web
from aiogram import Bot, Dispatcher
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application
from aiogram.fsm.storage.redis import RedisStorage

from config import config
from database import init_db
from handlers import admin, webapp
from api.routes import routes as api_routes
from services.scheduler import start_all

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
log = logging.getLogger(__name__)


async def on_startup(bot: Bot, dispatcher: Dispatcher):
    await init_db()
    log.info("DB initialized")

    if config.WEBHOOK_HOST:
        webhook_url = f"{config.WEBHOOK_HOST}{config.WEBHOOK_PATH}"
        await bot.set_webhook(
            url=webhook_url,
            secret_token=config.WEBHOOK_SECRET,
            allowed_updates=["message", "callback_query"],
            drop_pending_updates=True,
        )
        log.info(f"Webhook → {webhook_url}")

    # Запускаем scheduler (сбор + авто-публикация + cleanup)
    await start_all(bot)


async def on_shutdown(bot: Bot):
    if config.WEBHOOK_HOST:
        await bot.delete_webhook()
    await bot.session.close()
    log.info("Bot stopped")


def build_dispatcher() -> Dispatcher:
    storage = RedisStorage.from_url(config.REDIS_URL)
    dp = Dispatcher(storage=storage)
    dp.include_router(admin.router)
    dp.include_router(webapp.router)
    dp.startup.register(on_startup)
    dp.shutdown.register(on_shutdown)
    return dp


def run_webhook(bot: Bot, dp: Dispatcher):
    app = web.Application()

    # Telegram webhook handler
    handler = SimpleRequestHandler(
        dispatcher=dp,
        bot=bot,
        secret_token=config.WEBHOOK_SECRET,
    )
    handler.register(app, path=config.WEBHOOK_PATH)
    setup_application(app, dp, bot=bot)

    # REST API для Mini App — добавляем роуты
    app.add_routes(api_routes)

    # Пробрасываем bot в app для использования в api/routes.py
    app["bot"] = bot

    log.info("Starting aiohttp on :8080")
    web.run_app(app, host="0.0.0.0", port=8080)


async def run_polling(bot: Bot, dp: Dispatcher):
    # В polling-режиме поднимаем лёгкий API-сервер на отдельном порту
    app = web.Application()
    app.add_routes(api_routes)
    app["bot"] = bot

    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", 8081)
    await site.start()
    log.info("API server on :8081 (polling dev mode)")

    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)


if __name__ == "__main__":
    bot = Bot(
    token=config.BOT_TOKEN,
    default=DefaultBotProperties(parse_mode="HTML")
)
    dp  = build_dispatcher()

    if config.WEBHOOK_HOST:
        run_webhook(bot, dp)
    else:
        asyncio.run(run_polling(bot, dp))
