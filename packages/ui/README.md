# @RFWebApp/ui

Biblioteca de componentes React compartilhada para as aplicações do monorepo.

## Processo de release

1. Certifique-se de que todas as mudanças estejam na branch `main`.
2. Crie e envie uma tag com o formato `ui-v<versao>` (ex.: `ui-v1.2.0`).
   A publicação é iniciada quando a tag é enviada para o GitHub.
3. O workflow **Publish UI** será executado automaticamente e irá:
   - Atualizar `packages/ui/package.json` com `pnpm version` usando o número da tag;
   - Executar `pnpm lint` e `pnpm test`;
   - Buildar e publicar o pacote no registro definido em `publishConfig.registry`.

Não é necessário publicar manualmente: apenas envie a tag e aguarde o workflow.
