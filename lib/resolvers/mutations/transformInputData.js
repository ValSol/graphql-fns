const{Types}=require("mongoose"),transformInputData=(a,b,// use mongoose Types in args to let mocking the ObjectId() in tests
c=Types)=>{const d=[],e=[{data:{...a,_id:c.ObjectId()},config:b}],f=(a,b)=>{const{duplexFields:d,embeddedFields:g,relationalFields:h}=b,i={};h&&h.reduce((a,{name:b,array:c,config:d})=>(a[b]={array:c,config:d},a),i);const j={};d&&d.reduce((a,{name:b,oppositeName:c,array:d,config:e})=>{if(!e.duplexFields)throw new TypeError("Expected a duplexFields in config!");const f=e.duplexFields.find(({name:a})=>a===c);if(!f)throw new TypeError(`Expected a duplexField with name "${c}"!`);const{array:g}=f;// eslint-disable-next-line
return a[b]={array:d,config:e,oppositeName:c,oppositeArray:g},a},j);const k={};return g&&g.reduce((a,{name:b,config:c})=>(a[b]=c,a),k),Object.keys(a).reduce((b,d)=>{if(i[d]){if(a[d].connect&&(b[d]=a[d].connect),a[d].create)if(i[d].array){const f=a[d].connect||[];a[d].create.forEach(a=>{// eslint-disable-next-line no-underscore-dangle
const b=c.ObjectId();f.push(b),e.push({data:{...a,_id:b},config:i[d].config})}),b[d]=f}else{// eslint-disable-next-line no-underscore-dangle
const f=c.ObjectId();e.push({data:{...a[d].create,_id:f},config:i[d].config}),b[d]=f}}else if(j[d]){const{array:f,config:g,oppositeArray:h,oppositeName:i}=j[d];if(a[d].connect&&(b[d]=a[d].connect),!a[d].create)a[d]&&(// eslint-disable-next-line no-param-reassign
b[d]=a[d]);else if(f){const f=a[d].connect||[];a[d].create.forEach(b=>{// eslint-disable-next-line no-underscore-dangle
const d=c.ObjectId();f.push(d),e.push({data:{...b,_id:d,// eslint-disable-next-line no-underscore-dangle
[i]:h?[a._id]:a._id},config:g})}),b[d]=f}else{// eslint-disable-next-line no-underscore-dangle
const f=c.ObjectId();e.push({data:{...a[d].create,_id:f,// eslint-disable-next-line no-underscore-dangle
[i]:h?[a._id]:a._id},config:j[d].config}),b[d]=f}}else b[d]=k[d]?// eslint-disable-next-line no-param-reassign
f(a[d],k[d]):// eslint-disable-next-line no-param-reassign
a[d];return b},{})};for(;e.length;){const{data:a,config:b}=e.shift();d.push({config:b,data:f(a,b)})}return d};module.exports=transformInputData;