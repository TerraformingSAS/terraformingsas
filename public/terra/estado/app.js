'use strict';
const $=s=>document.querySelector(s),NS='http://www.w3.org/2000/svg';
const COLORS={'Disponible':'#66b48a','Reservado':'#ebcb6a','En negociación':'#86b9da','Vendido':'#db8179','No disponible':'#b4b9b4'};
const WHATSAPP_PHONE='573214230090';
function whatsappQuoteUrl(lotId){
 const message=`Hola, me gustaría cotizar el lote ${lotId} de TERRA Etapa I. ¿Podrían compartirme el precio, la disponibilidad y las condiciones de compra?`;
 return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
let lots=[],block='',chosen='',drag=null;const svg=$('#plano');
function node(tag,attrs,text){const el=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);if(text!=null)el.textContent=text;return el;}
function box(items,pad=12){const pts=items.flatMap(p=>p.puntos),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);return [Math.min(...xs)-pad,Math.min(...ys)-pad,Math.max(...xs)-Math.min(...xs)+2*pad,Math.max(...ys)-Math.min(...ys)+2*pad];}
function fit(items){if(!items.length)return;svg.setAttribute('viewBox',box(items,18).join(' '));}
function number(value){return Number(value).toLocaleString('es-CO',{maximumFractionDigits:2});}
function highlight(lot){chosen=lot.id;document.querySelectorAll('#formas polygon').forEach(p=>p.classList.toggle('selected',p.id==='lote-'+lot.id));$('#lote-activo').textContent=lot.id;$('#estado-activo').textContent=lot.estado;const m=lot.medidas;$('#dimensiones-activas').textContent=m?`${number(m.lado_a_m)} × ${number(m.lado_b_m)} m`:'Por confirmar';$('#area-activa').textContent=m?`${number(m.area_m2)} m²`:'Por confirmar';$('#nota-medidas').textContent='Medidas y área según el Excel.';const quote=$('#cotizar-lote');const canQuote=lot.estado==='Disponible';if(canQuote){quote.href=whatsappQuoteUrl(lot.id);quote.tabIndex=0;}else{quote.removeAttribute('href');quote.tabIndex=-1;}quote.setAttribute('aria-disabled',String(!canQuote));quote.setAttribute('aria-label',canQuote?`Cotizar el lote ${lot.id} por WhatsApp`:`El lote ${lot.id} no está disponible para cotizar`);$('#seleccion').hidden=false;}
function setBlock(value){block=value;$('#buscar').value='';document.querySelectorAll('[data-block]').forEach(b=>{b.classList.toggle('active',b.dataset.block===value);b.setAttribute('aria-pressed',String(b.dataset.block===value));});const visible=lots.filter(p=>!block||p.manzana===block);document.querySelectorAll('#formas polygon,#etiquetas text').forEach(el=>el.classList.toggle('dim',!!block&&el.dataset.block!==block));fit(visible);$('#seleccion').hidden=true;}
function zoom(factor){const b=svg.viewBox.baseVal,w=b.width*factor;if(w<35||w>1800)return;svg.setAttribute('viewBox',[b.x+b.width*(1-factor)/2,b.y+b.height*(1-factor)/2,w,b.height*factor].join(' '));}
$('#mas').addEventListener('click',()=>zoom(.8));$('#menos').addEventListener('click',()=>zoom(1.25));$('#ajustar').addEventListener('click',()=>fit(lots.filter(p=>!block||p.manzana===block)));
$('#cerrar').addEventListener('click',()=>{$('#seleccion').hidden=true;document.querySelectorAll('.selected').forEach(el=>el.classList.remove('selected'));chosen='';});
document.querySelectorAll('[data-block]').forEach(b=>b.addEventListener('click',()=>setBlock(b.dataset.block)));
$('#buscar').addEventListener('input',e=>{const query=e.target.value.trim().toUpperCase().replace(/\s/g,'');const found=lots.find(p=>p.id===query||p.id===query.replace(/^([A-F])-?(\d)$/,'$1-0$2'));if(found){block=found.manzana;document.querySelectorAll('[data-block]').forEach(b=>{b.classList.toggle('active',b.dataset.block===block);b.setAttribute('aria-pressed',String(b.dataset.block===block));});document.querySelectorAll('#formas polygon,#etiquetas text').forEach(el=>el.classList.toggle('dim',el.dataset.block!==block));fit(lots.filter(p=>p.manzana===block));highlight(found);}else if(!query)setBlock('');});
svg.addEventListener('pointerdown',e=>{if(e.target.closest('polygon'))return;drag={x:e.clientX,y:e.clientY,left:svg.viewBox.baseVal.x,top:svg.viewBox.baseVal.y};svg.setPointerCapture(e.pointerId);});
svg.addEventListener('pointermove',e=>{if(!drag)return;const m=svg.getScreenCTM();svg.viewBox.baseVal.x=drag.left-(e.clientX-drag.x)/m.a;svg.viewBox.baseVal.y=drag.top-(e.clientY-drag.y)/m.d;});
svg.addEventListener('pointerup',()=>drag=null);svg.addEventListener('pointercancel',()=>drag=null);
for(const[state,color]of Object.entries(COLORS)){const el=document.createElement('span'),dot=document.createElement('i');dot.style.background=color;el.append(dot,document.createTextNode(state));$('#leyenda').append(el);}
function draw(data){
 if(!Array.isArray(data.lotes)||data.lotes.length!==104)throw Error('Datos inválidos');
 const previous=chosen;lots=data.lotes;
 for(const group of ['#formas','#etiquetas','#titulos'])$(group).replaceChildren();
 for(const p of lots){const polygon=node('polygon',{id:'lote-'+p.id,points:p.puntos.map(v=>v.join(',')).join(' '),fill:COLORS[p.estado],'data-block':p.manzana,tabindex:'0',role:'button','aria-label':`Lote ${p.id}, ${p.estado}`});polygon.append(node('title',{},`Lote ${p.id} · ${p.estado} · ${number(p.medidas.area_m2)} m²`));polygon.addEventListener('click',()=>highlight(p));polygon.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();highlight(p);}});$('#formas').append(polygon);$('#etiquetas').append(node('text',{x:p.centro[0],y:p.centro[1],'data-block':p.manzana},p.id));}
 for(const b of 'ABCDEF'){const bounds=box(lots.filter(p=>p.manzana===b),0);$('#titulos').append(node('text',{x:bounds[0]+2,y:bounds[1]-7},'Manzana '+b));}
 document.querySelectorAll('#formas polygon,#etiquetas text').forEach(el=>el.classList.toggle('dim',!!block&&el.dataset.block!==block));
 if(previous){const lot=lots.find(l=>l.id===previous);if(lot)highlight(lot);}
 $('#fecha').textContent='Fuente actualizada '+new Date(data.actualizado).toLocaleString('es-CO',{timeZone:'America/Bogota'});
 $('#carga').hidden=true;
}
let requesting=false,firstLoad=true;
async function refresh(){
 if(requesting)return;requesting=true;
 try{const r=await fetch('/api/terra-estado',{cache:'no-store',signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error();const data=await r.json();draw(data);if(firstLoad){fit(lots);firstLoad=false;}}
 catch{if(firstLoad){$('#carga').hidden=false;$('#carga').textContent='La disponibilidad no está disponible en este momento. Volveremos a intentarlo automáticamente.';}else{$('#fecha').textContent='No se pudo actualizar. Se muestra la última consulta; confirma la disponibilidad antes de reservar.';}}
 finally{requesting=false;}
}
refresh();setInterval(refresh,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
