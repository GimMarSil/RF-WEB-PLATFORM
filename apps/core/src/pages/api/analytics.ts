import type { NextApiRequest, NextApiResponse } from 'next';
import { logAnalytics } from '../../../../../lib/logger';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  logAnalytics('core', req.body);
  res.status(200).json({ ok: true });
}
