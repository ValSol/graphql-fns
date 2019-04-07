const createThingType=require("./createThingType"),createThingCreateInputType=require("./createThingCreateInputType"),createCreateThingMutationType=require("./mutations/createCreateThingMutationType"),composeGqlTypes=a=>{const b=a.map(a=>createThingType(a)).join("\n"),c=a.map(a=>createThingCreateInputType(a)).join("\n"),d=a.map(a=>createCreateThingMutationType(a)).join("\n");return`scalar DateTime
${b}
${c}
type Mutation {
${d}
}`};module.exports=composeGqlTypes;