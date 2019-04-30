const createThingWhereInputType=a=>{const{name:b,duplexFields:c,relationalFields:d,textFields:e}=a,f=e?e.filter(({index:a})=>a).map(({name:a})=>`  ${a}: String`):[];d&&d.filter(({index:a})=>a).reduce((a,{name:b})=>(a.push(`  ${b}: ID`),a),f),c&&c.filter(({index:a})=>a).reduce((a,{name:b})=>(a.push(`  ${b}: ID`),a),f);const g=f.length?`
input ${b}WhereInput {
${f.join("\n")}
}`:"";return g};module.exports=createThingWhereInputType;