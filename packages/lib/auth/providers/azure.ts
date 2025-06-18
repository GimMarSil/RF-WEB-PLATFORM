import { PublicClientApplication, Configuration } from '@azure/msal-browser';

export function createAzureClient() {
  const config: Configuration = {
    auth: {
      clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '',
      authority: process.env.NEXT_PUBLIC_AZURE_AUTHORITY,
      redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI,
    },
  };
  return new PublicClientApplication(config);
}
