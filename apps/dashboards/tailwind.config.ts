import preset from '@rfwebapp/ui/tailwind.config';

export default {
  presets: [preset],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/**/*.{js,ts,jsx,tsx}'
  ]
};
