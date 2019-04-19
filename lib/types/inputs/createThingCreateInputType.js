const createThingCreateInputType=a=>{const{duplexFields:b,isEmbedded:c,embeddedFields:d,relationalFields:e,textFields:f,name:g}=a,h=[`input ${g}CreateInput {`];f&&f.reduce((a,{array:b,name:c,required:d})=>(a.push(`  ${c}: ${b?"[":""}String${b?"!]!":""}${!b&&d?"!":""}`),a),h),e&&e.reduce((a,{array:b,name:c,required:d,config:{name:e}})=>(a.push(`  ${c}: ${e}${b?"CreateChildrenInput":"CreateChildInput"}${d?"!":""}`),a),h),b&&b.reduce((a,{array:b,name:c,required:d,config:{name:e}})=>(a.push(`  ${c}: ${e}${b?"CreateChildrenInput":"CreateChildInput"}${d?"!":""}`),a),h),d&&d.reduce((a,{array:b,name:c,required:d,config:{name:e}})=>(a.push(`  ${c}: ${b?"[":""}${e}CreateInput${b?"!]!":""}${!b&&d?"!":""}`),a),h),h.push("}"),c||h.push(`input ${g}CreateChildInput {
  connect: ID
  create: ${g}CreateInput
}
input ${g}CreateChildrenInput {
  connect: [ID!]
  create: [${g}CreateInput!]
}`);const i=h.join("\n");return i};module.exports=createThingCreateInputType;