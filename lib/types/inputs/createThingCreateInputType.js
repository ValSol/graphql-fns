const createThingCreateInputType=a=>{const{relationalFields:b,textFields:c,thingName:d}=a,e=[`input ${d}CreateInput {`];c&&c.reduce((a,{array:b,name:c,required:d})=>(a.push(`  ${c}: ${b?"[":""}String${b?"!]!":""}${!b&&d?"!":""}`),a),e),b&&b.reduce((a,{array:b,name:c,required:d,thingName:e})=>(a.push(`  ${c}: ${b?"[":""}${e}Create2Input${b?"!]!":""}${!b&&d?"!":""}`),a),e),e.push(`}
input ${d}Create2Input {
  connect: ID
  create: ${d}CreateInput
}`);const f=e.join("\n");return f};module.exports=createThingCreateInputType;