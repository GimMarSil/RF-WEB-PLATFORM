#!/usr/bin/env node
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs' },
  ignoreDiagnostics: [2307]
});
const fs = require('fs');
const path = require('path');
const defaultTheme = require('tailwindcss/defaultTheme');
const config = require('../tailwind.config.ts').default;

const baseColors = typeof defaultTheme.colors === 'function'
  ? defaultTheme.colors()
  : defaultTheme.colors;
const tokens = {
  colors: { ...baseColors, ...(config.theme?.extend?.colors || {}) },
  spacing: { ...defaultTheme.spacing, ...(config.theme?.extend?.spacing || {}) }
};

const output = path.join(__dirname, '..', 'tokens.json');
fs.writeFileSync(output, JSON.stringify(tokens, null, 2));

const figma = { color: {}, spacing: {} };
for (const [name, value] of Object.entries(tokens.colors)) {
  figma.color[name] = { value };
}
for (const [name, value] of Object.entries(tokens.spacing)) {
  figma.spacing[name] = { value };
}

const outputFigma = path.join(__dirname, '..', 'tokens-figma.json');
fs.writeFileSync(outputFigma, JSON.stringify(figma, null, 2));

console.log(`Tokens gravados em ${output}`);
console.log(`Tokens Figma gravados em ${outputFigma}`);
