#!/usr/bin/env node
require('ts-node/register');
const fs = require('fs');
const path = require('path');
const resolveConfig = require('tailwindcss/resolveConfig');
const config = require('../tailwind.config.ts').default;

const full = resolveConfig(config);
const tokens = {
  colors: full.theme.colors,
  spacing: full.theme.spacing
};

const output = path.join(__dirname, '..', 'tokens.json');
fs.writeFileSync(output, JSON.stringify(tokens, null, 2));
console.log(`Tokens gravados em ${output}`);
