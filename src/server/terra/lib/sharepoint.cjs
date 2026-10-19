'use strict';
const {readPublicWorkbook}=require('./excel.cjs');
const defaults=require('./sharepoint-config.json');
const GRAPH='https://graph.microsoft.com/v1.0';
let token,tokenUntil=0,snapshot,snapshotUntil=0,pending;
function config(){const names=['MS_TENANT_ID','MS_CLIENT_ID','MS_CLIENT_SECRET','SP_DRIVE_ID','SP_ITEM_ID'];const c={};for(const name of names){const value=process.env[name]||defaults[name];if(!value)throw Error('CONFIGURATION');c[name]=value;}return c;}
async function checked(url,options={}){const r=await fetch(url,{...options,signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('UPSTREAM_'+r.status);return r;}
async function accessToken(c){if(token&&Date.now()<tokenUntil)return token;const form=new URLSearchParams({client_id:c.MS_CLIENT_ID,client_secret:c.MS_CLIENT_SECRET,scope:'https://graph.microsoft.com/.default',grant_type:'client_credentials'});const r=await checked('https://login.microsoftonline.com/'+encodeURIComponent(c.MS_TENANT_ID)+'/oauth2/v2.0/token',{method:'POST',body:form});const data=await r.json();if(!data.access_token)throw Error('AUTH');token=data.access_token;tokenUntil=Date.now()+Math.max(0,Number(data.expires_in||3600)-120)*1000;return token;}
async function refresh(){
 const c=config(),auth=await accessToken(c);const base=GRAPH+'/drives/'+encodeURIComponent(c.SP_DRIVE_ID)+'/items/'+encodeURIComponent(c.SP_ITEM_ID);
 const meta=await checked(base+'?$select=id,name,size,lastModifiedDateTime,eTag,file',{headers:{Authorization:'Bearer '+auth}}).then(r=>r.json());
 if(!meta.file||!String(meta.name).toLowerCase().endsWith('.xlsx')||!Number.isFinite(meta.size)||meta.size>5*1024*1024)throw Error('INVALID_FILE');
 const r=await checked(base+'/content',{headers:{Authorization:'Bearer '+auth},redirect:'follow'});const buffer=Buffer.from(await r.arrayBuffer());if(buffer.length>5*1024*1024)throw Error('FILE_TOO_LARGE');
 const lots=await readPublicWorkbook(buffer);
 snapshot={actualizado:meta.lastModifiedDateTime,consultado:new Date().toISOString(),lotes:lots};snapshotUntil=Date.now()+30000;return snapshot;
}
async function publicData(){if(snapshot&&Date.now()<snapshotUntil)return snapshot;if(pending)return pending;pending=refresh();try{return await pending;}finally{pending=null;}}
module.exports={publicData};
