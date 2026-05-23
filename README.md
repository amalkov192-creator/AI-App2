# NewsAgent — Telegram Mini App + Bot

Полный стек: React фронтенд, aiogram бот, PostgreSQL, Redis, Docker.

---

## Архитектура

```
Telegram User
    │
    ▼
Telegram Bot (@YourNewsAgentBot)
    │  /start, /queue, /collect
    │  Menu Button → Mini App
    │
    ├── Webhook POST /webhook ──► Bot (aiogram, port 8080)
    │                                  │
    │                            ┌─────┴──────┐
    │                           DB          Redis
    │                        (PostgreSQL)  (FSM state)
    │
    └── Mini App URL ──────────► Nginx (443) ──► Frontend (React, port 80)
                                                      │
                                              sendData() → Bot
                                         (approve / reject новостей)
```

---

## Быстрый старт

### 1. Подготовка

```bash
git clone <repo>
cd news-agent-app
cp .env.example .env
# Заполни .env (см. ниже)
```

### 2. Создай бота у @BotFather

```
/newbot
→ Получи BOT_TOKEN

/newapp (или через existing bot)
→ Укажи WEBAPP_URL = https://yourdomain.com
```

### 3. .env — заполни обязательные поля

```env
BOT_TOKEN=7123456789:AAxxxxxx
CHANNEL_ID=@yourchannel
ADMIN_IDS=123456789          # твой Telegram ID (узнать: @userinfobot)
WEBAPP_URL=https://yourdomain.com
WEBHOOK_HOST=https://yourdomain.com
GEMINI_API_KEY =sk-ant-xxx
DOMAIN=yourdomain.com
SSL_EMAIL=your@email.com
DB_PASSWORD=strongpassword
WEBHOOK_SECRET=randomstring32chars
```

### 4. Получи SSL (Let's Encrypt)

```bash
# Сначала подними только nginx без SSL для верификации домена:
docker compose up nginx -d

# Получи сертификат:
docker compose --profile ssl up certbot

# Перезапусти всё:
docker compose up -d
```

### 5. Запуск

```bash
docker compose up -d --build
```

### 6. Настройка кнопки в боте (один раз)

```bash
docker compose exec bot python setup_bot.py
```

После этого в боте появится кнопка **📱 Dashboard** — нажатие открывает Mini App прямо в Telegram.

---

## Структура проекта

```
news-agent-app/
├── src/                        # React + TypeScript фронтенд
│   ├── hooks/
│   │   ├── useChat.ts          # Стриминг с Claude API
│   │   └── useTelegram.ts      # Telegram Mini App SDK обёртка
│   ├── store/index.ts          # Zustand state
│   └── pages/                  # Feed, Chat, Analytics, Detail, Settings
│
├── bot/                        # Python aiogram бот
│   ├── main.py                 # Точка входа (webhook / polling)
│   ├── config.py               # Все настройки из .env
│   ├── database.py             # SQLAlchemy модели
│   ├── setup_bot.py            # Настройка BotFather (один раз)
│   ├── handlers/
│   │   ├── admin.py            # /start /queue /stats /collect /publish /reject
│   │   └── webapp.py           # Приём данных из Mini App (sendData)
│   ├── middlewares/
│   │   └── auth.py             # Проверка ADMIN_IDS
│   └── services/
│       ├── analyst.py          # Claude → JSON анализ новости
│       ├── collector.py        # RSS сбор + анализ
│       └── publisher.py        # Публикация в Telegram канал
│
├── nginx/
│   ├── nginx.conf              # Worker config
│   └── proxy.conf              # SSL + reverse proxy (bot + frontend)
│
├── docker-compose.yml          # Все сервисы
├── Dockerfile.frontend         # Multi-stage: Vite build → Nginx
├── bot/Dockerfile              # Python bot image
└── .env.example                # Шаблон переменных окружения
```

---

## Флоу работы

```
RSS Feed → Collector Agent (feedparser)
               ↓
         Analyst Agent (Claude) → importance/viral/category/tags
               ↓
         PostgreSQL (status=pending)
               ↓
    Бот шлёт уведомление админу
               ↓
    Админ открывает Mini App / нажимает кнопки в боте
               ↓
    approve → Publisher Agent → Telegram Channel
    reject  → status=rejected
```

---

## Локальная разработка (без Docker)

```bash
# Frontend
npm install
npm run dev   # → localhost:3000

# Bot (polling mode — без webhook)
cd bot
pip install -r requirements.txt
# В .env убери WEBHOOK_HOST (оставь пустым)
python main.py
```

---

## Команды бота

| Команда | Описание |
|---------|----------|
| `/start` | Главное меню + кнопка открытия Mini App |
| `/app` | Открыть Mini App Dashboard |
| `/queue` | Список новостей в очереди с кнопками |
| `/stats` | Статистика (всего / опубликовано / в очереди) |
| `/collect` | Запустить сбор новостей вручную |
| `/publish <id>` | Опубликовать новость по ID |
| `/reject <id>` | Отклонить новость по ID |

