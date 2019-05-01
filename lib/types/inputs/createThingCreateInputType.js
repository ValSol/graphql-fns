const createThingCreateInputType=a=>{const{duplexFields:b,isEmbedded:c,embeddedFields:d,geospatialFields:e,relationalFields:f,textFields:g,name:h}=a,i=[`input ${h}CreateInput {`];g&&g.reduce((a,{array:b,name:c,required:d})=>(a.push(`  ${c}: ${b?"[":""}String${b?"!]!":""}${!b&&d?"!":""}`),a),i),f&&f.reduce((a,{array:b,name:c,required:d,config:{name:e}})=>(a.push(`  ${c}: ${e}${b?"CreateChildrenInput":"CreateChildInput"}${d?"!":""}`),a),i),b&&b.reduce((a,{array:b,name:c,required:d,config:{name:e}})=>(a.push(`  ${c}: ${e}${b?"CreateChildrenInput":"CreateChildInput"}${d?"!":""}`),a),i),d&&d.reduce((a,{array:b,name:c,required:d,config:{name:e}})=>(a.push(`  ${c}: ${b?"[":""}${e}CreateInput${b?"!]!":""}${!b&&d?"!":""}`),a),i),e&&e.reduce((a,{array:b,name:c,type:d,required:e})=>(a.push(`  ${c}: ${b?"[":""}Geospatial${d}Input${b?"!]!":""}${!b&&e?"!":""}`),a),i),i.push("}"),c||i.push(`input ${h}CreateChildInput {
  connect: ID
  create: ${h}CreateInput
}
input ${h}CreateChildrenInput {
  connect: [ID!]
  create: [${h}CreateInput!]
}`);const j=i.join("\n");return j};module.exports=createThingCreateInputType;