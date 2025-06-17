# Guia de Testes

Este documento descreve como preparar e executar os testes automatizados no monorepo **RF-Web-Platform**. Cada micro-serviço é uma aplicação Next.js e partilha uma biblioteca de UI.

## Instalação de dependências

1. Certifique-se de ter o `pnpm` instalado.
2. Na raiz do projeto execute:

```bash
pnpm install
```

Este comando instala todas as dependências dos workspaces, incluindo as bibliotecas necessárias para o Jest e React Testing Library.

## Executar todos os testes

Na raiz do repositório, utilize o script:

```bash
pnpm test
```

O comando acima corre o Jest em todos os micro-serviços e na biblioteca `packages/ui`.
Para acompanhar em modo watch utilize `pnpm test:watch`.

## Estrutura de configuração

- Cada micro-serviço possui um ficheiro `jest.config.js` que extende a configuração do Next.js.
- Os testes devem residir em `__tests__` ou usar o sufixo `.test.tsx`/`.test.ts`.
- O ficheiro `jest.setup.ts` importa as extensões do `@testing-library/jest-dom` e é partilhado por todos os projetos.

## Boas práticas

- Escrever testes de componentes com React Testing Library, validando comportamento e acessibilidade.
- Evitar dependências entre micro-serviços nos testes.
- Manter mocks e utilitários de teste próximos do código testado.
- Utilizar `pnpm test` antes de abrir Pull Requests.

## Exemplos

Um teste simples da biblioteca UI encontra‑se em `packages/ui/src/components/__tests__/button.test.tsx`.
Use-o como referência para novos componentes e páginas.

Cada micro-serviço também possui um teste de **smoke** em `src/__tests__/home.test.tsx`,
útil para validação rápida do carregamento da página inicial.

## Componentes com contexto

Alguns componentes da UI dependem de providers como `ThemeProvider`. Caso o teste
gere erros como `usePrefs must be used within ThemeProvider`, envolva o componente
com o provider correspondente:

```tsx
import { ThemeProvider } from '@RFWebApp/ui';

render(
  <ThemeProvider>
    <MyComponent />
  </ThemeProvider>
);
```

## Testes de integra\u00e7\u00e3o com Postgres

Alguns testes em `lib/db/__tests__` verificam a integra\u00e7\u00e3o com uma inst\u00e2ncia Postgres. Para execut\u00e1-los localmente, inicie um cont\u00eainer e defina a vari\u00e1vel `DATABASE_URL`:

```bash
docker run --name rf-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:latest
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres
pnpm test
```

O cont\u00eainer pode ser removido ap\u00f3s os testes com `docker rm -f rf-postgres`.
