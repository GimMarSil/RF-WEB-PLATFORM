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
4. Confirme que o comando acima é executado **na raiz do repositório**, pois é
   onde o ficheiro `.env.local` é lido. Se iniciar o `next dev` manualmente a
   partir da pasta da app, as variáveis não serão carregadas.

Para garantir que o `client_id` está a ser passado, pode adicionar um `console.log`
em `authConfig.ts`:

```ts
console.log('Azure Client ID:', process.env.NEXT_PUBLIC_AZURE_CLIENT_ID);
```

Se o valor impresso for `undefined`, o problema está na localização do ficheiro
ou na falta de reinício do servidor após editar `.env.local`.


Se utilizar Azure B2B como fallback, certifique-se também de definir `NEXT_PUBLIC_AZURE_B2B_CLIENT_ID` e `NEXT_PUBLIC_AZURE_B2B_AUTHORITY`.

