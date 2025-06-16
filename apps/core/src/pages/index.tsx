import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../utils/authRequest';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const { instance } = useMsal();
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      window.location.href = `/api/login-callback?hash=${encodeURIComponent(hash)}`;
      return;
    }

    if (!instance.getActiveAccount()) {
      instance.loginRedirect(loginRequest);
    } else {
      fetch('/api/login-callback').then(() => {
        router.replace('/landing');
      });
    }
  }, [instance, router]);

  return <div className="p-4">Bem-vindo ao Core</div>;
}
