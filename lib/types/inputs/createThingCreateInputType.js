const createThingCreateInputType=a=>{const{isEmbedded:b,embeddedFields:c,relationalFields:d,textFields:e,name:f}=a,g=[`input ${f}CreateInput {`];e&&e.reduce((a,{array:b,name:c,required:d})=>(a.push(`  ${c}: ${b?"[":""}String${b?"!]!":""}${!b&&d?"!":""}`),a),g),d&&d.reduce((a,{array:b,name:c,required:d,thingName:e})=>(a.push(`  ${c}: ${e}${b?"CreateChildrenInput":"CreateChildInput"}${d?"!":""}`),a),g),c&&c.reduce((a,{array:b,name:c,required:d,config:{name:e}})=>(a.push(`  ${c}: ${b?"[":""}${e}CreateInput${b?"!]!":""}${!b&&d?"!":""}`),a),g),g.push("}"),b||g.push(`input ${f}CreateChildInput {
  connect: ID
  create: ${f}CreateInput
}
input ${f}CreateChildrenInput {
  connect: [ID!]
  create: [${f}CreateInput!]
}`);const h=g.join("\n");return h};module.exports=createThingCreateInputType;