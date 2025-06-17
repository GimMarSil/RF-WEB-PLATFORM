# Guia de Resolução de Problemas

Este documento reúne erros comuns encontrados durante o desenvolvimento ou execução das aplicações do monorepo.

## Erro de login "AADSTS900144"

Se ao tentar autenticar surge a mensagem:

```
AADSTS900144: The request body must contain the following parameter: 'client_id'.
```

isso significa que o MSAL não recebeu o **Client ID** configurado no Azure AD. Verifique se o ficheiro `.env.local` contém um valor válido para `NEXT_PUBLIC_AZURE_CLIENT_ID`. Sem este parâmetro a biblioteca não consegue redirecionar para o provedor de identidade.

Passos sugeridos:

1. Copie o ficheiro de exemplo:
   ```bash
   cp .env.example .env.local
   ```
2. Preencha `NEXT_PUBLIC_AZURE_CLIENT_ID` com o **Application (client) ID** da aplicação registada no portal do Azure.
3. Reinicie o servidor de desenvolvimento com `pnpm dev -F core`.

Se utilizar Azure B2B como fallback, certifique-se também de definir `NEXT_PUBLIC_AZURE_B2B_CLIENT_ID` e `NEXT_PUBLIC_AZURE_B2B_AUTHORITY`.

