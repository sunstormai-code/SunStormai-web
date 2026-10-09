export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  let webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return res.status(500).json({ error: 'env-missing' });
  webhookUrl = webhookUrl.trim();
  if (typeof fetch !== 'function') return res.status(500).json({ error: 'no-fetch-node-version' });
  try {
    const d = req.body || {};
    const text = [
      ':red_circle: *New lead — SunstormAI*', '',
      `*Name:* ${((d.firstName||'')+' '+(d.lastName||'')).trim()}`,
      `*Email:* ${d.email || '—'}`,
      `*Company:* ${d.companyName || '—'}`,
      `*Team size:* ${d.teamSize || '—'}`,
      `*Preferred time:* ${d.preferredCallTime || '—'}`,
      `*What to automate:* ${d.whatToAutomate || '—'}`,
      `*Notes:* ${d.anythingElse || '—'}`,
      `*Source:* ${d.howDidYouHear || '—'}`,
    ].join('\n');
    const r = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const bodyText = await r.text();
    if (!r.ok) return res.status(502).json({ error: 'slack-rejected', slackStatus: r.status, slackResponse: bodyText });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'crashed', detail: String((e && e.message) || e) });
  }
}
