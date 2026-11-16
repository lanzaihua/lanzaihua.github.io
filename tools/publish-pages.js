'use strict';
const fs=require('node:fs');const path=require('node:path');const {spawnSync}=require('node:child_process');
const root=path.join(__dirname,'..');const check=process.argv.includes('--check');
if(!check){const result=spawnSync(process.execPath,['build.js','--pages'],{cwd:root,stdio:'inherit'});if(result.status!==0) process.exit(result.status||1);}
const built=fs.readFileSync(path.join(root,'dist-pages','index.html'));const target=path.join(root,'index.html');
const staticDir=path.join(root,'src','static');
const staticFiles=fs.existsSync(staticDir)?fs.readdirSync(staticDir):[];
const bankSrc=path.join(root,'dist-pages','data','bank.json');const bankDest=path.join(root,'data','bank.json');
const splitDir=path.join(root,'dist-pages','data');const splitFiles=fs.existsSync(splitDir)?fs.readdirSync(splitDir).filter(f=>/^bank-(index|[a-z]+)\.json$/.test(f)):[];
if(check) {
  if(!fs.existsSync(target)||!built.equals(fs.readFileSync(target))) {console.error('index.html differs from source; run npm run prepare:pages');process.exit(1);}
  for(const f of staticFiles) {const src=fs.readFileSync(path.join(staticDir,f));const dest=path.join(root,f);if(!fs.existsSync(dest)||!src.equals(fs.readFileSync(dest))) {console.error(f+' differs from source; run npm run prepare:pages');process.exit(1);}}
  if(!fs.existsSync(bankSrc)||!fs.existsSync(bankDest)||!fs.readFileSync(bankSrc).equals(fs.readFileSync(bankDest))) {console.error('data/bank.json differs from source; run npm run prepare:pages');process.exit(1);}
  for(const f of splitFiles){const src=path.join(splitDir,f),dest=path.join(root,'data',f);if(!fs.existsSync(dest)||!fs.readFileSync(src).equals(fs.readFileSync(dest))){console.error('data/'+f+' differs from source; run npm run prepare:pages');process.exit(1);}}
  const extras=fs.existsSync(path.join(root,'data'))?fs.readdirSync(path.join(root,'data')).filter(f=>/^bank-.*\.json$/.test(f)&&splitFiles.indexOf(f)<0):[];
  if(extras.length){console.error('stale bank shards: '+extras.join(', ')+'; run npm run prepare:pages');process.exit(1);}
} else {
  fs.writeFileSync(target,built);
  for(const f of staticFiles) fs.copyFileSync(path.join(staticDir,f),path.join(root,f));
  fs.mkdirSync(path.dirname(bankDest),{recursive:true});
  if(fs.existsSync(bankSrc)) fs.copyFileSync(bankSrc,bankDest);
  if(fs.existsSync(path.join(root,'data'))){for(const f of fs.readdirSync(path.join(root,'data'))){if(/^bank-.*\.json$/.test(f)&&splitFiles.indexOf(f)<0) fs.rmSync(path.join(root,'data',f),{force:true});}}
  for(const f of splitFiles) fs.copyFileSync(path.join(splitDir,f),path.join(root,'data',f));
}
