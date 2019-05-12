const createUpdatedThingPayloadType=a=>{const{booleanFields:b,duplexFields:c,embeddedFields:d,enumFields:e,geospatialFields:f,relationalFields:g,name:h}=a,i=["textFields","intFields","floatFields","dateTimeFields"].reduce((b,c)=>(a[c]&&a[c].forEach(({name:a})=>b.push(`  ${a}`)),b),[]);b&&b.reduce((a,{name:b})=>(a.push(`  ${b}`),a),i),c&&c.reduce((a,{name:b})=>(a.push(`  ${b}`),a),i),d&&d.reduce((a,{name:b})=>(a.push(`  ${b}`),a),i),e&&e.reduce((a,{name:b})=>(a.push(`  ${b}`),a),i),f&&f.reduce((a,{name:b})=>(a.push(`  ${b}`),a),i),g&&g.reduce((a,{name:b})=>(a.push(`  ${b}`),a),i);const j=`enum ${h}FieldNamesEnumeration {
${i.join("\n")}
}
type Updated${h}Payload {
  node: ${h}
  previousNode: ${h}
  updatedFields: [${h}FieldNamesEnumeration!]
}`;return j};module.exports=createUpdatedThingPayloadType;