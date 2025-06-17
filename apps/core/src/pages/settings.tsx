import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  usePrefs
} from '@RFWebApp/ui';
import { useAuthStore } from '@lib/store';

interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
}

export default function SettingsPage() {
  const isAuthenticated = useIsAuthenticated();
  const { accounts } = useMsal();
  const router = useRouter();
  const { employeeNumber, setEmployeeNumber } = useAuthStore();
  const { theme, setTheme } = usePrefs();
  const [employees, setEmployees] = useState<Funcionario[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(employeeNumber || '');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  const loadEmployees = async () => {
    if (!accounts[0]) return;
    try {
      const res = await fetch(
        `/api/funcionarios?email=${encodeURIComponent(accounts[0].username)}`
      );
      const data: Funcionario[] = await res.json();
      setEmployees(data);
      setOpen(true);
    } catch {
      // ignore
    }
  };

  const handleSelect = () => {
    if (selected) {
      setEmployeeNumber(selected);
      setOpen(false);
    }
  };

  return (
    <main className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Utilizador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div>{accounts[0]?.name}</div>
          <div className="text-sm text-muted-foreground">{accounts[0]?.username}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tema</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={theme} onValueChange={(v) => setTheme(v as any)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Escolha o tema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Claro</SelectItem>
              <SelectItem value="dark">Escuro</SelectItem>
              <SelectItem value="high-contrast">Daltônico</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funcionário Ativo</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <span>{employeeNumber || 'Nenhum selecionado'}</span>
          <Button onClick={loadEmployees}>Trocar</Button>
        </CardContent>
      </Card>

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
    </main>
  );
}
