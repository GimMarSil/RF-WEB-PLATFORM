import { PublicClientApplication, Configuration } from '@azure/msal-browser';

export function createAzureB2BClient() {
  const config: Configuration = {
    auth: {
      clientId: process.env.NEXT_PUBLIC_AZURE_B2B_CLIENT_ID || '',
      authority: process.env.NEXT_PUBLIC_AZURE_B2B_AUTHORITY,
      redirectUri: process.env.NEXT_PUBLIC_AZURE_B2B_REDIRECT_URI,
    },
  };
  return new PublicClientApplication(config);
}
