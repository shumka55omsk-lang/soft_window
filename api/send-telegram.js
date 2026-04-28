function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export const config = {
  runtime: "edge"
};

export default async function handler(request) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (request.method === "GET") {
      return Response.json({
        ok: true,
        api: "send-telegram",
        telegramBotTokenConfigured: Boolean(token),
        telegramChatIdConfigured: Boolean(chatId),
        mode: "sendDocument",
        version: "soft-windows-v3-formdata-edge"
      });
    }

    if (request.method !== "POST") {
      return Response.json(
        { ok: false, error: "Method not allowed" },
        { status: 405 }
      );
    }

    if (!token || !chatId) {
      return Response.json(
        {
          ok: false,
          error: "Не настроены TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID в Vercel"
        },
        { status: 500 }
      );
    }

    const incomingForm = await request.formData();
    const documentFile = incomingForm.get("document");
    const filenameRaw = incomingForm.get("filename") || "soft_windows_order.pdf";
    const captionRaw = incomingForm.get("caption") || "Расчёт мягких окон";

    if (!documentFile) {
      return Response.json(
        { ok: false, error: "PDF-файл не передан в поле document" },
        { status: 400 }
      );
    }

    const size = documentFile.size || 0;

    if (!size) {
      return Response.json(
        { ok: false, error: "PDF пустой или повреждён" },
        { status: 400 }
      );
    }

    if (size > 5 * 1024 * 1024) {
      return Response.json(
        {
          ok: false,
          error: "PDF слишком большой для отправки: " + Math.round(size / 1024 / 1024 * 100) / 100 + " МБ"
        },
        { status: 413 }
      );
    }

    const filename = String(filenameRaw).replace(/[^\wа-яА-ЯёЁ.-]+/g, "_");
    const caption = escapeHtml(String(captionRaw).slice(0, 1000));

    const telegramForm = new FormData();
    telegramForm.append("chat_id", chatId);
    telegramForm.append("caption", caption);
    telegramForm.append("parse_mode", "HTML");
    telegramForm.append("document", documentFile, filename);

    const telegramResponse = await fetch(
      "https://api.telegram.org/bot" + token + "/sendDocument",
      {
        method: "POST",
        body: telegramForm
      }
    );

    const telegramText = await telegramResponse.text();
    let telegramData = {};
    try {
      telegramData = JSON.parse(telegramText);
    } catch (error) {
      telegramData = { description: telegramText.slice(0, 300) };
    }

    if (!telegramResponse.ok) {
      return Response.json(
        {
          ok: false,
          error: telegramData.description || "Telegram error",
          telegramStatus: telegramResponse.status
        },
        { status: 502 }
      );
    }

    return Response.json({
      ok: true,
      message: "PDF отправлен в Telegram",
      sizeBytes: size
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error.message || "Server error"
      },
      { status: 500 }
    );
  }
}
