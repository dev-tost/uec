#!/usr/bin/env node
// Podbija numerek "?v=" we wszystkich importach (index.html + js/*.js) za jednym uruchomieniem.
// Użycie: node scripts/bump-cache-version.js

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const jsDir = path.join(root, 'js');

const targets = [
  path.join(root, 'index.html'),
  ...fs.readdirSync(jsDir)
    .filter((f) => f.endsWith('.js'))
    .map((f) => path.join(jsDir, f)),
];

function newVersion() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}`;
}

const version = newVersion();
let changedFiles = 0;
let changedRefs = 0;

for (const file of targets) {
  const content = fs.readFileSync(file, 'utf8');
  const updated = content.replace(/\?v=\d+/g, () => {
    changedRefs++;
    return `?v=${version}`;
  });
  if (updated !== content) {
    fs.writeFileSync(file, updated, 'utf8');
    changedFiles++;
  }
}

console.log(`Nowa wersja: ${version}`);
console.log(`Zaktualizowano ${changedRefs} odwolan w ${changedFiles} plikach.`);
