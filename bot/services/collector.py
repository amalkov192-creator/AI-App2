"""Collector Agent — сбор новостей из RSS."""
import feedparser
import asyncio
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database import NewsItem
from services.analyst import analyse_news

RSS_FEEDS = [
    "https://feeds.feedburner.com/oreilly/radar",
    "https://techcrunch.com/feed/",
    "https://venturebeat.com/feed/",
    "https://openai.com/blog/rss/",
]


async def collect_and_analyse(session: AsyncSession) -> list[NewsItem]:
    """Собирает RSS, анализирует новые новости через Analyst Agent."""
    new_items = []

    for feed_url in RSS_FEEDS:
        try:
            loop = asyncio.get_event_loop()
            feed = await loop.run_in_executor(None, feedparser.parse, feed_url)
        except Exception as e:
            print(f"[collector] feed error {feed_url}: {e}")
            continue

        for entry in feed.entries[:5]:  # последние 5 из каждого фида
            title = entry.get("title", "")
            url = entry.get("link", "")

            if not title:
                continue

            # проверяем дубликат
            existing = await session.execute(
                select(NewsItem).where(NewsItem.source_url == url)
            )
            if existing.scalar_one_or_none():
                continue

            # анализируем через Claude
            analysis = await analyse_news(title, url)

            item = NewsItem(
                title=title,
                summary=analysis.get("summary", title),
                source_url=url,
                source_name=feed_url.split("/")[2],
                category=analysis.get("category", "Other"),
                importance=analysis.get("importance", 5),
                viral_score=analysis.get("viral_score", 5),
                status="pending",
                tags=",".join(analysis.get("tags", [])),
                created_at=datetime.utcnow(),
            )
            session.add(item)
            new_items.append(item)

    await session.commit()
    return new_items
