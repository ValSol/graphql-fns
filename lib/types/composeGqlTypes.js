const createThingType=require("./createThingType"),createThingInputType=require("./createThingInputType"),createAddThingMutationType=require("./createAddThingMutationType"),composeGqlTypes=a=>{const b=a.map(a=>createThingType(a)).join("\n"),c=a.map(a=>createThingInputType(a)).join("\n"),d=a.map(a=>createAddThingMutationType(a)).join("\n");return`${b}
${c}
type Mutation {
${d}
}`};module.exports=composeGqlTypes;