// Runs once when the Next.js server starts (Node.js runtime only).
// 1. Re-registers the Telegram webhook on every restart so the bot stays live.
// 2. Starts a keep-alive loop that pings the app every 4 minutes to prevent
//    the sandbox from going idle and dropping the webhook.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!token || !appUrl) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN or NEXT_PUBLIC_APP_URL not set — skipping webhook registration');
    return;
  }

  const webhookUrl = `${appUrl}/api/telegram/webhook`;

  // ── Register webhook ───────────────────────────────────────────────────────
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message'],
        drop_pending_updates: false,
      }),
    });
    const data = await res.json() as { ok: boolean; description?: string };
    if (data.ok) {
      console.log(`[Telegram] Webhook registered: ${webhookUrl}`);
    } else {
      console.error('[Telegram] Failed to set webhook:', data.description);
    }
  } catch (err) {
    console.error('[Telegram] Webhook registration error:', err);
  }

  // ── Keep-alive ping every 4 minutes ───────────────────────────────────────
  // Prevents the sandbox/hosting from going idle and silently dropping requests.
  const PING_INTERVAL_MS = 4 * 60 * 1000;
  const pingUrl = `${appUrl}/api/telegram/ping`;

  setInterval(async () => {
    try {
      await fetch(pingUrl, { method: 'GET' });
    } catch {
      // Silent — keep-alive failures should not crash the server
    }
  }, PING_INTERVAL_MS);
}
