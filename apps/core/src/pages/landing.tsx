import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import {
  Card,
  Button,
  Layout,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter
} from '@RFWebApp/ui';
import { useAuthStore } from '../../../../src/store/auth';

interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
}

const apps = [
  { href: '/rh', title: 'RH', icon: '👥' },
  { href: '/autos', title: 'Autos', icon: '📄' },
  { href: '/core', title: 'Core', icon: '🏠' }
];

export default function LandingPage() {
  const isAuthenticated = useIsAuthenticated();
  const { accounts } = useMsal();
  const router = useRouter();
  const { employeeNumber, setEmployeeNumber } = useAuthStore();
  const [employees, setEmployees] = useState<Funcionario[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    async function load() {
      if (!isAuthenticated || !accounts[0]) return;
      try {
        const res = await fetch(
          `/api/funcionarios?email=${encodeURIComponent(accounts[0].username)}`
        );
        const data: Funcionario[] = await res.json();
        setEmployees(data);
        if (data.length === 1) {
          setEmployeeNumber(String(data[0].id));
        } else if (!employeeNumber) {
          setOpen(true);
        }
      } catch {
        // ignore
      }
    }
    load();
  }, [isAuthenticated, accounts, employeeNumber, setEmployeeNumber]);

  const handleSelect = () => {
    if (selected) {
      setEmployeeNumber(selected);
      setOpen(false);
    }
  };

  return (
    <Layout navItems={[{ href: '/core', label: 'Home' }]}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {apps.map((app) => (
            <a key={app.href} href={app.href} className="block">
              <Card className="p-6 flex flex-col items-center text-center space-y-2">
                <span className="text-4xl">{app.icon}</span>
                <span className="text-lg font-semibold">{app.title}</span>
              </Card>
            </a>
          ))}
        </div>
        <Modal open={open} onOpenChange={setOpen}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Selecionar Funcionário</ModalTitle>
            </ModalHeader>
            <select
              className="w-full border p-2 rounded"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Escolha...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nome}
                </option>
              ))}
            </select>
            <ModalFooter>
              <Button onClick={handleSelect}>Confirmar</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </Layout>
  );
}
