'use strict';
const http=require('node:http');const fs=require('node:fs');const path=require('node:path');
const ROOT=path.join(__dirname,'..');const PORT=Number(process.env.PORT||4181);
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.png':'image/png','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8'};
function send(res,status,file){const body=fs.readFileSync(file);res.writeHead(status,{'Content-Type':TYPES[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(body);}
function create(){return http.createServer((req,res)=>{
  const u=new URL(req.url,'http://localhost');let file=path.join(ROOT,decodeURIComponent(u.pathname));
  if(file===ROOT||u.pathname==='/'||u.pathname==='/index.html') return send(res,200,path.join(ROOT,'index.html'));
  if(fs.existsSync(file)&&fs.statSync(file).isFile()) return send(res,200,file);
  if(!path.extname(u.pathname)) return send(res,404,path.join(ROOT,'404.html'));
  send(res,404,path.join(ROOT,'404.html'));
});}
function start(port){return new Promise((resolve,reject)=>{const server=create();server.once('error',reject);server.listen(port||PORT,'127.0.0.1',()=>{console.log('pages server http://127.0.0.1:'+(port||PORT));resolve(server);});});}
if(require.main===module) start(PORT);
module.exports={start};