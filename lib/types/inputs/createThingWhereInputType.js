const createThingWhereInputType=a=>{const{name:b,enumFields:c,duplexFields:d,relationalFields:e,textFields:f}=a,g=f?f.filter(({index:a})=>a).map(({name:a})=>`  ${a}: String`):[];c&&c.filter(({index:a})=>a).reduce((a,{enumName:b,name:c})=>(a.push(`  ${c}: ${b}Enumeration`),a),g),e&&e.filter(({index:a})=>a).reduce((a,{name:b})=>(a.push(`  ${b}: ID`),a),g),d&&d.filter(({index:a})=>a).reduce((a,{name:b})=>(a.push(`  ${b}: ID`),a),g);const h=g.length?`
input ${b}WhereInput {
${g.join("\n")}
}`:"";return h};module.exports=createThingWhereInputType;