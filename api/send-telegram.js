export const config = {
  runtime: "edge"
};

export default async function handler(request) {
  if (request.method === "GET") {
    return Response.json({
      ok: true,
      api: "send-telegram",
      mode: "sendDocument",
      telegramBotTokenConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
      telegramChatIdConfigured: Boolean(process.env.TELEGRAM_CHAT_ID)
    });
  }

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return Response.json({
      ok: false,
      error: "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured"
    }, { status: 500 });
  }

  try {
    const incoming = await request.formData();
    const documentFile = incoming.get("document");
    const caption = incoming.get("caption") || "Расчёт мягких окон";

    if (!documentFile) {
      return Response.json({
        ok: false,
        error: "No document file received"
      }, { status: 400 });
    }

    const telegramForm = new FormData();
    telegramForm.append("chat_id", chatId);
    telegramForm.append("caption", caption);
    telegramForm.append("document", documentFile);

    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
      method: "POST",
      body: telegramForm
    });

    const text = await telegramResponse.text();

    if (!telegramResponse.ok) {
      return new Response(text, {
        status: telegramResponse.status,
        headers: { "content-type": "application/json; charset=utf-8" }
      });
    }

    return new Response(text, {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  } catch (error) {
    return Response.json({
      ok: false,
      error: error.message || "Unknown server error"
    }, { status: 500 });
  }
}
