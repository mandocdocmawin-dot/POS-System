import fs from 'node:fs';
import path from 'node:path';
const root = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
const packages = Object.keys(lock.packages ?? {}).filter(name => name.startsWith('node_modules/')).flatMap(folder => {
  const filename = path.join(folder, 'package.json');
  if (!fs.existsSync(filename)) {
    if (lock.packages[folder].optional || lock.packages[folder].os || lock.packages[folder].cpu) return [];
    throw new Error(`Missing installed package: ${folder}. Run npm ci.`);
  }
  const pkg = JSON.parse(fs.readFileSync(filename, 'utf8'));
  return [{ name: pkg.name, version: pkg.version, license: typeof pkg.license === 'string' ? pkg.license : pkg.license?.type ?? 'Not declared; inspect package source' }];
}).sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version));
fs.mkdirSync('src/data/generated', { recursive: true });
fs.writeFileSync('src/data/generated/licenses.json', JSON.stringify({ app: { name: 'TindaPOS', version: root.version, license: root.license ?? 'UNLICENSED (private demo)' }, packages }, null, 2) + '\n');
