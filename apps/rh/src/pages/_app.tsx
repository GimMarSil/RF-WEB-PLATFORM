import React from 'react';
import type { AppProps } from 'next/app';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { authConfig } from '../config/authConfig';
import '../styles/globals.css';
import { ThemeProvider } from '@RFWebApp/ui';
import { useAnalytics } from '@rfwebapp/lib/useAnalytics';
import { FuncionarioProvider } from '../context/FuncionarioContext';
import { SelectedEmployeeProvider } from '@/contexts/SelectedEmployeeContext';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: authConfig.clientId,
    authority: authConfig.authority,
    redirectUri: authConfig.redirectUri
  }
});

function MyApp({ Component, pageProps }: AppProps) {
  useAnalytics('rh');
  return (
    <ThemeProvider>
      <MsalProvider instance={msalInstance}>
        <SelectedEmployeeProvider>
          <FuncionarioProvider>
            <Component {...pageProps} />
            <ToastContainer position="top-right" autoClose={5000} />
          </FuncionarioProvider>
        </SelectedEmployeeProvider>
      </MsalProvider>
    </ThemeProvider>
  );
}

export default MyApp;
