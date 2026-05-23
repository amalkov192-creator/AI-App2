"""Auth middleware — только администраторы."""
import functools
from aiogram.types import Message, CallbackQuery
from config import config


def admin_only(func):
    """Декоратор: пропускает только ADMIN_IDS."""
    @functools.wraps(func)
    async def wrapper(event, *args, **kwargs):
        user = event.from_user if hasattr(event, "from_user") else None
        if user and config.ADMIN_IDS and user.id not in config.ADMIN_IDS:
            if isinstance(event, CallbackQuery):
                await event.answer("⛔ Доступ запрещён", show_alert=True)
            else:
                await event.answer("⛔ Доступ запрещён")
            return
        return await func(event, *args, **kwargs)
    return wrapper
