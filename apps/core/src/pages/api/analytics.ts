import type { NextApiRequest, NextApiResponse } from 'next';
import { logAnalytics } from '../../../../../lib/logger';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.ANALYTICS_DISABLED === "true") {
    return res.status(200).json({ ok: true });
  }
  logAnalytics('core', req.body);
  res.status(200).json({ ok: true });
}
