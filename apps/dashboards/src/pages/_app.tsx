import React from 'react';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@rfwebapp/lib/auth';
import '../styles/globals.css';
import { ThemeProvider } from '@RFWebApp/ui';
import { useAnalytics } from '@rfwebapp/lib/useAnalytics';



function MyApp({ Component, pageProps }: AppProps) {
  useAnalytics('dashboards');
  return (
    <ThemeProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default MyApp;
