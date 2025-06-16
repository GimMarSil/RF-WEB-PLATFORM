import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('timesheet analytics:', req.body);
  res.status(200).json({ ok: true });
}
