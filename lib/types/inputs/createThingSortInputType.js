const createThingSortInputType=a=>{const{enumFields:b,name:c}=a,d=b?b.filter(({array:a,index:b})=>!a&&b).map(({name:a})=>`  ${a}_ASC
  ${a}_DESC`):[];return["textFields"].reduce((b,c)=>{const d=a[c]?a[c].filter(({array:a,index:b})=>!a&&b).map(({name:a})=>`  ${a}_ASC
  ${a}_DESC`):[];// eslint-disable-line prefer-spread
return b.push.apply(b,d),b},d),d.length?`
enum ${c}SortEnumeration {
${d.join("\n")}
}
input ${c}SortInput {
  sortBy: [${c}SortEnumeration]
}`:""};module.exports=createThingSortInputType;