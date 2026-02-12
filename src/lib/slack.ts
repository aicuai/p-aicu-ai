const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL
const SLACK_WEBHOOK_DEV = process.env.SLACK_WEBHOOK_DEV

export async function notifySlack(text: string) {
  if (!SLACK_WEBHOOK_URL) return
  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
  } catch (err) {
    console.error("[slack] notification failed:", err)
  }
}

export async function notifySlackDev(text: string) {
  if (!SLACK_WEBHOOK_DEV) return
  try {
    await fetch(SLACK_WEBHOOK_DEV, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
  } catch (err) {
    console.error("[slack-dev] notification failed:", err)
  }
}
