import fs from 'node:fs';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
const budget=JSON.parse(fs.readFileSync('scripts/bundle-budget.json','utf8').replace(/^\uFEFF/,''));
const manifest=JSON.parse(fs.readFileSync('dist/.vite/manifest.json','utf8'));
const seen=new Set();function collect(key){if(seen.has(key))return;seen.add(key);for(const child of manifest[key]?.imports??[])collect(child);}
for(const [key,value] of Object.entries(manifest))if(value.isEntry)collect(key);
const size=file=>gzipSync(fs.readFileSync(path.join('dist',file))).length/1024;
const initial=[...seen].reduce((sum,key)=>sum+(manifest[key].file.endsWith('.js')?size(manifest[key].file):0),0);
let failed=initial>budget.initialGzipKB;console.log(`Initial JS: ${initial.toFixed(2)} / ${budget.initialGzipKB} KiB gzip`);
for(const file of fs.readdirSync('dist/assets').filter(f=>f.endsWith('.js'))){const kb=size('assets/'+file);const limit=/apex|chart|report/i.test(file)?budget.chartGzipKB:budget.routeGzipKB;if(![...seen].some(k=>manifest[k].file==='assets/'+file)&&kb>limit){console.error(`${file}: ${kb.toFixed(2)} > ${limit} KiB gzip`);failed=true;}}
if(failed)process.exit(1);
