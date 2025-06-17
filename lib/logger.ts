import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'logs', 'analytics.log');

export function logAnalytics(service: string, payload: unknown): void {
  try {
    fs.mkdirSync(path.dirname(logFile), { recursive: true });
    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      service,
      payload
    });
    fs.appendFileSync(logFile, entry + '\n');
  } catch {
    // Ignore logging errors
  }
}
