'use strict';
const {workbookRows}=require('./xlsx.cjs');
const geometry=require('./geometria.json');
const states=new Set(['Disponible','Reservado','En negociación','Vendido','No disponible']);
function positive(v){if(typeof v!=='number'||!Number.isFinite(v)||v<=0)throw Error('Medida inválida');return v;}
async function readPublicWorkbook(buffer){
 const readSheet=workbookRows(buffer);
 const lots=readSheet('Lotes','ID');
 const types=readSheet('Tipos de area','MANZANA').filter(r=>/^[A-F]$/.test(r.MANZANA));
 const catalog=new Map(),counts=new Map();
 for(const r of types){const m=String(r.TIPO).match(/^\s*(\d+(?:\.\d+)?)\s*M\s*X\s*(\d+(?:\.\d+)?)\s*M\s*$/i);if(!m)throw Error('Tipo inválido');const a=positive(Number(m[1])),b=positive(Number(m[2])),area=positive(r.AREA_M2),n=positive(r.CANTIDAD);if(!Number.isInteger(n))throw Error('Cantidad inválida');const key=[r.MANZANA,a,b].join(':');if(counts.has(key))throw Error('Tipo repetido');counts.set(key,n);if(!catalog.has(r.MANZANA))catalog.set(r.MANZANA,[]);catalog.get(r.MANZANA).push({lado_a_m:a,lado_b_m:b,area_m2:area});}
 for(const [block,t]of catalog){if(t.length!==(block==='F'?1:2))throw Error('Tipología requiere revisión');t.sort((a,b)=>a.lado_a_m-b.lado_a_m);}
 if(lots.length!==104)throw Error('Se requieren 104 lotes');
 const originals=new Map(geometry.map(g=>['ET01-'+g.id,g])),seen=new Set();
 const result=lots.map(r=>{
  const g=originals.get(r.ID);if(!g||seen.has(r.ID)||g.manzana!==r.Manzana||Number(g.lote)!==Number(r.Lote))throw Error('Vínculo de lote inválido');seen.add(r.ID);
  if(!states.has(r.Estado))throw Error('Estado inválido');
  // El vínculo físico procede del catálogo de geometría validado; nunca de datos públicos editables.
  const t=catalog.get(g.manzana);if(!t)throw Error('Falta tipo');const n=Number(g.lote),special=(g.manzana==='C'?[6,7]:[1,2,23,24]).includes(n);const size={...t[special?t.length-1:0]};
  const key=[g.manzana,size.lado_a_m,size.lado_b_m].join(':');counts.set(key,counts.get(key)-1);
  if(r.Area_m2!==null&&r.Area_m2!==undefined&&r.Area_m2!=='')size.area_m2=positive(r.Area_m2);
  size.fuente='Excel';return {...g,estado:r.Estado,medidas:size};
 });
 if([...counts.values()].some(n=>n!==0))throw Error('Cantidades de tipos no coinciden');
 return result;
}
module.exports={readPublicWorkbook};
