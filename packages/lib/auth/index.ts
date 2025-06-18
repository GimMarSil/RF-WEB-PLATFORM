import { PublicClientApplication } from '@azure/msal-browser';
import { createAzureClient } from './providers/azure';
import { createAzureB2BClient } from './providers/azureB2B';
import React, { PropsWithChildren } from 'react';
import { MsalProvider } from '@azure/msal-react';

let client: PublicClientApplication | null = null;

function initClient() {
  if (client) return client;
  const provider = process.env.NEXT_PUBLIC_AUTH_PROVIDER;
  switch (provider) {
    case 'azure-b2b':
      client = createAzureB2BClient();
      break;
    case 'azure':
    default:
      client = createAzureClient();
  }
  return client;
}

export function getAuthClient(): PublicClientApplication {
  return initClient();
}

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const instance = getAuthClient();
  return <MsalProvider instance={instance}>{children}</MsalProvider>;
}
