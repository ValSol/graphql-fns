//  turn off flow to eliminate errors in flowTypes.js
const composeWhereFields=a=>{const b=Object.keys(a).reduce((b,c)=>("Fields"===c.slice(-6)&&Array.isArray(a[c])&&a[c].forEach(({name:a,index:d})=>{d&&(b[a]=c)}),b),{});return b};module.exports=composeWhereFields;