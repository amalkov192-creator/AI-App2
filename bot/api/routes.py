"""
REST API для Mini App — фронт получает реальные данные из БД.
Монтируется к aiohttp-серверу рядом с webhook.
"""
import json
from aiohttp import web
from sqlalchemy import select, desc, func
from database import NewsItem, AsyncSessionLocal
from services.publisher import publish_to_channel
from config import config

routes = web.RouteTableDef()


def news_to_dict(item: NewsItem) -> dict:
    return {
        "id": item.id,
        "title": item.title,
        "summary": item.summary,
        "source_url": item.source_url,
        "source_name": item.source_name,
        "cat": item.category,
        "importance": item.importance,
        "viral": item.viral_score,
        "status": item.status,
        "tags": [t.strip() for t in item.tags.split(",") if t.strip()],
        "time": _relative_time(item.created_at),
        "published_at": item.published_at.isoformat() if item.published_at else None,
    }


def _relative_time(dt) -> str:
    if not dt:
        return "—"
    from datetime import datetime, timezone
    now = datetime.utcnow()
    diff = int((now - dt).total_seconds())
    if diff < 60:
        return f"{diff}с"
    if diff < 3600:
        return f"{diff // 60}м"
    if diff < 86400:
        return f"{diff // 3600}ч"
    return f"{diff // 86400}д"


def cors_headers():
    return {
        "Access-Control-Allow-Origin": config.WEBAPP_URL or "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }


# ── NEWS ─────────────────────────────────────────────────────

@routes.get("/api/news")
async def get_news(request: web.Request) -> web.Response:
    status = request.rel_url.query.get("status")  # pending / published / rejected
    limit = int(request.rel_url.query.get("limit", 50))

    async with AsyncSessionLocal() as session:
        q = select(NewsItem).order_by(desc(NewsItem.created_at)).limit(limit)
        if status:
            q = q.where(NewsItem.status == status)
        result = await session.execute(q)
        items = result.scalars().all()

    return web.Response(
        body=json.dumps([news_to_dict(n) for n in items]),
        content_type="application/json",
        headers=cors_headers(),
    )


@routes.post("/api/news/{news_id}/approve")
async def approve_news(request: web.Request) -> web.Response:
    news_id = int(request.match_info["news_id"])
    async with AsyncSessionLocal() as session:
        item = await session.get(NewsItem, news_id)
        if not item:
            return web.Response(status=404, text="Not found", headers=cors_headers())
        if item.status == "published":
            return web.Response(status=400, text="Already published", headers=cors_headers())

        bot = request.app["bot"]
        ok = await publish_to_channel(bot, item, session)

    return web.Response(
        body=json.dumps({"ok": ok, "item": news_to_dict(item)}),
        content_type="application/json",
        headers=cors_headers(),
    )


@routes.post("/api/news/{news_id}/reject")
async def reject_news(request: web.Request) -> web.Response:
    news_id = int(request.match_info["news_id"])
    async with AsyncSessionLocal() as session:
        item = await session.get(NewsItem, news_id)
        if not item:
            return web.Response(status=404, text="Not found", headers=cors_headers())
        item.status = "rejected"
        await session.commit()

    return web.Response(
        body=json.dumps({"ok": True, "item": news_to_dict(item)}),
        content_type="application/json",
        headers=cors_headers(),
    )


# ── STATS ─────────────────────────────────────────────────────

@routes.get("/api/stats")
async def get_stats(request: web.Request) -> web.Response:
    async with AsyncSessionLocal() as session:
        total     = (await session.execute(select(func.count(NewsItem.id)))).scalar()
        published = (await session.execute(
            select(func.count(NewsItem.id)).where(NewsItem.status == "published")
        )).scalar()
        pending   = (await session.execute(
            select(func.count(NewsItem.id)).where(NewsItem.status == "pending")
        )).scalar()
        rejected  = (await session.execute(
            select(func.count(NewsItem.id)).where(NewsItem.status == "rejected")
        )).scalar()

        # категории
        cat_rows = (await session.execute(
            select(NewsItem.category, func.count(NewsItem.id))
            .group_by(NewsItem.category)
        )).all()

    return web.Response(
        body=json.dumps({
            "total": total,
            "published": published,
            "pending": pending,
            "rejected": rejected,
            "categories": {cat: cnt for cat, cnt in cat_rows},
        }),
        content_type="application/json",
        headers=cors_headers(),
    )


# ── COLLECT trigger ───────────────────────────────────────────

@routes.post("/api/collect")
async def trigger_collect(request: web.Request) -> web.Response:
    """Запускает сбор новостей вручную из Mini App."""
    from services.collector import collect_and_analyse
    async with AsyncSessionLocal() as session:
        new_items = await collect_and_analyse(session)

    return web.Response(
        body=json.dumps({"ok": True, "collected": len(new_items)}),
        content_type="application/json",
        headers=cors_headers(),
    )


# ── OPTIONS preflight ─────────────────────────────────────────

@routes.options("/{path_info:.*}")
async def options_handler(request: web.Request) -> web.Response:
    return web.Response(status=204, headers=cors_headers())
