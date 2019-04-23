const{Types}=require("mongoose"),transformInputData=(a,b,// use mongoose Types in args to let mocking the ObjectId() in tests
c=Types)=>{const d=new Map,e=new Map,f=[{data:{...a,_id:c.ObjectId()},config:b}],g=(a,b)=>{const{duplexFields:e,embeddedFields:h,relationalFields:i,textFields:j}=b,k={};i&&i.reduce((a,{name:b,array:c,config:d})=>(a[b]={array:c,config:d},a),k);const l={};e&&e.reduce((a,{name:b,oppositeName:c,array:d,config:e})=>{if(!e.duplexFields)throw new TypeError("Expected a duplexFields in config!");const f=e.duplexFields.find(({name:a})=>a===c);if(!f)throw new TypeError(`Expected a duplexField with name "${c}"!`);const{array:g,config:h}=f;// eslint-disable-next-line
return a[b]={array:d,config:e,oppositeArray:g,oppositeConfig:h,oppositeName:c},a},l);const m={};h&&h.reduce((a,{name:b,config:c})=>(a[b]=c,a),m);const n=["_id"];return j&&j.reduce((a,{name:b})=>(a.push(b),a),n),Object.keys(a).reduce((b,e)=>{if(k[e]){const{array:d,config:g}=k[e];if(!d&&a[e].create&&a[e].connect)throw new TypeError(`Simultaneous use "create" and "connect" keys with a relationalField "${e}" that not an array!`);if(a[e].connect&&(b[e]=a[e].connect),a[e].create)if(d){const d=a[e].connect||[];a[e].create.forEach(a=>{// eslint-disable-next-line no-underscore-dangle
const b=c.ObjectId();d.push(b),f.push({data:{...a,_id:b},config:g})}),b[e]=d}else{// eslint-disable-next-line no-underscore-dangle
const d=c.ObjectId();f.push({data:{...a[e].create,_id:d},config:g}),b[e]=d}}else if(l[e]){const{array:g,config:h,oppositeArray:i,oppositeName:j}=l[e];if(!g&&a[e].create&&a[e].connect)throw new TypeError(`Simultaneous use "create" and "connect" keys with a duplexField "${e}" that not an array!`);if(a[e].connect)if(g){const{connect:c}=a[e];// eslint-disable-next-line no-param-reassign
b[e]=c,c.forEach(b=>{const c={updateOne:{filter:{_id:b},update:i?// eslint-disable-next-line no-underscore-dangle
{$push:{[j]:a._id}}:// TODO set remove id value for previous array
// eslint-disable-next-line no-underscore-dangle
{[j]:a._id}}};d.get(h)?d.get(h).push(c):d.set(h,[c])})}else{const{connect:c}=a[e];// eslint-disable-next-line no-param-reassign
b[e]=c;const f={updateOne:{filter:{_id:c},update:i?// eslint-disable-next-line no-underscore-dangle
{$push:{[j]:a._id}}:// TODO set null for previous value
// eslint-disable-next-line no-underscore-dangle
{[j]:a._id}}};d.get(h)?d.get(h).push(f):d.set(h,[f])}if(a[e].create)if(g){const d=a[e].connect||[];a[e].create.forEach(b=>{// eslint-disable-next-line no-underscore-dangle
const e=c.ObjectId();d.push(e),f.push({data:{...b,_id:e,// eslint-disable-next-line no-underscore-dangle
[j]:i?[a._id]:a._id},config:h})}),b[e]=d}else{// eslint-disable-next-line no-underscore-dangle
const d=c.ObjectId();f.push({data:{...a[e].create,_id:d,// eslint-disable-next-line no-underscore-dangle
[j]:i?[a._id]:a._id},config:l[e].config}),b[e]=d}a[e].connect||a[e].create||!a[e]||(b[e]=a[e])}else m[e]?// eslint-disable-next-line no-param-reassign
b[e]=g(a[e],m[e]):n.includes(e)&&(// eslint-disable-next-line no-param-reassign
b[e]=a[e]);return b},{})};let h=null;for(;f.length;){const{data:a,config:b}=f.shift(),c=g(a,b);h||(h=c);const e={insertOne:{document:c}};d.get(b)?d.get(b).push(e):d.set(b,[e])}let i=!1;if(1===d.size){const a=d.keys().next().value;if(!a)throw new TypeError("Expected an config object as key of \"core\" Map");const b=d.get(a);if(!b)throw new TypeError("Expected an array as value of \"core\" Map");1===b.length&&(i=!0)}return{core:d,periphery:e,single:i,first:h}};module.exports=transformInputData;