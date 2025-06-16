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
=======
import { PublicClientApplication } from '@azure/msal-browser';
import { authConfig } from '../../authConfig';

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: authConfig.clientId,
    authority: `https://login.microsoftonline.com/${authConfig.tenantId}`,
    redirectUri: authConfig.redirectUri
  }
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const hash = (req.method === 'POST' ? req.body?.hash : req.query.hash) as string | undefined;
  if (!hash) {
    return res.status(400).json({ message: 'Missing hash' });
  }

  try {
    const response = await msalInstance.handleRedirectPromise(hash);
    const token = response?.accessToken;

    if (!token) {
      return res.status(400).json({ message: 'Token not found' });
    }

    res.setHeader('Set-Cookie', `AuthSession=${token}; HttpOnly; Path=/; Secure; SameSite=Lax`);
    res.writeHead(302, { Location: '/landing' });
    res.end();
