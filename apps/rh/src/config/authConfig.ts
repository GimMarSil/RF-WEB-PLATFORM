export const authConfig = {
  clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '',
  authority: process.env.NEXT_PUBLIC_AZURE_AUTHORITY || '',
  redirectUri:
    process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/rh'
};
