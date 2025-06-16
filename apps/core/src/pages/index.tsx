import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../utils/authRequest';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const { instance } = useMsal();
  const router = useRouter();

  useEffect(() => {
    if (!instance.getActiveAccount()) {
      instance.loginRedirect({ ...loginRequest, redirectUri: '/api/login-callback' });
    } else {
      router.replace('/apps');
    }
  }, [instance, router]);

  return <div className="p-4">Bem-vindo ao Core</div>;
}
