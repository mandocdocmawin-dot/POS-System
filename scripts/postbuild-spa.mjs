import {copyFile,writeFile} from 'node:fs/promises';
await copyFile('dist/index.html','dist/404.html');await writeFile('dist/.nojekyll','');
console.log('Prepared GitHub Pages SPA fallback and .nojekyll.');
