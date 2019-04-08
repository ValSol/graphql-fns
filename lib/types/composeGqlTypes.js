const createThingType=require("./createThingType"),createThingCreateInputType=require("./inputs/createThingCreateInputType"),createThingWhereInputType=require("./inputs/createThingWhereInputType"),createThingQueryType=require("./queries/createThingQueryType"),createCreateThingMutationType=require("./mutations/createCreateThingMutationType"),composeGqlTypes=a=>{const b=a.map(a=>createThingType(a)).join("\n"),c=a.map(a=>`${createThingCreateInputType(a)}
${createThingWhereInputType(a)}`).join("\n"),d=a.map(a=>createThingQueryType(a)).join("\n"),e=a.map(a=>createCreateThingMutationType(a)).join("\n");return`scalar DateTime
${b}
${c}
type Query {
${d}
}
type Mutation {
${e}
}`};module.exports=composeGqlTypes;