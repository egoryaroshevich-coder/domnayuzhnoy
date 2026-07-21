# Supabase и Vercel

## 1. Переменные окружения Vercel

Откройте `Project Settings` → `Environment Variables` и добавьте:

```text
NEXT_PUBLIC_SUPABASE_URL=https://ваш-проект.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=публичный anon или publishable key
SUPABASE_SERVICE_ROLE_KEY=секретный service_role key
TELEGRAM_BOT_TOKEN=токен Telegram-бота
TELEGRAM_CHAT_ID=id получателя
TELEGRAM_WEBHOOK_SECRET=секрет Telegram webhook
```

После изменения переменных запустите новый deploy.

## 2. Доступ к Data API

Клиентский календарь читает занятость через серверный маршрут Next.js, а серверный маршрут бронирования добавляет заявки в `bookings`.

Публичный клиент не записывает данные напрямую в Supabase. `/api/booking`, `/api/availability` и `/api/telegram-webhook` используют `SUPABASE_SERVICE_ROLE_KEY` только на сервере.

Если текущая база уже работала в функциональном Supabase-проекте, новый SQL для бронирования не нужен. `ADMIN_SETUP.sql` нужен только для свежей базы или если в Supabase Auth ещё не настроен доступ админки к `bookings` и `booked_dates`.

## 3. Формат view booked_dates

Календарь понимает любой из вариантов:

```text
booked_date
date
day
stay_date
```

где каждая строка содержит одну занятую дату `YYYY-MM-DD`.

Также поддерживается диапазон:

```text
check_in
check_out
```

Дата выезда не блокируется, поскольку в этот день может заехать следующий гость.

## 4. Проверка после deploy

1. Откройте сайт и убедитесь, что календарь перестал показывать «Проверяем свободные даты...».
2. Проверьте, что даты из `booked_dates` затемнены и недоступны.
3. Отправьте тестовую заявку на свободные даты.
4. Убедитесь, что в `bookings` появилась строка со статусом `new`.
5. Проверьте получение Telegram-уведомления.
6. Подтвердите тестовую бронь по вашей текущей процедуре и проверьте, что даты появились в `booked_dates`.

Publishable/anon key разрешено использовать в браузере. `service_role` key используется только серверными маршрутами Next.js и никогда не должен попадать в файлы сайта или клиентский код.

Настройка Telegram-кнопок описана в `TELEGRAM_MANAGEMENT_SETUP.md`.
