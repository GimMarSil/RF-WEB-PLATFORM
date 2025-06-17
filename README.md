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

🌍 Variáveis de Ambiente

Após copiar o ficheiro de exemplo, preencha cada entrada conforme a descrição abaixo. Variáveis acessíveis no cliente devem obrigatoriamente começar com `NEXT_PUBLIC_`.

| Variável | Descrição |
| --- | --- |
| `NEXT_PUBLIC_AZURE_CLIENT_ID` | Client ID da aplicação Azure AD utilizada pelo frontend |
| `NEXT_PUBLIC_AZURE_AUTHORITY` | URL do tenant no Azure AD |
| `NEXT_PUBLIC_REDIRECT_URI` | URL de redirecionamento configurada na aplicação |
| `AZURE_AD_CLIENT_ID` | Client ID do backend protegido |
| `AZURE_AD_CLIENT_SECRET` | Segredo da aplicação (**apenas no servidor**) |
| `AZURE_AD_TENANT_ID` | Tenant ID da organização |
| `AZURE_AD_REDIRECT_URI` | URL de redirecionamento utilizada pelo backend |
| `AZURE_AD_API_AUDIENCE` | Application ID URI da API protegida |
| `NEXT_PUBLIC_API_SCOPES` | Escopos pedidos pelo frontend |
| `SQL_SERVER` | Endereço do SQL Server |
| `SQL_USER` | Utilizador da base de dados |
| `SQL_PASSWORD` | Palavra-passe do utilizador (**server only**) |
| `SQL_DATABASE` | Nome da base de dados |
| `AZURE_OPENAI_ENDPOINT` | Endpoint do serviço Azure OpenAI |
| `AZURE_OPENAI_DEPLOYMENT` | Nome do deployment no Azure OpenAI |
| `AZURE_OPENAI_API_VERSION` | Versão da API Azure OpenAI |
| `AZURE_OPENAI_API_KEY` | Chave de acesso ao Azure OpenAI |
| `ANALYTICS_DISABLED` | Defina como `true` para desligar a recolha de analytics |

Credenciais Azure AD podem ser obtidas no portal do Azure em **Azure Active Directory → Registos de Aplicações**. Lá encontra o `Application (client) ID`, o `Directory (tenant) ID` e pode gerar o `client secret` em **Certificates & secrets**.
Os detalhes de ligação à base de dados (`SQL_SERVER`, `SQL_USER`, `SQL_PASSWORD`, `SQL_DATABASE`) são fornecidos pela equipa de infraestruturas ou pela configuração da instância SQL existente.

Lembre-se de que `AZURE_AD_CLIENT_SECRET` e todas as credenciais `SQL_*` devem permanecer apenas no servidor e nunca serem expostas ao cliente.
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
| pnpm run tokens -F @RFWebApp/ui | Exporta cores e espaçamentos do Tailwind |
| node apps/rh/src/pages/api/create-postgres-tables.js | Cria tabelas no Postgres |
| node apps/rh/src/pages/api/syncEmployees.js | Sincroniza funcionários para Postgres |

Scripts JavaScript como os acima devem ser executados com `node` a partir da raiz do projeto.

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

Componentes com animações GSAP já incluídas:
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent, TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@RFWebApp/ui';

<Tabs defaultValue="one">
  <TabsList>
    <TabsTrigger value="one">One</TabsTrigger>
    <TabsTrigger value="two">Two</TabsTrigger>
  </TabsList>
  <TabsContent value="one">First</TabsContent>
  <TabsContent value="two">Second</TabsContent>
</Tabs>

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Dica</TooltipTrigger>
    <TooltipContent>Texto auxiliar</TooltipContent>
  </Tooltip>
</TooltipProvider>
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

Para exportar as cores e espaçamentos configurados, execute:

```bash
pnpm run tokens -F @RFWebApp/ui
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

🔧 Development

- `pnpm lint` verifica o código com ESLint.
- `pnpm test` executa a suite de testes. Consulte [docs/testing-guide.md](docs/testing-guide.md) para mais detalhes.
- Para erros comuns de configuração veja [docs/troubleshooting.md](docs/troubleshooting.md).
<<<<<<< codex/corrigir-erro-aadsts900144-na-sessão
- Lembre-se de correr `pnpm dev -F <app>` a partir da **raiz** sempre que alterar `.env.local`,
  caso contrário o Next.js não carrega as variáveis.
=======
>>>>>>> CodexDev

⚙️ CI/CD

A pipeline do GitHub Actions instala dependências, corre o lint e constrói
cada microserviço individualmente via `pnpm --filter <app> build`. O passo de
deploy pode ser ajustado para Vercel, Netlify ou Azure conforme necessário.

📊 Métricas e Logs

Cada microserviço possui um endpoint `api/analytics` que recolhe navegação e
erros de runtime. O hook `useAnalytics(service)` envia eventos automaticamente
em cada mudança de rota e captura falhas globais.

🛣️ Roadmap para versão 1.0

- [ ] [Adicionar componentes animados](https://github.com/GimMarSil/rf-web-platform/issues/1)
- [ ] [Implementar layout base](https://github.com/GimMarSil/rf-web-platform/issues/2)
- [ ] [Gerar design tokens para Figma](https://github.com/GimMarSil/rf-web-platform/issues/3)
- [ ] [Publicar `@RFWebApp/ui` no GitHub Packages](https://github.com/GimMarSil/rf-web-platform/issues/4)
- [ ] [Adicionar fallback de autenticação](https://github.com/GimMarSil/rf-web-platform/issues/5)

Consulte [docs/roadmap.md](docs/roadmap.md) para mais detalhes sobre estas tarefas.

## Licença

Este projeto é distribuído sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para detalhes.
