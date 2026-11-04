'use strict';
const $=s=>document.querySelector(s),NS='http://www.w3.org/2000/svg';
const COLORS={'Disponible':'#66b48a','Reservado':'#ebcb6a','En negociación':'#86b9da','Vendido':'#db8179','No disponible':'#b4b9b4'};
const WHATSAPP_PHONE='573214230090';
function whatsappQuoteUrl(lotId){
 const message=`Hola, quiero recibir información y una cotización del lote ${lotId} de TERRA Etapa I`;
 return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
let lots=[],block='',estado='',areaKey='',chosen='',drag=null,queryApplied=false;
const svg=$('#plano');
function node(tag,attrs,text){const el=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);if(text!=null)el.textContent=text;return el;}
function box(items,pad=12){const pts=items.flatMap(p=>p.puntos),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);return [Math.min(...xs)-pad,Math.min(...ys)-pad,Math.max(...xs)-Math.min(...xs)+2*pad,Math.max(...ys)-Math.min(...ys)+2*pad];}
function fit(items){if(!items.length)return;cancelViewAnim();const frame=box(items,18);writeBox(frame[0],frame[1],frame[2],frame[3]);}
let viewAnim=0;
function readBox(){const b=svg.viewBox.baseVal;return {x:b.x,y:b.y,w:b.width,h:b.height};}
function writeBox(x,y,w,h){svg.setAttribute('viewBox',[x,y,w,h].join(' '));}
function cancelViewAnim(){if(viewAnim){cancelAnimationFrame(viewAnim);viewAnim=0;}}
function animateView(target){
 cancelViewAnim();
 const b=svg.viewBox.baseVal;
 const from=[b.x||target[0],b.y||target[1],b.width||target[2],b.height||target[3]];
 const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduced||!from[2]){writeBox(target[0],target[1],target[2],target[3]);return;}
 const t0=performance.now();
 (function step(now){
  const t=Math.min(1,(now-t0)/720);
  const e=1-Math.pow(1-t,3);
  writeBox(from[0]+(target[0]-from[0])*e,from[1]+(target[1]-from[1])*e,from[2]+(target[2]-from[2])*e,from[3]+(target[3]-from[3])*e);
  if(t<1)viewAnim=requestAnimationFrame(step);
 })(t0);
}
function focusLot(lot){
 if(!lot||!lot.puntos)return;
 const [x,y,w,h]=box([lot],0);
 const span=Math.max(w,h,28);
 const pad=span*1.35;
 animateView([x-pad,y-pad,w+pad*2,h+pad*2]);
}
function number(value){return Number(value).toLocaleString('es-CO',{maximumFractionDigits:2});}
function highlight(lot){chosen=lot.id;document.querySelectorAll('#formas polygon').forEach(p=>p.classList.toggle('selected',p.id==='lote-'+lot.id));$('#lote-activo').textContent=lot.id;$('#estado-activo').textContent=lot.estado;const m=lot.medidas;$('#dimensiones-activas').textContent=m?`${number(m.lado_a_m)} × ${number(m.lado_b_m)} m`:'Por confirmar';$('#area-activa').textContent=m?`${number(m.area_m2)} m²`:'Por confirmar';$('#nota-medidas').textContent='Medidas y área según el Excel.';const manzanaEl=$('#manzana-activa');if(manzanaEl)manzanaEl.textContent=lot.manzana;const quote=$('#cotizar-lote');const canQuote=lot.estado==='Disponible';if(canQuote){quote.href=whatsappQuoteUrl(lot.id);quote.tabIndex=0;}else{quote.removeAttribute('href');quote.tabIndex=-1;}quote.setAttribute('aria-disabled',String(!canQuote));quote.setAttribute('aria-label',canQuote?`Cotizar el lote ${lot.id} por WhatsApp`:`El lote ${lot.id} no está disponible para cotizar`);const web=$('#cotizar-web');if(web&&typeof web.setAttribute==='function'){if(canQuote){web.href='/terra?lote='+encodeURIComponent(lot.id)+'#contacto';web.hidden=false;web.setAttribute('aria-disabled','false');}else{web.removeAttribute('href');web.hidden=true;web.setAttribute('aria-disabled','true');}}const price=lot.precio!=null?lot.precio:(lot.precio_cop!=null?lot.precio_cop:null);const priceEl=$('#precio-activo');const priceRow=$('#precio-fila');if(priceEl)priceEl.textContent=price!=null?new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(Number(price)):'';if(priceRow)priceRow.hidden=price==null;$('#seleccion').hidden=false;}
function setBlock(value){
 block=value;
 applyFilters(false);
}
function matches(lot){
 if(block&&lot.manzana!==block)return false;
 if(estado&&lot.estado!==estado)return false;
 if(areaKey&&String(lot.medidas&&lot.medidas.area_m2)!==areaKey)return false;
 return true;
}
function applyFilters(keepSelection){
 const visible=lots.filter(matches);
 document.querySelectorAll('[data-block]').forEach(b=>{
  b.classList.toggle('active',b.dataset.block===block);
  b.setAttribute('aria-pressed',String(b.dataset.block===block));
 });
 document.querySelectorAll('#formas polygon,#etiquetas text').forEach(el=>{
  const lot=lots.find(p=>('lote-'+p.id)===el.id||el.textContent===p.id);
  const id=el.dataset.block?el.dataset.block:'';
  const match=lot?matches(lot):(!block||id===block);
  el.classList.toggle('dim',!match);
 });
 fit(visible.length?visible:lots);
 if(!keepSelection){$('#seleccion').hidden=true;chosen='';document.querySelectorAll('.selected').forEach(el=>el.classList.remove('selected'));}
 renderFilterChips();
}
function renderFilterChips(){
 const host=$('#filtros-activos');
 if(!host)return;
 const chips=[];
 if(block)chips.push({key:'manzana',label:'Manzana '+block,clear:()=>setBlock('')});
 if(estado)chips.push({key:'estado',label:estado,clear:()=>{estado='';const sel=$('#filtro-estado');if(sel)sel.value='';applyFilters(false);}});
 if(areaKey)chips.push({key:'area',label:number(areaKey)+' m²',clear:()=>{areaKey='';const sel=$('#filtro-area');if(sel)sel.value='';applyFilters(false);}});
 host.replaceChildren();
 host.hidden=!chips.length;
 for(const chip of chips){
  const el=document.createElement('span');
  el.className='filter-chip';
  el.append(document.createTextNode(chip.label+' '));
  const btn=document.createElement('button');
  btn.type='button';
  btn.setAttribute('aria-label','Quitar filtro '+chip.label);
  btn.textContent='×';
  btn.addEventListener('click',chip.clear);
  el.append(btn);
  host.append(el);
 }
}
function zoom(factor){cancelViewAnim();const b=svg.viewBox.baseVal,w=b.width*factor;if(w<35||w>1800)return;svg.setAttribute('viewBox',[b.x+b.width*(1-factor)/2,b.y+b.height*(1-factor)/2,w,b.height*factor].join(' '));}
function syncLotUrl(lot){
 try{
  const url=new URL(location.href);
  url.searchParams.set('lote',lot.id);
  history.replaceState(null,'',url);
  sessionStorage.setItem('terra_selected_lot',lot.id);
 }catch(e){}
}
function trackAnalytics(event,params){
 const payload=Object.assign({event_source:'terra_estado'},params||{});
 if(typeof window.gtag==='function')window.gtag('event',event,payload);
}
$('#mas').addEventListener('click',()=>zoom(.8));
$('#menos').addEventListener('click',()=>zoom(1.25));
function showAll(){const items=lots.filter(matches);if(!items.length)return;animateView(box(items,18));}
$('#ajustar').addEventListener('click',showAll);
const generalBtn=$('#vista-general');
if(generalBtn)generalBtn.addEventListener('click',showAll);
function setProjection(mode){
 const stage=document.querySelector('.map-stage');
 if(!stage)return;
 const next=mode==='2d'?'2d':'3d';
 stage.dataset.view=next;
 const b3=$('#vista-3d'),b2=$('#vista-2d');
 if(b3){b3.classList.toggle('active',next==='3d');b3.setAttribute('aria-pressed',String(next==='3d'));}
 if(b2){b2.classList.toggle('active',next==='2d');b2.setAttribute('aria-pressed',String(next==='2d'));}
}
const reduceMotion=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
setProjection(reduceMotion?'2d':'3d');
const view3d=$('#vista-3d'),view2d=$('#vista-2d');
if(view3d)view3d.addEventListener('click',()=>setProjection('3d'));
if(view2d)view2d.addEventListener('click',()=>setProjection('2d'));
$('#cerrar').addEventListener('click',()=>{$('#seleccion').hidden=true;document.querySelectorAll('.selected').forEach(el=>el.classList.remove('selected'));chosen='';});
document.querySelectorAll('[data-block]').forEach(b=>b.addEventListener('click',()=>setBlock(b.dataset.block)));
$('#buscar').addEventListener('input',e=>{
 const query=e.target.value.trim().toUpperCase().replace(/\s/g,'');
 const found=lots.find(p=>p.id===query||p.id===query.replace(/^([A-F])-?(\d)$/,'$1-0$2'));
 if(found){block=found.manzana;estado='';areaKey='';const st=$('#filtro-estado'),ar=$('#filtro-area');if(st)st.value='';if(ar)ar.value='';applyFilters(true);highlight(found);syncLotUrl(found);focusLot(found);}
 else if(!query)setBlock('');
});
const estadoSel=$('#filtro-estado');
if(estadoSel)estadoSel.addEventListener('change',e=>{estado=e.target.value;applyFilters(false);});
const areaSel=$('#filtro-area');
if(areaSel)areaSel.addEventListener('change',e=>{areaKey=e.target.value;applyFilters(false);});
const clearBtn=$('#limpiar-filtros');
if(clearBtn)clearBtn.addEventListener('click',()=>{block='';estado='';areaKey='';const st=$('#filtro-estado'),ar=$('#filtro-area'),search=$('#buscar');if(st)st.value='';if(ar)ar.value='';if(search)search.value='';applyFilters(false);});
const quoteLink=$('#cotizar-lote');
if(quoteLink)quoteLink.addEventListener('click',()=>{if(quoteLink.getAttribute('aria-disabled')==='true')return;trackAnalytics('whatsapp_click',{lot_id:chosen,location:'visor'});});
const webLink=$('#cotizar-web');
if(webLink)webLink.addEventListener('click',()=>{trackAnalytics('view_quote',{lot_id:chosen,location:'visor'});});
const pointers=new Map();
let pinch=null;
svg.addEventListener('pointerdown',e=>{
 pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pointers.size>=2){
  cancelViewAnim();drag=null;
  for(const id of pointers.keys()){try{svg.setPointerCapture(id);}catch(err){}}
  const pts=[...pointers.values()];
  pinch={dist:Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y)||1,box:readBox()};
  return;
 }
 if(e.target.closest('polygon'))return;
 cancelViewAnim();
 drag={x:e.clientX,y:e.clientY,left:svg.viewBox.baseVal.x,top:svg.viewBox.baseVal.y,id:e.pointerId,captured:false};
});
svg.addEventListener('pointermove',e=>{
 if(!pointers.has(e.pointerId))return;
 pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pinch&&pointers.size>=2){
  const pts=[...pointers.values()];
  const dist=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y)||1;
  const w=Math.min(1800,Math.max(35,pinch.box.w*(pinch.dist/dist)));
  const h=pinch.box.h*(w/pinch.box.w);
  const cx=pinch.box.x+pinch.box.w/2,cy=pinch.box.y+pinch.box.h/2;
  writeBox(cx-w/2,cy-h/2,w,h);
  return;
 }
 if(!drag||e.pointerId!==drag.id)return;
 if(!drag.captured&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>3){drag.captured=true;try{svg.setPointerCapture(e.pointerId);}catch(err){}}
 const m=svg.getScreenCTM();if(!m)return;svg.viewBox.baseVal.x=drag.left-(e.clientX-drag.x)/m.a;svg.viewBox.baseVal.y=drag.top-(e.clientY-drag.y)/m.d;
});
function endPointer(e){pointers.delete(e.pointerId);if(pointers.size<2)pinch=null;if(!pointers.size)drag=null;}
svg.addEventListener('pointerup',endPointer);svg.addEventListener('pointercancel',endPointer);
for(const[state,color]of Object.entries(COLORS)){const el=document.createElement('span'),dot=document.createElement('i');dot.style.background=color;el.append(dot,document.createTextNode(state));$('#leyenda').append(el);}
function fillSelect(sel,values,current){
 if(!sel)return;
 const keep=sel.value;
 sel.replaceChildren();
 const all=document.createElement('option');all.value='';all.textContent=sel.id==='filtro-area'?'Todas':'Todos';sel.append(all);
 for(const value of values){
  const opt=document.createElement('option');
  opt.value=String(value);
  opt.textContent=sel.id==='filtro-area'?number(value)+' m²':value;
  sel.append(opt);
 }
 sel.value=current||keep||'';
}
function updateStats(){
 const summary={disponibles:0,separados:0,no_disponibles:0};
 for(const lot of lots){
  if(lot.estado==='Disponible')summary.disponibles+=1;
  else if(lot.estado==='Reservado'||lot.estado==='En negociación')summary.separados+=1;
  else summary.no_disponibles+=1;
 }
 const d=$('#stat-disponibles'),s=$('#stat-separados'),n=$('#stat-no-disponibles');
 if(d)d.textContent=String(summary.disponibles);
 if(s)s.textContent=String(summary.separados);
 if(n)n.textContent=String(summary.no_disponibles);
}
function selectFromQuery(){
 if(queryApplied)return;
 const raw=new URLSearchParams(location.search).get('lote')||'';
 const id=raw.trim().toUpperCase().replace(/\s/g,'');
 if(!id)return;
 const found=lots.find(p=>p.id===id||p.id===id.replace(/^([A-F])-?(\d)$/,'$1-0$2'));
 if(!found)return;
 queryApplied=true;
 block=found.manzana;
 applyFilters(true);
 highlight(found);
 focusLot(found);
}
function trackLotInteraction(lot){
 if(typeof window.clarity==='function'){
  window.clarity('event','terra_lote_seleccionado');
  window.clarity('set','terra_manzana',lot.manzana);
  window.clarity('set','terra_lote',lot.id);
 }
 if(typeof window.gtag==='function')window.gtag('event','select_lot',{lot_id:lot.id,manzana:lot.manzana,item_status:lot.estado});
}
function draw(data){
 if(!Array.isArray(data.lotes)||data.lotes.length!==104)throw Error('Datos inválidos');
 const previous=chosen;lots=data.lotes;
 for(const group of ['#suelo','#formas','#etiquetas','#titulos']){const g=$(group);if(g)g.replaceChildren();}
 const ground=box(lots,26);
 $('#suelo').append(node('rect',{x:ground[0],y:ground[1],width:ground[2],height:ground[3]}));
 for(const p of lots){const polygon=node('polygon',{id:'lote-'+p.id,points:p.puntos.map(v=>v.join(',')).join(' '),fill:COLORS[p.estado],'data-block':p.manzana,tabindex:'0',role:'button','aria-label':`Lote ${p.id}, ${p.estado}`});polygon.append(node('title',{},`Lote ${p.id} · ${p.estado} · ${number(p.medidas.area_m2)} m²`));polygon.addEventListener('click',()=>{trackLotInteraction(p);highlight(p);syncLotUrl(p);focusLot(p);});polygon.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();trackLotInteraction(p);highlight(p);syncLotUrl(p);focusLot(p);}});$('#formas').append(polygon);$('#etiquetas').append(node('text',{x:p.centro[0],y:p.centro[1],'data-block':p.manzana},p.id));}
 for(const b of 'ABCDEF'){const bounds=box(lots.filter(p=>p.manzana===b),0);$('#titulos').append(node('text',{x:bounds[0]+2,y:bounds[1]-7},'Manzana '+b));}
 fillSelect($('#filtro-estado'),[...new Set(lots.map(p=>p.estado))],estado);
 fillSelect($('#filtro-area'),[...new Set(lots.map(p=>p.medidas&&p.medidas.area_m2).filter(v=>v!=null))].sort((a,b)=>a-b),areaKey);
 updateStats();
 applyFilters(true);
 if(previous){const lot=lots.find(l=>l.id===previous);if(lot)highlight(lot);}
 else selectFromQuery();
 $('#fecha').textContent='Fuente actualizada '+new Date(data.actualizado).toLocaleString('es-CO',{timeZone:'America/Bogota'});
 $('#carga').hidden=true;
}
let requesting=false,firstLoad=true;
async function refresh(){
 if(requesting)return;requesting=true;
 try{const r=await fetch('/api/terra-estado',{cache:'no-store',signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error();const data=await r.json();draw(data);if(firstLoad){fit(lots.filter(matches));firstLoad=false;}}
 catch{if(firstLoad){$('#carga').hidden=false;$('#carga').textContent='La disponibilidad no está disponible en este momento. Volveremos a intentarlo automáticamente.';}else{$('#fecha').textContent='No se pudo actualizar. Se muestra la última consulta; confirma la disponibilidad antes de reservar.';}}
 finally{requesting=false;}
}
refresh();setInterval(refresh,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
