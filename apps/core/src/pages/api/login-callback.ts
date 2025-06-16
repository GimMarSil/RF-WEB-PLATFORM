import type { NextApiRequest, NextApiResponse } from 'next';
import { PublicClientApplication } from '@azure/msal-browser';
import { authConfig } from '../../authConfig';

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: authConfig.clientId,
    authority: `https://login.microsoftonline.com/${authConfig.tenantId}`,
    redirectUri: authConfig.redirectUri
  }
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const result = await msalInstance.handleRedirectPromise();
    if (result && result.accessToken) {
      res.setHeader(
        'Set-Cookie',
        `AuthSession=${result.accessToken}; HttpOnly; Secure; Path=/`
      );
      res.writeHead(302, { Location: '/landing' });
      res.end();
    } else {
      res.status(401).json({ error: 'Authentication failed' });
    }
  } catch (error) {
    console.error('Login callback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
