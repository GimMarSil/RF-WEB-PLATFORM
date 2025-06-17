import React from 'react';
import type { AppProps } from 'next/app';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { authConfig } from '../authConfig';
import '../styles/globals.css';
import { ThemeProvider, Layout } from '@RFWebApp/ui';
import { useAnalytics } from '../../../lib/useAnalytics';

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: authConfig.clientId,
    authority: `https://login.microsoftonline.com/${authConfig.tenantId}`,
    redirectUri: authConfig.redirectUri
  }
});

function MyApp({ Component, pageProps }: AppProps) {
  useAnalytics('vendors');
  return (
    <ThemeProvider>
      <MsalProvider instance={msalInstance}>
        <Layout navItems={[{ href: '/vendors', label: 'Home' }]}>
          <Component {...pageProps} />
        </Layout>
      </MsalProvider>
    </ThemeProvider>
  );
}

export default MyApp;
