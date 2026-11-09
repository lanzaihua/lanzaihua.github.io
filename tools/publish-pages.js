'use strict';
const fs=require('node:fs');const path=require('node:path');const {spawnSync}=require('node:child_process');
const root=path.join(__dirname,'..');const result=spawnSync(process.execPath,['build.js','--pages'],{cwd:root,stdio:'inherit'});
if(result.status!==0) process.exit(result.status||1);
const built=fs.readFileSync(path.join(root,'dist-pages','index.html'));const target=path.join(root,'index.html');
const staticDir=path.join(root,'src','static');
const staticFiles=fs.existsSync(staticDir)?fs.readdirSync(staticDir):[];
const check=process.argv.includes('--check');
if(check) {
  if(!fs.existsSync(target)||!built.equals(fs.readFileSync(target))) {console.error('index.html differs from source; run npm run prepare:pages');process.exit(1);}
  for(const f of staticFiles) {const src=fs.readFileSync(path.join(staticDir,f));const dest=path.join(root,f);if(!fs.existsSync(dest)||!src.equals(fs.readFileSync(dest))) {console.error(f+' differs from source; run npm run prepare:pages');process.exit(1);}}
} else {
  fs.writeFileSync(target,built);
  for(const f of staticFiles) fs.copyFileSync(path.join(staticDir,f),path.join(root,f));
}
