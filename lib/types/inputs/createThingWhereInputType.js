const createThingWhereInputType=a=>{const{name:b,textFields:c}=a,d=c?c.filter(({index:a})=>a).map(({name:a})=>`  ${a}: String`).join("\n"):"";return d&&`
input ${b}WhereInput {
${d}
}`};module.exports=createThingWhereInputType;