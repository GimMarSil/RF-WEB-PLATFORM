import type { NextApiRequest, NextApiResponse } from 'next';
import { msalInstance } from '../../../../lib/auth/msal';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await msalInstance.handleRedirectPromise();
    const token = response?.accessToken;
    if (token) {
      res.setHeader(
        'Set-Cookie',
        `AuthSession=${token}; HttpOnly; Path=/; Secure`
      );
      res.writeHead(302, { Location: '/landing' });
      res.end();
    } else {
      res.status(400).json({ message: 'No token found' });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}
