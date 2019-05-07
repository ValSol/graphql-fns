const createThingCreateInputType=a=>{const{duplexFields:b,isEmbedded:c,embeddedFields:d,enumFields:e,geospatialFields:f,relationalFields:g,textFields:h,name:i}=a,j=[`input ${i}CreateInput {`];h&&h.reduce((a,{array:b,name:c,required:d})=>(a.push(`  ${c}: ${b?"[":""}String${b?"!]":""}${d?"!":""}`),a),j),e&&e.reduce((a,{array:b,enumName:c,name:d,required:e})=>(a.push(`  ${d}: ${b?"[":""}${c}Enumeration${b?"!]":""}${e?"!":""}`),a),j),g&&g.reduce((a,{array:b,name:c,required:d,config:{name:e}})=>(a.push(`  ${c}: ${e}${b?"CreateChildrenInput":"CreateChildInput"}${d?"!":""}`),a),j),b&&b.reduce((a,{array:b,name:c,required:d,config:{name:e}})=>(a.push(`  ${c}: ${e}${b?"CreateChildrenInput":"CreateChildInput"}${d?"!":""}`),a),j),d&&d.reduce((a,{array:b,name:c,required:d,config:{name:e}})=>(a.push(`  ${c}: ${b?"[":""}${e}CreateInput${b?"!]":""}${d?"!":""}`),a),j),f&&f.reduce((a,{array:b,name:c,type:d,required:e})=>(a.push(`  ${c}: ${b?"[":""}Geospatial${d}Input${b?"!]":""}${e?"!":""}`),a),j),j.push("}"),c||j.push(`input ${i}CreateChildInput {
  connect: ID
  create: ${i}CreateInput
}
input ${i}CreateChildrenInput {
  connect: [ID!]
  create: [${i}CreateInput!]
}`);const k=j.join("\n");return k};module.exports=createThingCreateInputType;