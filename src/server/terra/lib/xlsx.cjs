'use strict';
const {unzipSync,strFromU8}=require('fflate');
const {XMLParser}=require('fast-xml-parser');
const path=require('node:path').posix;
const parser=new XMLParser({ignoreAttributes:false,attributeNamePrefix:'@',removeNSPrefix:true,parseTagValue:false,parseAttributeValue:false,processEntities:true,htmlEntities:false});
const array=x=>x===undefined?[]:Array.isArray(x)?x:[x];
function text(x){if(typeof x==='string')return x;if(!x)return '';if('#text'in x)return String(x['#text']);return text(x.t)+array(x.r).map(text).join('');}
function workbookRows(buffer){
 let total=0;
 const zip=unzipSync(new Uint8Array(buffer),{filter(file){total+=file.originalSize;if(file.originalSize>8*1024*1024||total>20*1024*1024)throw Error('Archivo demasiado grande');return true;}});
 function xml(name){if(!zip[name])throw Error('Parte XLSX ausente');const data=strFromU8(zip[name]);if(/<!DOCTYPE|<!ENTITY/i.test(data))throw Error('XML no admitido');return parser.parse(data);}
 const book=xml('xl/workbook.xml').workbook;
 const rels=array(xml('xl/_rels/workbook.xml.rels').Relationships.Relationship);
 const strings=zip['xl/sharedStrings.xml']?array(xml('xl/sharedStrings.xml').sst.si).map(text):[];
 return function sheet(name,headerKey){
  const sheet=array(book.sheets.sheet).find(s=>s['@name']===name);if(!sheet)throw Error('Falta hoja');
  const rel=rels.find(r=>r['@Id']===sheet['@id']);if(!rel||rel['@TargetMode']==='External')throw Error('Relación inválida');
  const target=rel['@Target'];const file=target.startsWith('/')?target.slice(1):path.normalize('xl/'+target);
  let headers;const result=[];
  for(const row of array(xml(file).worksheet.sheetData.row)){
   const cells={};
   for(const c of array(row.c)){const col=c['@r'].replace(/\d/g,'');let v=c.v??null;const kind=c['@t'];if(kind==='s')v=strings[Number(v)];else if(kind==='inlineStr')v=text(c.is);else if(kind==='e')throw Error('Error en celda');else if(v!==null&&kind!=='str'&&kind!=='b'){v=Number(v);if(!Number.isFinite(v))throw Error('Número inválido');}cells[col]=v;}
   if(!headers){if(cells.A===headerKey)headers=cells;continue;}
   if(!Object.values(cells).some(v=>v!==null&&v!==''))continue;
   const r={};for(const[col,key]of Object.entries(headers))if(key)r[key]=cells[col]??null;result.push(r);
  }
  if(!headers)throw Error('Faltan encabezados');return result;
 };
}
module.exports={workbookRows};
