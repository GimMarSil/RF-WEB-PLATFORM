import { AppCard } from '@RFWebApp/ui';
import { useFuncionarioAtivo } from '../../../lib/useFuncionarioAtivo';

export default function AppsPage() {
  const employee = useFuncionarioAtivo();
  const apps = [
    { title: 'Autos', description: 'Autos de medição', href: '/autos', locked: false },
    { title: 'RH', description: 'Gestão de recursos humanos', href: '/rh', locked: !employee },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
      {apps.map((app) => (
        <AppCard key={app.href} {...app} />
      ))}
    </div>
  );
}
