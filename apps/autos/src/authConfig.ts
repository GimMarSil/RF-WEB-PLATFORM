export const authConfig = {
  clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '',
  tenantId: process.env.NEXT_PUBLIC_AZURE_TENANT_ID || '',
  b2bClientId: process.env.NEXT_PUBLIC_AZURE_B2B_CLIENT_ID,
  b2bAuthority: process.env.NEXT_PUBLIC_AZURE_B2B_AUTHORITY,
  redirectUri:
    process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/autos'
};
