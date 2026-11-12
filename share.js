/* Shared helpers: draw a result card as an image, show it for saving, and share. */
(function(){
const PAL={bg:"#fff4f6",card:"#ffffff",line:"#f6d3dc",fg:"#4a2c36",muted:"#8a6470",accent:"#e2668b",soft:"#ffe4ec",a:"#f7a8bf",b:"#ffc9d6",c:"#f4b6e0",leaf:"#9ccfa4",center:"#ffd36e"};
const ROUND='"Zen Maru Gothic","Noto Sans TC","PingFang TC","Hiragino Maru Gothic ProN",sans-serif';
const BODY='"Noto Sans TC","Zen Maru Gothic","PingFang TC","Hiragino Sans",sans-serif';

const css=`.shot-overlay{position:fixed;inset:0;z-index:50;background:rgba(74,44,54,.55);display:flex;align-items:center;justify-content:center;
 padding:max(16px,env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) max(16px,env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px))}
.shot-box{background:var(--surface,#fff);color:var(--fg,#4a2c36);border-radius:22px;padding:16px;max-width:440px;width:100%;max-height:100%;display:flex;flex-direction:column;gap:12px}
.shot-box img{width:100%;height:auto;max-height:60vh;object-fit:contain;border-radius:14px;border:2px solid var(--line,#f6d3dc);background:#fff4f6}
.shot-box p{margin:0;font-size:13.5px;color:var(--muted,#8a6470);text-align:center}
.shot-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.shot-actions a,.shot-actions button{text-decoration:none}`;
const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

function tokens(s){return String(s).match(/[　-〿぀-ヿ㐀-鿿＀-￯]|[^\s　-〿぀-ヿ㐀-鿿＀-￯]+|\s+/g)||[]}
function wrap(ctx,text,max){
  const out=[];
  for(const para of String(text).split("\n")){
    let line="";
    for(const t of tokens(para)){
      const test=line+t;
      if(ctx.measureText(test).width>max&&line.trim()){out.push(line.trimEnd());line=t.trimStart()}
      else line=test;
    }
    out.push(line.trimEnd());
  }
  return out;
}
function flower(ctx,x,y,r,color){
  ctx.save();ctx.translate(x,y);ctx.fillStyle=color;
  for(let i=0;i<5;i++){ctx.save();ctx.rotate(i*Math.PI*2/5);ctx.beginPath();ctx.ellipse(0,-r*.48,r*.34,r*.5,0,0,Math.PI*2);ctx.fill();ctx.restore()}
  ctx.fillStyle=PAL.center;ctx.beginPath();ctx.arc(0,0,r*.26,0,Math.PI*2);ctx.fill();ctx.restore();
}
function rrect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}

/* card = {eyebrow, title, blocks:[{h?, p, strong?}], footer, url} */
async function makeImage(card){
  try{await document.fonts.ready}catch(e){}
  const W=1080,P=96,IN=W-P*2-80;
  const c=document.createElement("canvas"),ctx=c.getContext("2d");
  const fH=`700 40px ${ROUND}`,fT=`700 60px ${ROUND}`,fE=`700 30px ${ROUND}`,fP=`400 36px ${BODY}`,fS=`700 36px ${BODY}`,fF=`400 26px ${BODY}`;
  const lines=[];
  ctx.font=fE;lines.push({f:fE,c:PAL.accent,t:card.eyebrow||"",gap:18,center:true});
  ctx.font=fT;for(const l of wrap(ctx,card.title,IN))lines.push({f:fT,c:PAL.fg,t:l,lh:78,center:true});
  lines.push({sp:36});
  for(const b of card.blocks){
    if(b.h){ctx.font=fH;for(const l of wrap(ctx,b.h,IN))lines.push({f:fH,c:PAL.accent,t:l,lh:56})}
    const f=b.strong?fS:fP;ctx.font=f;
    for(const l of wrap(ctx,b.p,IN))lines.push({f,c:PAL.fg,t:l,lh:56});
    lines.push({sp:26});
  }
  if(card.sig){ctx.font=fH;lines.push({f:fH,c:PAL.accent,t:card.sig,lh:56,right:true})}
  const bodyH=lines.reduce((s,l)=>s+(l.sp||l.lh||48+(l.gap||0)),0);
  const cardTop=230,cardH=bodyH+120,H=cardTop+cardH+200;
  c.width=W;c.height=H;
  ctx.fillStyle=PAL.bg;ctx.fillRect(0,0,W,H);
  ctx.fillStyle=PAL.line;for(let y=20;y<H;y+=44)for(let x=20;x<W;x+=44){ctx.beginPath();ctx.arc(x,y,2.4,0,Math.PI*2);ctx.fill()}
  flower(ctx,W/2,120,86,PAL.a);flower(ctx,150,170,46,PAL.c);flower(ctx,W-150,110,40,PAL.b);
  ctx.fillStyle=PAL.line;rrect(ctx,P,cardTop+14,W-P*2,cardH,48);ctx.fill();
  ctx.fillStyle=PAL.card;rrect(ctx,P,cardTop,W-P*2,cardH,48);ctx.fill();
  ctx.strokeStyle=PAL.line;ctx.lineWidth=4;ctx.stroke();
  let y=cardTop+80;const x0=P+40;
  ctx.textBaseline="alphabetic";
  for(const l of lines){
    if(l.sp){y+=l.sp;continue}
    ctx.font=l.f;ctx.fillStyle=l.c;
    if(l.center){ctx.textAlign="center";ctx.fillText(l.t,W/2,y)}
    else if(l.right){ctx.textAlign="right";ctx.fillText(l.t,W-P-40,y)}
    else{ctx.textAlign="left";ctx.fillText(l.t,x0,y)}
    y+=l.lh||48+(l.gap||0);
  }
  const gy=H-110;
  ctx.strokeStyle=PAL.leaf;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(60,gy+40);ctx.quadraticCurveTo(W/2,gy+10,W-60,gy+40);ctx.stroke();
  [[140,PAL.a,34],[300,PAL.c,24],[540,PAL.b,40],[780,PAL.a,26],[940,PAL.c,34]].forEach(([fx,col,r])=>flower(ctx,fx,gy+10,r,col));
  ctx.font=fF;ctx.fillStyle=PAL.muted;ctx.textAlign="center";ctx.fillText(card.footer||location.host+location.pathname,W/2,H-30);
  return c;
}

function overlay(canvas,L,filename){
  const url=canvas.toDataURL("image/png");
  const ov=document.createElement("div");ov.className="shot-overlay";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");
  ov.innerHTML=`<div class="shot-box"><img alt=""><p></p><div class="shot-actions"><a class="btn primary" download></a><button type="button" class="btn"></button></div></div>`;
  const img=ov.querySelector("img");img.src=url;img.alt=filename;
  ov.querySelector("p").textContent=L.hold;
  const a=ov.querySelector("a");a.href=url;a.download=filename;a.textContent=L.download;
  const close=ov.querySelector("button");close.textContent=L.close;
  const done=()=>{ov.remove();document.removeEventListener("keydown",esc)};
  const esc=e=>{if(e.key==="Escape")done()};
  close.onclick=done;ov.onclick=e=>{if(e.target===ov)done()};document.addEventListener("keydown",esc);
  document.body.appendChild(ov);a.focus();
}

window.Bloom={
  async saveImage(card,L,filename){
    const c=await makeImage(card);overlay(c,L,filename||"result.png");
  },
  async share({title,text,url},L,btn){
    url=url||location.href.split("#")[0];
    if(navigator.share){try{await navigator.share({title,text,url});return}catch(e){if(e&&e.name==="AbortError")return}}
    try{await navigator.clipboard.writeText(text+"\n\n"+url);if(btn)btn.textContent=L.shared}catch(e){if(btn)btn.textContent=L.copyFail}
  }
};
})();
