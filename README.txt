Калькулятор мягких окон с отправкой PDF в Telegram через Vercel — версия v3

Структура проекта:
index.html
api/send-telegram.js

Что исправлено в v3:
1. PDF отправляется как FormData-файл, без base64 JSON.
2. API-функция работает в Edge runtime и принимает request.formData().
3. Убрана причина частой ошибки "Сервер вернул не JSON-ответ".
4. PDF для Telegram генерируется легче: JPEG, scale=1.
5. Токен Telegram не хранится в HTML.

Переменные в Vercel:
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID

Проверка после деплоя:
https://ваш-домен.vercel.app/api/send-telegram

Должно быть:
telegramBotTokenConfigured: true
telegramChatIdConfigured: true
version: soft-windows-v3-formdata-edge
