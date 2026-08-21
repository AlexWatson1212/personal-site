import { chromium } from "playwright";
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const ROOT="/home/claude/aw", PREV=path.join(ROOT,"_preview"), OUT="/home/claude/aw/_shots";
const types={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml"};
const srv=http.createServer((req,res)=>{let u=decodeURIComponent(req.url.split("?")[0]);
 let f=path.join(PREV,u); if(u.startsWith("/assets"))f=path.join(ROOT,u);
 if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,"index.html");
 if(!fs.existsSync(f)){res.writeHead(404);return res.end("");}
 res.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});res.end(fs.readFileSync(f));});
await new Promise(r=>srv.listen(0,r)); const port=srv.address().port;
fs.mkdirSync(OUT,{recursive:true});
const b=await chromium.launch({executablePath:"/opt/pw-browsers/chromium-1194/chrome-linux/chrome"});
const routes=process.argv.slice(2);
for(const [w,h] of [[1280,900],[375,760]]){
  const p=await b.newPage({viewport:{width:w,height:h}});
  for(const r of routes){
    await p.goto(`http://127.0.0.1:${port}${r}`,{waitUntil:"networkidle"});
    const name=(r==="/"?"home":r.replace(/^\/|\/$/g,"").replace(/\//g,"-"))+`-${w}.png`;
    await p.screenshot({path:path.join(OUT,name),fullPage:true});
    console.log(name);
  }
  await p.close();
}
await b.close(); srv.close();
