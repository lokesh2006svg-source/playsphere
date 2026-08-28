import axios from "axios";

/**
 * Fires an asynchronous webhook event to n8n or configured automation webhook.
 * Non-blocking / fire-and-forget so it never breaks the main HTTP request flow.
 *
 * @param {string} event - Event name (e.g. 'booking_confirmed', 'team_invite', 'match_live', 'chatbot_escalation')
 * @param {object} data - Payload data associated with the event
 */
export const triggerWebhook = (event, data = {}) => {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    // Webhook not configured; log quietly in debug
    // console.log(`[Webhook] (Skipped - No N8N_WEBHOOK_URL) Event: ${event}`);
    return;
  }

  const payload = {
    event,
    timestamp: new Date().toISOString(),
    platform: "PlaySphere",
    environment: process.env.NODE_ENV || "development",
    data,
  };

  // Fire and forget with timeout
  axios
    .post(webhookUrl, payload, {
      timeout: 4000,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "PlaySphere-Webhook-Notifier/1.0",
      },
    })
    .then((response) => {
      console.log(`[Webhook] Dispatched '${event}' successfully (Status: ${response.status})`);
    })
    .catch((err) => {
      console.warn(`[Webhook] Notification failed for '${event}':`, err.message);
    });
};

export default triggerWebhook;
