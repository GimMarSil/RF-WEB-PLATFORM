# @RFWebApp/ui

Biblioteca de componentes React usada nos micro-serviços da plataforma. Inclui configuracao partilhada do Tailwind CSS e animações com GSAP.

## Geração de tokens

Para exportar as cores e espaçamentos definidos no Tailwind execute:

```bash
pnpm run tokens -F @rfwebapp/ui
```

Serão criados os ficheiros `tokens.json` e `tokens-figma.json` na pasta do pacote.

O ficheiro `tokens-figma.json` pode ser importado no Figma (plugin Token Studio) para atualizar as variáveis de design utilizadas nas maquetes.
