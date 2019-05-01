const createThingNearInputType=a=>{const{name:b,geospatialFields:c}=a,d=c?c.map(({name:a})=>`  ${a}: GeospatialPointInput`):[];return d.length?(d.push("  maxDistance: Float"),`
input ${b}NearInput {
${d.join("\n")}
}`):""};module.exports=createThingNearInputType;