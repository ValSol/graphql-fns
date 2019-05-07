const createThingSortInputType=a=>{const{name:b}=a,c=["textFields","enumFields"].reduce((b,c)=>{const d=a[c]?a[c].filter(({array:a,index:b})=>!a&&b).map(({name:a})=>`  ${a}_ASC
  ${a}_DESC`):[];return[...b,...d]},[]);return c.length?`
enum ${b}SortEnumeration {
${c.join("\n")}
}
input ${b}SortInput {
  sortBy: [${b}SortEnumeration]
}`:""};module.exports=createThingSortInputType;