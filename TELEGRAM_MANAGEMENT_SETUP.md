# Управление бронированиями через Telegram

## 1. Supabase

Дополнительные таблицы не нужны. Используются существующие:

- `bookings`;
- `booked_dates`.

У таблицы `bookings` должна быть уникальная колонка `id`. Она уже используется админ-панелью. View `booked_dates` должен, как и сейчас, возвращать даты только для подтверждённых броней.

Статусы:

```text
new
confirmed
cancelled
completed
```

Webhook использует `SUPABASE_SERVICE_ROLE_KEY` только внутри серверного маршрута Next.js. Этот ключ нельзя добавлять в HTML, клиентские JS-файлы или Supabase client.

## 2. Переменные Vercel

Добавьте или проверьте в `Project Settings` → `Environment Variables`:

```text
NEXT_PUBLIC_SUPABASE_URL=https://ваш-проект.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=публичный publishable key
SUPABASE_SERVICE_ROLE_KEY=секретный service_role key из Supabase
TELEGRAM_BOT_TOKEN=токен Telegram-бота
TELEGRAM_CHAT_ID=id чата владельца
TELEGRAM_WEBHOOK_SECRET=случайная секретная строка
```

`SUPABASE_SERVICE_ROLE_KEY` находится в Supabase → `Project Settings` → `API Keys`.

Для `TELEGRAM_WEBHOOK_SECRET` используйте случайную строку длиной не менее 32 символов, содержащую только латинские буквы, цифры, `_` и `-`.

После добавления переменных выполните новый deploy.

## 3. Зарегистрировать webhook Telegram

После deploy на Vercel адрес webhook будет:

```text
https://ВАШ-ДОМЕН/api/telegram-webhook
```

Выполните запрос, подставив токен, домен и тот же `TELEGRAM_WEBHOOK_SECRET`:

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://ВАШ-ДОМЕН/api/telegram-webhook",
    "secret_token": "<TELEGRAM_WEBHOOK_SECRET>",
    "allowed_updates": ["callback_query"],
    "drop_pending_updates": true
  }'
```

Проверить регистрацию:

```text
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo
```

## 4. Проверка

1. Отправьте новую заявку с сайта.
2. Убедитесь, что в Telegram появились кнопки `Подтвердить` и `Отклонить`.
3. Нажмите `Подтвердить`.
4. Проверьте статус `confirmed` в Supabase и блокировку дат на сайте.
5. Нажмите `Отменить бронь`.
6. Проверьте статус `cancelled` и освобождение дат.
7. Повторно нажмите старую кнопку. Бот должен показать `Статус уже изменён ранее`.

## Безопасность

- Webhook принимает запросы только с правильным заголовком Telegram secret token.
- Действия разрешены только для `TELEGRAM_CHAT_ID`.
- Статус обновляется условно, поэтому повторный callback не меняет данные.
- Перед подтверждением даты повторно проверяются через `booked_dates`.
- `service_role` key никогда не отправляется в браузер.
