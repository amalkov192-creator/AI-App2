"""
Scheduler — автоматический сбор и публикация новостей по расписанию.
Запускается внутри aiogram dispatcher через asyncio.
"""
import asyncio
import logging
from datetime import datetime, time as dtime
from aiogram import Bot
from sqlalchemy import select, desc
from database import NewsItem, AsyncSessionLocal
from services.collector import collect_and_analyse
from services.publisher import publish_to_channel
from config import config

log = logging.getLogger(__name__)

# Тихий режим: не публиковать с 23:00 до 08:00 МСК
QUIET_START = dtime(23, 0)
QUIET_END   = dtime(8, 0)

# Интервалы (секунды)
COLLECT_INTERVAL  = 15 * 60   # сбор каждые 15 минут
AUTOPUB_INTERVAL  = 5  * 60   # авто-публикация каждые 5 минут
CLEANUP_INTERVAL  = 24 * 3600 # очистка старых отклонённых раз в сутки

# Пороги авто-публикации
AUTO_IMPORTANCE = 8.0
AUTO_VIRAL      = 7.0


def is_quiet_time() -> bool:
    now = datetime.utcnow().time()  # UTC, adjust for your TZ if needed
    if QUIET_START < QUIET_END:
        return QUIET_START <= now <= QUIET_END
    return now >= QUIET_START or now <= QUIET_END


async def collect_loop(bot: Bot):
    """Периодический сбор новостей из RSS."""
    log.info("[scheduler] collect_loop started")
    while True:
        try:
            async with AsyncSessionLocal() as session:
                new_items = await collect_and_analyse(session)
            if new_items:
                log.info(f"[scheduler] collected {len(new_items)} new items")
                # Уведомить всех админов о новых новостях
                pending = [n for n in new_items if n.importance >= 7]
                if pending and config.ADMIN_IDS:
                    text = (
                        f"📬 <b>Новые новости в очереди: {len(pending)}</b>\n"
                        + "\n".join(f"• {n.title[:60]}…" for n in pending[:3])
                        + ("\n…" if len(pending) > 3 else "")
                        + "\n\n/queue для просмотра"
                    )
                    for admin_id in config.ADMIN_IDS:
                        try:
                            await bot.send_message(admin_id, text, parse_mode="HTML")
                        except Exception:
                            pass
        except Exception as e:
            log.error(f"[scheduler] collect error: {e}")

        await asyncio.sleep(COLLECT_INTERVAL)


async def autopublish_loop(bot: Bot):
    """Авто-публикация топовых новостей если importance+viral высокие."""
    log.info("[scheduler] autopublish_loop started")
    while True:
        await asyncio.sleep(AUTOPUB_INTERVAL)

        if is_quiet_time():
            log.debug("[scheduler] quiet time — skipping autopublish")
            continue

        try:
            async with AsyncSessionLocal() as session:
                result = await session.execute(
                    select(NewsItem)
                    .where(NewsItem.status == "pending")
                    .where(NewsItem.importance >= AUTO_IMPORTANCE)
                    .where(NewsItem.viral_score >= AUTO_VIRAL)
                    .order_by(desc(NewsItem.importance))
                    .limit(3)
                )
                items = result.scalars().all()

                for item in items:
                    ok = await publish_to_channel(bot, item, session)
                    if ok:
                        log.info(f"[scheduler] auto-published #{item.id}: {item.title[:50]}")
                        # уведомить админов
                        if config.ADMIN_IDS:
                            for admin_id in config.ADMIN_IDS:
                                try:
                                    await bot.send_message(
                                        admin_id,
                                        f"✅ Авто-опубликовано: <b>{item.title[:80]}</b>",
                                        parse_mode="HTML",
                                    )
                                except Exception:
                                    pass
                        await asyncio.sleep(30)  # пауза между публикациями
        except Exception as e:
            log.error(f"[scheduler] autopublish error: {e}")


async def cleanup_loop():
    """Удаляет старые отклонённые новости (старше 7 дней)."""
    log.info("[scheduler] cleanup_loop started")
    while True:
        await asyncio.sleep(CLEANUP_INTERVAL)
        try:
            from datetime import timedelta
            from sqlalchemy import delete
            cutoff = datetime.utcnow() - timedelta(days=7)
            async with AsyncSessionLocal() as session:
                await session.execute(
                    delete(NewsItem)
                    .where(NewsItem.status == "rejected")
                    .where(NewsItem.created_at < cutoff)
                )
                await session.commit()
            log.info("[scheduler] cleanup done")
        except Exception as e:
            log.error(f"[scheduler] cleanup error: {e}")


async def start_all(bot: Bot):
    """Запускает все фоновые задачи."""
    asyncio.create_task(collect_loop(bot))
    asyncio.create_task(autopublish_loop(bot))
    asyncio.create_task(cleanup_loop())
    log.info("[scheduler] all loops started")
