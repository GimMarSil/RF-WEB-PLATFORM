import { PublicClientApplication, Configuration } from '@azure/msal-browser';

const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '',
    authority: process.env.NEXT_PUBLIC_AZURE_AUTHORITY,
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
