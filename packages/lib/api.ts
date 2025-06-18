import { getAuthClient } from './auth';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

export async function fetchApi<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const msalInstance = getAuthClient();
  const account = msalInstance.getActiveAccount();
  const scopes = [process.env.NEXT_PUBLIC_API_SCOPES || ''];
  const request = { account, scopes };

  try {
    const result = await msalInstance.acquireTokenSilent(request);
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${result.accessToken}`);
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) throw new Error(`API Error ${res.status}`);
    return res.json() as Promise<T>;
  } catch (err: unknown) {
    if (err instanceof InteractionRequiredAuthError) {
      await msalInstance.acquireTokenRedirect(request);
    }
    throw err;
  }
}
