const checkInventory=(a,b={})=>{const{include:c,exclude:d}=b;let e=0,f=c,g=d;for(;e<a.length;){if(f){const b=Array.isArray(f)?f:Object.keys(f);if(!b.includes(a[e]))return!1;e+1<a.length&&(f=f[a[e]])}if(g){const b=Array.isArray(g)?g:Object.keys(g);if(!b.includes(a[e]))g=null;else if(g=Array.isArray(g)?null:g[a[e]],null===g)return!1}e+=1}return!0};module.exports=checkInventory;