const transformInputData=(a,b)=>{const{embeddedFields:c,relationalFields:d}=b;let e=[];d&&(e=d.map(({name:a})=>a));const f={};c&&c.reduce((a,{name:b,config:c})=>(a[b]=c,a),f);const g=Object.keys(a).reduce((b,c)=>(b[c]=e.includes(c)?a[c].connect:f[c]?transformInputData(a[c],f[c]):a[c],b),{});return g};module.exports=transformInputData;