const createThingSortInputType=a=>{const{booleanFields:b,enumFields:c,name:d}=a,e=c?c.filter(({array:a,index:b})=>!a&&b).map(({name:a})=>`  ${a}_ASC
  ${a}_DESC`):[];return["textFields","intFields","floatFields"].reduce((b,c)=>{const d=a[c]?a[c].filter(({array:a,index:b})=>!a&&b).map(({name:a})=>`  ${a}_ASC
  ${a}_DESC`):[];// eslint-disable-line prefer-spread
return b.push.apply(b,d),b},e),b&&b.filter(({array:a,index:b})=>!a&&b).reduce((a,{name:b})=>(a.push(`  ${b}_ASC
  ${b}_DESC`),a),e),e.length?`enum ${d}SortEnumeration {
${e.join("\n")}
}
input ${d}SortInput {
  sortBy: [${d}SortEnumeration]
}`:""};module.exports=createThingSortInputType;