🏗️ RF-Web-Platform
Monorepo da plataforma Ramos Ferreira, com micro-serviços React/Next.js e uma UI partilhada centralizada.

📦 Estrutura
rf-web-platform/
├── apps/
│ ├── autos/ # Microserviço de autos de medição
│ ├── rh/ # App de RH (protegida por funcionário)
│ ├── core/ # App base com login, seleção e dashboard
│ ├── inventory/ # Microserviço de gestão de inventário (exemplo)
│ ├── timesheet/ # Registo de horas
│ ├── expenses/ # Gestão de despesas
│ ├── vendors/ # Comunicação com fornecedores
│ ├── dashboards/ # Relatórios e métricas
├── packages/
│ └── ui/ # Biblioteca @RFWebApp/ui com Tailwind + GSAP
├── lib/ # Hooks, autenticação, store, API
├── middleware.ts # Bloqueia apps sensíveis se não houver funcionário
├── pnpm-workspace.yaml # Declaração dos workspaces
├── tsconfig.base.json # Configuração TypeScript comum
├── package.json # Raiz do monorepo (metainformação)

🚀 Instalação
Clonar o projeto:

```bash
git clone <repo-url> rf-web-platform
cd rf-web-platform
```

Instalar todas as dependências (root + workspaces):

```bash
pnpm install
```


Copie `.env.example` para `.env.local` e preencha com as suas credenciais:

```bash
cp .env.example .env.local
```

Cada micro-serviço possui o seu próprio script `dev`. Não existe `pnpm run dev` na raiz.
Para iniciar uma aplicação específica use `--filter`:

```bash
pnpm dev -F core
```

🔁 Scripts úteis
| Comando | Descrição |
|----------------------------------|-------------------------------------------|
| pnpm dev -F autos | Inicia o microserviço autos |
| pnpm dev -F core | Inicia o frontend de login/seleção |
| pnpm build -F @RFWebApp/ui | Build do pacote de UI |
| pnpm run dev -F @RFWebApp/ui | Dev mode do pacote UI |
| pnpm add -F autos @RFWebApp/ui | Adiciona o pacote UI ao microserviço |

🎨 UI Partilhada: @RFWebApp/ui
Biblioteca central de componentes estilizados com Tailwind CSS, GSAP e design Ramos Ferreira.

Como usar na tua app:

```tsx
import { Button } from '@RFWebApp/ui';
<Button variant="primary">Salvar</Button>;
```
Outro exemplo com `AppShortcutCard`:
```tsx
import { AppShortcutCard } from '@RFWebApp/ui';
<AppShortcutCard title="RH" icon="👥" href="/rh" />
```

Tailwind com preset da UI:

```ts
// apps/autos/tailwind.config.ts
import preset from '@RFWebApp/ui/tailwind.config';

export default {
  presets: [preset],
  content: ['./src/**/*.{js,ts,jsx,tsx}']
};
```

🌗 Sistema de temas
Envvolva a aplicação com `ThemeProvider` e importe `@RFWebApp/ui/styles/themes.css`.
Use o hook `usePrefs` ou o componente `ThemeToggle` para alterar entre `light`,
`dark` e `high-contrast`. As preferências são guardadas em `localStorage`.
Existe uma página `/settings` onde o utilizador pode mudar o tema e definir o funcionário ativo.

🧠 Adicionar um novo microserviço

- Criar nova pasta em `apps/<nome-do-app>`
- Criar `package.json` com name, next, tailwind, etc.
- Importar o preset Tailwind da UI partilhada
- Adicionar `next.config.js` com `transpilePackages` para `@RFWebApp/ui`
- Garantir que `pnpm-workspace.yaml` já inclui `apps/*`

🧪 Testar UI localmente

```bash
pnpm dev -F @RFWebApp/ui
```

✨ Animações com GSAP

```tsx
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export const Card = ({ children }) => {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4 }
    );
  }, []);

  return <div ref={ref}>{children}</div>;
};
```

🔐 Autenticação + Funcionário Ativo

- Login com MSAL (Microsoft Entra ID)
- Após login, executar:

```sql
SELECT Number, Name FROM Employee WHERE UserId = @upn AND Active = 1
```

- Se múltiplos: mostrar UI de seleção de funcionário
- Guardar `employeeNumber` via Zustand + localStorage
- Middleware bloqueia apps sensíveis se não houver funcionário
- Store persistente `useAuthStore` mantém `employeeNumber`, `userName` e `roles`.
- Hook `useRequireAuth` redireciona para `/login` ou `/landing`.
- Endpoint `/api/funcionarios?email=...` devolve os funcionários associados.
- A página `/landing` usa esse endpoint para selecionar o funcionário ativo.
- Cada app possui `middleware.ts` que valida os cookies `AuthSession` e `Employee`.

📱 Página de apps disponíveis (`/apps`)

- Mostra cartões animados com GSAP para cada microserviço
- Apps como RH só visíveis se `employeeNumber` estiver definido

📦 Componente `AppCard` (em `@RFWebApp/ui`)

```tsx
<AppCard
  title="RH"
  description="Gestão de recursos humanos"
  href="/rh"
  locked={!employeeNumber}
/>
```

- Overlay cinza e ícone de cadeado se bloqueado
- Totalmente animado e responsivo

📐 Tecnologias

- pnpm workspaces – gestão de múltiplos projetos
- React / Next.js – apps frontend
- Tailwind CSS – tema partilhado com tokens
- GSAP – animações suaves e profissionais
- clsx – gestão de classes condicionais
- Zustand – estado global (funcionário ativo)
- MSAL – autenticação Microsoft 365
- SQL Server – verificação de associação a funcionário

🛠️ Desenvolvimento
Estrutura recomendada de um microserviço:
apps/<nome>/
├── src/
│ ├── app/
│ ├── components/
│ └── ...
├── package.json
├── tailwind.config.ts
├── tsconfig.json

📌 Convenções

- Todos os componentes visuais devem vir do `@RFWebApp/ui`
- As apps não devem redefinir estilos globais
- Todas as apps devem reutilizar o preset de Tailwind
- Apps sensíveis devem validar presença de `employeeNumber`

⚙️ CI/CD

A pipeline do GitHub Actions instala dependências, corre o lint e constrói
cada microserviço individualmente via `pnpm --filter <app> build`. O passo de
deploy pode ser ajustado para Vercel, Netlify ou Azure conforme necessário.

📊 Métricas e Logs

Cada microserviço possui um endpoint `api/analytics` que recolhe navegação e
erros de runtime. O hook `useAnalytics(service)` envia eventos automaticamente
em cada mudança de rota e captura falhas globais.

✅ A fazer / melhorias futuras

- [ ] Criar Modal, Tabs, Tooltip, AppCard animados na UI
- [ ] Criar layout base com Navbar lateral e topbar
- [ ] Criar design tokens exportáveis para Figma
- [ ] Publicar `@RFWebApp/ui` em NPM privado (GitHub Packages)
- [ ] Criar fallback de autenticação para outros provedores (ex: Azure B2B)
