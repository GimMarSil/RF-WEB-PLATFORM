import React from 'react';
import { AppCard } from '@RFWebApp/ui';
import {
  Car,
  Boxes,
  Clock,
  Wallet,
  Store,
  LayoutDashboard,
  Users
} from 'lucide-react';
import { useRequireAuth } from '@rfwebapp/lib/useRequireAuth';

export default function AppsPage() {
  const employee = useRequireAuth();
  const apps = [
    {
      title: 'Autos',
      description: 'Autos de medição',
      href: '/autos',
      icon: Car,
      locked: false
    },
    {
      title: 'Inventory',
      description: 'Gestão de inventário',
      href: '/inventory',
      icon: Boxes,
      locked: !employee
    },
    {
      title: 'Timesheet',
      description: 'Registo de horas',
      href: '/timesheet',
      icon: Clock,
      locked: !employee
    },
    {
      title: 'Expenses',
      description: 'Gestão de despesas',
      href: '/expenses',
      icon: Wallet,
      locked: !employee
    },
    {
      title: 'Vendors',
      description: 'Comunicação com fornecedores',
      href: '/vendors',
      icon: Store,
      locked: !employee
    },
    {
      title: 'Dashboards',
      description: 'Relatórios e métricas',
      href: '/dashboards',
      icon: LayoutDashboard,
      locked: !employee
    },
    {
      title: 'RH',
      description: 'Gestão de recursos humanos',
      href: '/rh',
      icon: Users,
      locked: !employee
    }
  ];

  return (
    <main className="p-4 space-y-4" role="main">
      <h2 className="text-xl font-semibold">Escolha uma aplicação</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {apps.map((app) => (
          <AppCard key={app.href} {...app} />
        ))}
      </div>
    </main>
  );
}
