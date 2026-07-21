# Дом на Южной

Сайт аренды дома в Борисове, созданный на Next.js 15, React, TypeScript и Tailwind CSS.

## Локальный запуск

Требуется Node.js 20 или новее.

```bash
npm install
npm run dev
```

После запуска сайт будет доступен по адресу `http://localhost:3000`.

## Производственная сборка

```bash
npm install
npm run build
npm run start
```

## Публикация на Vercel

1. Загрузите содержимое проекта в репозиторий GitHub.
2. Импортируйте репозиторий на Vercel.
3. Добавьте переменную окружения:

```env
NEXT_PUBLIC_SITE_URL=https://ваш-домен.by
NEXT_PUBLIC_SUPABASE_URL=https://ваш-проект.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=публичный_anon_key
SUPABASE_SERVICE_ROLE_KEY=секретный_service_role_key
TELEGRAM_BOT_TOKEN=токен_бота
TELEGRAM_CHAT_ID=идентификатор_чата
TELEGRAM_WEBHOOK_SECRET=секрет_webhook
```

`TELEGRAM_BOT_TOKEN` выдаёт BotFather. В `TELEGRAM_CHAT_ID` указывается чат, группа или канал, куда должны приходить заявки. Бота необходимо заранее добавить в выбранный чат.

Календарь занятости использует текущие Supabase `bookings` и `booked_dates`. `SUPABASE_SERVICE_ROLE_KEY` используется только в серверных маршрутах Next.js и не должен попадать в клиентский код.

Telegram webhook после деплоя нужно зарегистрировать на адрес:

```text
https://ваш-домен.by/api/telegram-webhook
```

4. Выполните публикацию.

Все фотографии, логотипы, favicon и Open Graph изображения уже находятся в папке `public`.

## Обновление отзывов

Отзывы и сводный рейтинг хранятся отдельно от интерфейса в `data/reviews.json`. Для обновления достаточно изменить этот файл и дату `source.updatedAt`; клиентский компонент и SEO-разметка обновятся автоматически.
