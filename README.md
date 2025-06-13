
# 🏗️ RF-Web-Platform

Monorepo da plataforma Ramos Ferreira, com micro-serviços React/Next.js e uma UI partilhada centralizada.

## 📦 Estrutura

```
rf-web-platform/
├── apps/
│   ├── autos/               # Microserviço de autos de medição
│   └── ...                  # Futuras apps (ex: dashboard, auth, etc.)
├── packages/
│   └── ui/                  # Biblioteca @RFWebApp/ui com Tailwind + GSAP
├── pnpm-workspace.yaml      # Declaração dos workspaces
├── tsconfig.base.json       # Configuração TypeScript comum
├── package.json             # Raiz do monorepo (apenas metainformação)
```

---

## 🚀 Instalação

1. Clonar o projeto:

```bash
git clone <repo-url> rf-web-platform
cd rf-web-platform
```

2. Instalar todas as dependências (root + workspaces):

```bash
pnpm install
```

---

## 🔁 Scripts úteis

| Comando                                  | Descrição                                 |
|------------------------------------------|-------------------------------------------|
| `pnpm dev -F autos`                      | Inicia o microserviço `autos`             |
| `pnpm build -F @RFWebApp/ui`            | Build do pacote de UI                     |
| `pnpm run dev -F @RFWebApp/ui`          | Dev mode do pacote UI                     |
| `pnpm add -F autos @RFWebApp/ui`        | Adiciona o pacote UI ao microserviço      |

---

## 🎨 UI Partilhada: `@RFWebApp/ui`

Biblioteca central de componentes estilizados com Tailwind CSS, GSAP e design Ramos Ferreira.

### Como usar na tua app:

1. Instalar dependência (já incluída em `autos` por defeito):

```tsx
pnpm add -F autos @RFWebApp/ui
```

2. Usar componentes:

```tsx
import { Button } from "@RFWebApp/ui";

<Button variant="primary">Salvar</Button>
```

### Tailwind com preset da UI

```ts
// apps/autos/tailwind.config.ts
import preset from "@RFWebApp/ui/tailwind.config";

export default {
  presets: [preset],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
};
```

---

## 🧠 Adicionar um novo microserviço

1. Criar nova pasta em `apps/<nome-do-app>`
2. Criar `package.json` com `name`, `next`, `tailwind`, etc.
3. Adicionar Tailwind com o preset da UI
4. Adicionar como novo projeto no `pnpm-workspace.yaml` (já cobre `apps/*` por omissão)

---

## 🧪 Testar UI localmente

No pacote `@RFWebApp/ui`:

```bash
pnpm dev -F @RFWebApp/ui
```

---

## ✨ Animações com GSAP

Exemplo de componente com animação na entrada:

```tsx
import { useRef, useEffect } from "react";
import { gsap } from "gsap";

export const Card = ({ children }) => {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(ref.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });
  }, []);

  return <div ref={ref}>{children}</div>;
};
```

---

## 📐 Tecnologias

- **pnpm workspaces** – gestão de múltiplos projetos
- **React / Next.js** – apps frontend
- **Tailwind CSS** – estilização com tema partilhado
- **GSAP** – animações suaves e profissionais
- **clsx** – gestão de classes condicionais

---

## 🛠️ Desenvolvimento

### Estrutura recomendada de um microserviço:

```
apps/<nome>/
├── src/
│   ├── app/
│   ├── components/
│   └── ...
├── package.json
├── tailwind.config.ts
├── tsconfig.json
```

---

## 📌 Convenções

- Todos os componentes visuais devem vir do `@RFWebApp/ui`
- As apps não devem redefinir estilos de base (usar o tema partilhado)
- Evitar lógica visual duplicada entre apps

---

## ✅ A fazer / melhorias futuras

- [ ] Criar `Modal`, `Tabs`, `Tooltip`, `Card` animados na UI
- [ ] Criar design tokens exportáveis para Figma
- [ ] Publicar `@RFWebApp/ui` em NPM privado (GitHub Packages)

---

Feito com ❤️ para os projetos Ramos Ferreira.
