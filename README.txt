Калькулятор мягких окон с отправкой PDF в Telegram через Vercel

Структура проекта:
index.html
api/send-telegram.js

Что изменено:
1. Токен Telegram удалён из открытого HTML.
2. Кнопка «Отправить PDF в Telegram» создаёт PDF и отправляет его на /api/send-telegram.
3. Serverless-функция api/send-telegram.js берёт токен и chat_id из переменных окружения Vercel.

Переменные в Vercel:
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID

Проверка после деплоя:
https://ваш-домен.vercel.app/api/send-telegram

Должно быть:
telegramBotTokenConfigured: true
telegramChatIdConfigured: true
