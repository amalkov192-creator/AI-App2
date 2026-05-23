"""
Вспомогательный скрипт — настраивает BotFather команды и Menu Button (Mini App).
Запускается один раз: python setup_bot.py
"""
import asyncio
from aiogram import Bot
from aiogram.types import BotCommand, MenuButtonWebApp, WebAppInfo
from config import config


async def setup():
    bot = Bot(token=config.BOT_TOKEN)

    # Команды
    await bot.set_my_commands([
        BotCommand(command="start",   description="Главное меню"),
        BotCommand(command="app",     description="Открыть Mini App Dashboard"),
        BotCommand(command="queue",   description="Очередь новостей"),
        BotCommand(command="stats",   description="Статистика канала"),
        BotCommand(command="collect", description="Запустить сбор новостей"),
        BotCommand(command="help",    description="Все команды"),
    ])
    print("✅ Команды установлены")

    # Menu Button → открывает Mini App одним нажатием
    await bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(
            text="📱 Dashboard",
            web_app=WebAppInfo(url=config.WEBAPP_URL),
        )
    )
    print(f"✅ Menu Button настроена → {config.WEBAPP_URL}")

    await bot.session.close()
    print("\nГотово! Теперь в боте будет кнопка Dashboard рядом с полем ввода.")


if __name__ == "__main__":
    asyncio.run(setup())
