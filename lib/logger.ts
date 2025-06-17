import fs from 'fs';
import path from 'path';

const analyticsLogFile = path.join(process.cwd(), 'logs', 'analytics.log');
const appLogFile = path.join(process.cwd(), 'logs', 'app.log');

function maskSensitive(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(maskSensitive);
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (/password|secret|token|url/i.test(k)) {
        result[k] = '***';
      } else {
        result[k] = maskSensitive(v);
      }
    }
    return result;
  }
  return value;
}

function writeLog(level: string, message: string, meta?: unknown): void {
  try {
    fs.mkdirSync(path.dirname(appLogFile), { recursive: true });
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta: maskSensitive(meta)
    };
    fs.appendFileSync(appLogFile, JSON.stringify(entry) + '\n');
  } catch {
    // Ignore logging errors
  }
}

export function logAnalytics(service: string, payload: unknown): void {
  try {
    fs.mkdirSync(path.dirname(analyticsLogFile), { recursive: true });
    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      service,
      payload: maskSensitive(payload)
    });
    fs.appendFileSync(analyticsLogFile, entry + '\n');
  } catch {
    // Ignore logging errors
  }
}

export function info(message: string, meta?: unknown): void {
  writeLog('info', message, meta);
}

export function error(message: string, meta?: unknown): void {
  writeLog('error', message, meta);
}
