import { getSupabaseAdmin } from "./supabaseServer";

export interface SendBroadcastParams {
  messageText: string;
  photoUrl?: string;
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  targetTimezone?: string;
}

export interface BroadcastResult {
  total: number;
  sent: number;
  failed: number;
  errors: Array<{ telegramId: number; error: string }>;
}

export async function broadcastToUsers(params: SendBroadcastParams): Promise<BroadcastResult> {
  const token = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("Telegram BOT_TOKEN is missing in environment variables");
  }

  const supabase = getSupabaseAdmin();

  let query = supabase.from("users").select("telegram_id, timezone");
  if (params.targetTimezone && params.targetTimezone !== "all") {
    query = query.eq("timezone", params.targetTimezone);
  }

  let { data: users, error } = await query;

  if (error && /timezone/i.test(error.message)) {
    console.warn("[broadcastToUsers] 'timezone' column missing in users table, falling back to all users.");
    const fallback = await supabase.from("users").select("telegram_id");
    users = fallback.data as any;
    error = fallback.error;
  }

  if (error || !users) {
    throw new Error(`Failed to fetch recipients: ${error?.message || "Unknown error"}`);
  }

  let sent = 0;
  let failed = 0;
  const errors: Array<{ telegramId: number; error: string }> = [];

  for (const user of users) {
    try {
      const isPhoto = Boolean(params.photoUrl && params.photoUrl.trim());
      const endpoint = isPhoto
        ? `https://api.telegram.org/bot${token}/sendPhoto`
        : `https://api.telegram.org/bot${token}/sendMessage`;

      const payload = isPhoto
        ? {
            chat_id: user.telegram_id,
            photo: params.photoUrl,
            caption: params.messageText,
            parse_mode: params.parseMode || "HTML",
          }
        : {
            chat_id: user.telegram_id,
            text: params.messageText,
            parse_mode: params.parseMode || "HTML",
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.ok) {
        sent++;
      } else {
        failed++;
        errors.push({
          telegramId: user.telegram_id,
          error: json.description || "Send failed",
        });
      }
    } catch (err: unknown) {
      failed++;
      errors.push({
        telegramId: user.telegram_id,
        error: err instanceof Error ? err.message : "Network error",
      });
    }

    // Rate-limit safety: 35ms delay (~28 requests per second)
    await new Promise((resolve) => setTimeout(resolve, 35));
  }

  return { total: users.length, sent, failed, errors };
}

export async function sendDirectTelegramMessage(
  telegramId: number,
  text: string,
  mediaUrl?: string | null,
  mediaType?: string
) {
  const token = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Missing BOT_TOKEN");

  let endpoint = `https://api.telegram.org/bot${token}/sendMessage`;
  let body: Record<string, unknown> = {
    chat_id: telegramId,
    text,
    parse_mode: "HTML",
  };

  if (mediaUrl) {
    if (mediaType === "image") {
      endpoint = `https://api.telegram.org/bot${token}/sendPhoto`;
      body = { chat_id: telegramId, photo: mediaUrl, caption: text, parse_mode: "HTML" };
    } else if (mediaType === "video") {
      endpoint = `https://api.telegram.org/bot${token}/sendVideo`;
      body = { chat_id: telegramId, video: mediaUrl, caption: text, parse_mode: "HTML" };
    } else if (mediaType === "voice") {
      endpoint = `https://api.telegram.org/bot${token}/sendVoice`;
      body = { chat_id: telegramId, voice: mediaUrl, caption: text, parse_mode: "HTML" };
    }
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok || !json.ok) {
    throw new Error(json.description || "Telegram direct send failed");
  }

  return json;
}
