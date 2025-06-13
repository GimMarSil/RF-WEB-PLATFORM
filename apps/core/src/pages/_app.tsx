import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from '../../../lib/auth/msal';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MsalProvider instance={msalInstance}>
      <Component {...pageProps} />
    </MsalProvider>
  );
}

export default MyApp;
