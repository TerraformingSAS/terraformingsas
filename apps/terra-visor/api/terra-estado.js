'use strict';
const {publicData}=require('../lib/sharepoint.cjs');
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Método no permitido.'});}
 try{return res.status(200).json(await publicData());}
 catch{return res.status(503).json({error:'No se pudo consultar la disponibilidad. Intenta de nuevo más tarde.'});}
};
