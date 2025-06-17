# Development notes

This repository is a pnpm workspace with multiple Next.js micro-services and a shared UI package.

## Setup and running apps
- Install dependencies from the repo root:
  ```bash
  pnpm install
  ```
- Each app has its own dev script. Use `--filter` to start one:
  ```bash
  pnpm dev -F <app>
  ```
- Environment variables are defined in `.env.example`. Copy it to `.env.local` and fill in values such as `NEXT_PUBLIC_AZURE_CLIENT_ID`, `AZURE_OPENAI_API_KEY`, database credentials, etc. Client‑side variables must begin with `NEXT_PUBLIC_`.

## Testing
- Run the full test suite with:
  ```bash
  pnpm test
  ```
- See `docs/testing-guide.md` for details on Jest configuration, structure, and integration tests.

## Security and employee flow
- Follow the rules in `apps/rh/ai/core-instructions.md`:
  - Users authenticate via MSAL and are redirected to `/landing` to choose an active employee.
  - No protected route can be accessed without an `employeeNumber` in state.
  - All mutations must include `employee_number` and `user_upn`, and the backend must validate these fields.
  - Never allow selection of employees with `[Active] = 0`.

## Roadmap highlights
Planned tasks from `docs/roadmap.md` include:
1. Add animated components (Modal, Tabs, Tooltip, AppCard).
2. Implement a shared layout with side navbar and top bar.
3. Generate design tokens for Figma.
4. Publish `@RFWebApp/ui` via GitHub Packages.
5. Provide authentication fallback (e.g., Azure B2B).

## Additional notes
- Do not commit build artifacts such as `.next/` directories.
- Consult the README for repository structure, UI usage examples, and common scripts.
