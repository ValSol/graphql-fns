const createThingWhereOneInputType=a=>{const{name:b}=a,c=[{fieldTypeName:"textFields",gqlType:"ID"},{fieldTypeName:"intFields",gqlType:"Int"},{fieldTypeName:"floatFields",gqlType:"Float"},{fieldTypeName:"dateTimeFields",gqlType:"DateTime"}].reduce((b,{fieldTypeName:c,gqlType:d})=>(a[c]&&a[c].filter(({unique:a})=>a).forEach(({name:a})=>b.push(`  ${a}: ${d}`)),b),[]),d=c.join("\n");return d?`input ${b}WhereOneInput {
  id: ID
${d}
}`:`input ${b}WhereOneInput {
  id: ID!
}`};module.exports=createThingWhereOneInputType;