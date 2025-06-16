import preset from '@rfwebapp/ui/tailwind.config';
import type { Config } from 'tailwindcss';

const config: Config = {
  presets: [preset],
  content: [
    './packages/ui/src/**/*.{js,ts,jsx,tsx}',
    './apps/*/src/**/*.{js,ts,jsx,tsx}'
  ]
};

export default config;
