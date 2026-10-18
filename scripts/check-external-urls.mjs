import fs from 'node:fs';import path from 'node:path';
// Package diagnostics and standard schema identifiers are not network destinations.
// Keep this exact list small; every other host-bearing URL fails the build.
const inert=new Set(['https://react.dev/errors/','https://apexcharts.com/pricing','http://fb.me/use-check-prop-types','https://json-schema.org/draft/2020-12/schema','http://json-schema.org/draft-07/schema#','http://json-schema.org/draft-04/schema#']);
const findings=new Map();
function scan(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())scan(file);else if(/\.(js|css|html|json|webmanifest|svg)$/.test(file))for(const match of fs.readFileSync(file,'utf8').matchAll(/https?:\/\/[^\s"'`<>\\)]+/g)){const url=match[0];if(/^https?:\/\/(?:www\.)?w3\.org\//.test(url)||url.startsWith('https://www.google.com/maps/search/?api=1&query=')||inert.has(url)||/^https:\/\/reactrouter\.com\/v6\/upgrading\/future#v7_[a-z]+$/.test(url)||/^http:\/\/\[\$\{\w+\}\]$/.test(url))continue;findings.set(url,file);}}}
scan('dist');if(findings.size){for(const [url,file]of findings)console.error(`${file}: ${url}`);process.exit(1);}console.log('External URL check passed (local assets; vendor diagnostics/schema identifiers excluded).');
