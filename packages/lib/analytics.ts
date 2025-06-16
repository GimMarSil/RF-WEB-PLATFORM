export type LogPayload = {
  service: string;
  event: string;
  data?: Record<string, unknown>;
  timestamp: number;
};

export async function logEvent(
  service: string,
  event: string,
  data: Record<string, unknown> = {}
) {
  const payload: LogPayload = { service, event, data, timestamp: Date.now() };
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Analytics error', err);
    }
  }
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', payload);
  }
}
