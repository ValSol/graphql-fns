const processDeleteData=(a,b)=>{// eslint-disable-next-line no-unused-vars
const{_id:c}=a,{duplexFields:d}=b,e=[];d&&d.reduce((a,{name:b,oppositeName:c,array:d,config:e})=>{if(!e.duplexFields)throw new TypeError("Expected a duplexFields in config!");const f=e.duplexFields.find(({name:a})=>a===c);if(!f)throw new TypeError(`Expected a duplexField with name "${c}"!`);const{array:g,config:h}=f;return a.push({array:d,config:e,name:b,oppositeArray:g,oppositeConfig:h,oppositeName:c}),a},e);const f=new Map;return e.forEach(({name:b,array:d,config:e,oppositeArray:g,oppositeName:h})=>{if(a[b])if(d)a[b].forEach(a=>{const b={updateOne:{filter:{_id:a},update:g?{$pull:{[h]:c}}:{$unset:{[h]:1}}}},d=f.get(e);d?d.push(b):f.set(e,[b])});else{const d=a[b],i={updateOne:{filter:{_id:d},update:g?{$pull:{[h]:c}}:{$unset:{[h]:1}}}},j=f.get(e);j?j.push(i):f.set(e,[i])}}),f};module.exports=processDeleteData;