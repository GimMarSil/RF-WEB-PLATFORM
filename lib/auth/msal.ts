import {
  PublicClientApplication,
  Configuration,
  RedirectRequest
} from '@azure/msal-browser';

const authorities = [
  process.env.NEXT_PUBLIC_AZURE_AUTHORITY,
  process.env.NEXT_PUBLIC_AZURE_B2B_AUTHORITY
].filter(Boolean) as string[];

const clientIds = [
  process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '',
  process.env.NEXT_PUBLIC_AZURE_B2B_CLIENT_ID
].filter(Boolean) as string[];

const redirectUris = [
  process.env.NEXT_PUBLIC_REDIRECT_URI,
  process.env.NEXT_PUBLIC_AZURE_B2B_REDIRECT_URI || process.env.NEXT_PUBLIC_REDIRECT_URI
].filter(Boolean) as string[];

let providerIndex = 0;

function createInstance(index: number) {
  const config: Configuration = {
    auth: {
      clientId: clientIds[index] || clientIds[0],
      authority: authorities[index],
      redirectUri: redirectUris[index] || redirectUris[0]
    }
  };
  return new PublicClientApplication(config);
}

export let msalInstance = createInstance(providerIndex);

export async function loginWithFallback(request: RedirectRequest) {
  try {
    await msalInstance.loginRedirect(request);
  } catch (err) {
    if (authorities.length > providerIndex + 1) {
      providerIndex += 1;
      msalInstance = createInstance(providerIndex);
      await msalInstance.loginRedirect(request);
    } else {
      throw err;
    }
  }
}
