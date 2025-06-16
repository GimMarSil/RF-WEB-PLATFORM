export const authConfig = {
  clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '',
  tenantId: process.env.NEXT_PUBLIC_AZURE_TENANT_ID || '',
  redirectUri:
    process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/timesheet'
};
