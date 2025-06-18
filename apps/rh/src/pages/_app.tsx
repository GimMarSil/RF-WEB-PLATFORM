import React from 'react';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@rfwebapp/lib/auth';
import '../styles/globals.css';
import { ThemeProvider } from '@RFWebApp/ui';
import { useAnalytics } from '@rfwebapp/lib/useAnalytics';
import { FuncionarioProvider } from '../context/FuncionarioContext';
import { SelectedEmployeeProvider } from '@/contexts/SelectedEmployeeContext';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';



function MyApp({ Component, pageProps }: AppProps) {
  useAnalytics('rh');
  return (
    <ThemeProvider>
      <AuthProvider>
        <SelectedEmployeeProvider>
          <FuncionarioProvider>
            <Component {...pageProps} />
            <ToastContainer position="top-right" autoClose={5000} />
          </FuncionarioProvider>
        </SelectedEmployeeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default MyApp;
