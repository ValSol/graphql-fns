const createThingCreateInputType=a=>{const{duplexFields:b,embedded:c,embeddedFields:d,enumFields:e,geospatialFields:f,relationalFields:g,name:h}=a,i=[`input ${h}CreateInput {`];[{fieldTypeName:"textFields",gqlType:"String"},{fieldTypeName:"dateTimeFields",gqlType:"DateTime"}].reduce((b,{fieldTypeName:c,gqlType:d})=>(a[c]&&a[c].forEach(({array:a,name:c,required:e})=>b.push(`  ${c}: ${a?"[":""}${d}${a?"!]":""}${e?"!":""}`)),b),i),e&&e.reduce((a,{array:b,enumName:c,name:d,required:e})=>(a.push(`  ${d}: ${b?"[":""}${c}Enumeration${b?"!]":""}${e?"!":""}`),a),i),g&&g.reduce((a,{array:b,name:c,required:d,config:{name:e}})=>(a.push(`  ${c}: ${e}${b?"CreateChildrenInput":"CreateChildInput"}${d?"!":""}`),a),i),b&&b.reduce((a,{array:b,name:c,required:d,config:{name:e}})=>(a.push(`  ${c}: ${e}${b?"CreateChildrenInput":"CreateChildInput"}${d?"!":""}`),a),i),d&&d.reduce((a,{array:b,name:c,required:d,config:{name:e}})=>(a.push(`  ${c}: ${b?"[":""}${e}CreateInput${b?"!]":""}${d?"!":""}`),a),i),f&&f.reduce((a,{array:b,name:c,type:d,required:e})=>(a.push(`  ${c}: ${b?"[":""}Geospatial${d}Input${b?"!]":""}${e?"!":""}`),a),i),i.push("}"),c||i.push(`input ${h}CreateChildInput {
  connect: ID
  create: ${h}CreateInput
}
input ${h}CreateChildrenInput {
  connect: [ID!]
  create: [${h}CreateInput!]
}`);const j=i.join("\n");return j};module.exports=createThingCreateInputType;