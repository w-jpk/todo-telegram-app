# Инструкция по развертыванию

## Требования

- Node.js 18+ 
- PostgreSQL 12+
- Telegram Bot Token

## Локальная разработка

1. Клонируйте репозиторий
2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/todo_app
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
NODE_ENV=development
PORT=3002
```

4. Запустите PostgreSQL и создайте базу данных:
```sql
CREATE DATABASE todo_app;
```

5. Запустите приложение:
```bash
npm run dev
```

База данных будет инициализирована автоматически при первом запуске.

## Развертывание в продакшене

### Вариант 1: Vercel / Netlify

1. Подключите репозиторий к Vercel/Netlify
2. Добавьте переменные окружения:
   - `DATABASE_URL` - строка подключения к PostgreSQL
   - `TELEGRAM_BOT_TOKEN` - токен Telegram бота
   - `NODE_ENV=production`
   - `PORT=3002` - порт для запуска приложения (опционально, по умолчанию 3002)

3. Деплой будет выполнен автоматически

### Вариант 2: Docker

Создайте `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3002

CMD ["node", ".output/server/index.mjs"]
```

Создайте `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3002:3002"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/todo_app
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - NODE_ENV=production
      - PORT=3002
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=todo_app
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Запустите:
```bash
docker-compose up -d
```

### Вариант 3: VPS сервер

1. Установите Node.js и PostgreSQL на сервере
2. Клонируйте репозиторий
3. Установите зависимости: `npm install`
4. Настройте переменные окружения (создайте `.env` файл):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/todo_app
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
NODE_ENV=production
PORT=3002
```
5. Соберите приложение: `npm run build`
6. Запустите с помощью PM2:
```bash
PORT=3002 pm2 start .output/server/index.mjs --name todo-app
```

## Настройка Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/botfather)
2. Получите токен бота
3. Создайте Mini App:
   - Отправьте `/newapp` BotFather
   - Выберите вашего бота
   - Укажите название и описание
   - Укажите URL вашего приложения (должен быть HTTPS)
   - Добавьте иконку (опционально)

4. Настройте команды бота:
   - `/setcommands`
   - Выберите вашего бота
   - Добавьте команды (опционально)

## Настройка уведомлений

### ✅ Встроенный планировщик (Рекомендуется)

**Приложение включает встроенный планировщик задач, который автоматически запускается при старте сервера.**

Просто запустите приложение на VPS - уведомления будут работать автоматически:
```bash
pm2 start .output/server/index.mjs --name todo-app
```

Планировщик автоматически:
- Отправляет ежедневные уведомления в 9:00 UTC
- Отправляет напоминания в 9:00 UTC
- Отправляет уведомления о просроченных задачах в 9:00 UTC

**Настройка времени:**
Измените расписание в `server/plugins/scheduler.ts`:
```typescript
// Например, для 10:00 по Москве (UTC+3 = 7:00 UTC)
cron.schedule('0 7 * * *', async () => {
  // ...
}, { timezone: 'Europe/Moscow' })
```

### Альтернатива: Внешний cron job

Если хотите использовать внешний cron вместо встроенного планировщика:

```bash
# Добавьте в crontab
0 9 * * * curl -X POST https://your-domain.com/api/notifications/daily
0 9 * * * curl -X POST https://your-domain.com/api/notifications/reminders
0 9 * * * curl -X POST https://your-domain.com/api/notifications/overdue
```

**Примечание:** Если используете внешний cron, отключите встроенный планировщик, удалив или переименовав файл `server/plugins/scheduler.ts`.

### Внешние сервисы

- [Cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- [Zapier](https://zapier.com)

## Проверка работы

1. Откройте вашего бота в Telegram
2. Нажмите на кнопку Mini App (если настроена)
3. Или перейдите по прямой ссылке: `https://t.me/your_bot/app_name`

Приложение должно загрузиться и показать интерфейс управления задачами.

## Troubleshooting

### Ошибка подключения к базе данных

- Проверьте, что PostgreSQL запущен
- Проверьте строку подключения в `.env`
- Убедитесь, что база данных создана

### Telegram Web App не загружается

- Убедитесь, что приложение доступно по HTTPS
- Проверьте настройки бота в BotFather
- Проверьте консоль браузера на ошибки

### Уведомления не отправляются

- Проверьте токен бота
- Убедитесь, что пользователь начал диалог с ботом
- Проверьте логи сервера

