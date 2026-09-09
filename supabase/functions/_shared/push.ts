/**
 * Sends push notifications via Expo Push API.
 * Automatically batches into chunks of 100.
 */
interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string;
  badge?: number;
}

export async function sendExpoPush(messages: PushMessage[]): Promise<void> {
  if (messages.length === 0) return;

  // Expo Push API accepts max 100 per request
  const chunks: PushMessage[][] = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }

  for (const chunk of chunks) {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(chunk),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Expo push error:', text);
    }
  }
}
