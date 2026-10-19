const {test}=require('node:test');const assert=require('node:assert/strict');const handler=require('../api/terra-estado.cjs');
function response(){return{headers:{},setHeader(k,v){this.headers[k]=v;},status(s){this.code=s;return this;},json(body){this.body=body;return this;}};}
test('API devuelve 503 sin configuración y no expone secretos',async()=>{const r=response();await handler({method:'GET'},r);assert.equal(r.code,503);assert.deepEqual(Object.keys(r.body),['error']);assert.equal(r.headers['Cache-Control'],'no-store');});
test('API de solo lectura rechaza escrituras',async()=>{const r=response();await handler({method:'POST'},r);assert.equal(r.code,405);assert.equal(r.headers.Allow,'GET');});
