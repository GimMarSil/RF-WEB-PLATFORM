import type { NextApiRequest, NextApiResponse } from 'next';
import { logAnalytics } from '../../../../../lib/logger';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  logAnalytics('vendors', req.body);
  res.status(200).json({ ok: true });
}
