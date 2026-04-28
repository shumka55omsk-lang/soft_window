function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return {};
    }
  }

  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
  }

  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  const token = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
  const chatId = (process.env.TELEGRAM_CHAT_ID || "").trim();

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      api: "send-telegram",
      telegramBotTokenConfigured: Boolean(token),
      telegramChatIdConfigured: Boolean(chatId)
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!token || !chatId) {
    return res.status(500).json({
      ok: false,
      error: "Telegram variables are not configured"
    });
  }

  try {
    const {
      brand,
      model,
      year,
      generation,
      body,
      matsType,
      trunk,
      heelPad,
      name,
      phone,
      messenger,
      comment
    } = await parseBody(req);

    const text = `
<b>Новая заявка на EVA коврики</b>

<b>Авто:</b> ${escapeHtml(brand)} ${escapeHtml(model)}
<b>Год:</b> ${escapeHtml(year)}
<b>Поколение:</b> ${escapeHtml(generation)}
<b>Кузов:</b> ${escapeHtml(body || "Не указан")}

<b>Коврики:</b> ${escapeHtml(matsType)}
<b>Багажник:</b> ${escapeHtml(trunk)}
<b>Подпятник:</b> ${escapeHtml(heelPad)}

<b>Имя:</b> ${escapeHtml(name || "Не указано")}
<b>Телефон:</b> ${escapeHtml(phone || "Не указан")}
<b>Куда ответить:</b> ${escapeHtml(messenger || "Не указано")}

<b>Комментарий:</b>
${escapeHtml(comment || "Без комментария")}
`.trim();

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text.slice(0, 4000),
          parse_mode: "HTML"
        })
      }
    );

    const telegramData = await telegramResponse.json();

    if (!telegramResponse.ok) {
      return res.status(502).json({
        ok: false,
        error: telegramData.description || "Telegram error"
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error && error.message ? error.message : "Server error"
    });
  }
};
