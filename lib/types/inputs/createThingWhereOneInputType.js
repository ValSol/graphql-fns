const createThingWhereOneInputType=a=>{const{name:b,textFields:c}=a,d=c?c.filter(({unique:a})=>a).map(({name:a})=>`  ${a}: ID`).join("\n"):"";return d?`input ${b}WhereOneInput {
  id: ID
${d}
}`:`input ${b}WhereOneInput {
  id: ID!
}`};module.exports=createThingWhereOneInputType;