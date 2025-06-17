import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { Button } from '@RFWebApp/ui';
import { loginRequest } from '../utils/authRequest';
import { useAuthStore } from '@lib/store';

export default function LoginPage() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const { employeeNumber } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    instance
      .handleRedirectPromise()
      .finally(() => setLoading(false));
  }, [instance]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace(employeeNumber ? '/apps' : '/landing');
    }
  }, [loading, isAuthenticated, employeeNumber, router]);

  const handleLogin = () => {
    setLoading(true);
    instance.loginRedirect(loginRequest);
  };

  if (loading) {
    return <div className="p-4">Carregando...</div>;
  }

  return (
    <div className="p-4">
      <Button onClick={handleLogin}>Entrar</Button>
    </div>
  );
}
