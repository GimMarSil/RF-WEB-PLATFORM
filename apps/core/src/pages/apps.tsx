import React from 'react';
import { AppCard } from '@RFWebApp/ui';
import { useRequireAuth } from '@rfwebapp/lib/useRequireAuth';

export default function AppsPage() {
  const employee = useRequireAuth();
  const apps = [
    {
      title: 'Autos',
      description: 'Autos de medição',
      href: '/autos',
      locked: false
    },
    {
      title: 'RH',
      description: 'Gestão de recursos humanos',
      href: '/rh',
      locked: !employee
    }
  ];

  return (
    <main className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4" role="main">
      {apps.map((app) => (
        <AppCard key={app.href} {...app} />
      ))}
    </main>
  );
}
