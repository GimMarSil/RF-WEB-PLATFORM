import type { NextApiRequest, NextApiResponse } from 'next';
import { msalInstance } from '../../../../../lib/auth/msal';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await msalInstance.handleRedirectPromise();
    if (!result || !result.account) {
      return res.status(400).json({ message: 'Authentication failed' });
    }

    msalInstance.setActiveAccount(result.account);

    res.setHeader(
      'Set-Cookie',
      `AuthSession=${result.accessToken}; HttpOnly; Secure; Path=/; SameSite=Lax`
    );
    res.writeHead(302, { Location: '/landing' });
    res.end();
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}
