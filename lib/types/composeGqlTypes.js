const createThingType=require("./createThingType"),createThingCreateInputType=require("./inputs/createThingCreateInputType"),createThingUpdateInputType=require("./inputs/createThingUpdateInputType"),createThingWhereInputType=require("./inputs/createThingWhereInputType"),createThingQueryType=require("./queries/createThingQueryType"),createCreateThingMutationType=require("./mutations/createCreateThingMutationType"),createUpdateThingMutationType=require("./mutations/createUpdateThingMutationType"),createDeleteThingMutationType=require("./mutations/createDeleteThingMutationType"),composeGqlTypes=a=>{const b=a.map(a=>createThingType(a)).join("\n"),c=a.map(a=>`${createThingCreateInputType(a)}
${createThingUpdateInputType(a)}
${createThingWhereInputType(a)}`).join("\n"),d=a.filter(({isEmbedded:a})=>!a).map(a=>createThingQueryType(a)).join("\n"),e=a.filter(({isEmbedded:a})=>!a).map(a=>`${createCreateThingMutationType(a)}
${createUpdateThingMutationType(a)}
${createDeleteThingMutationType(a)}`).join("\n");return`scalar DateTime
${b}
${c}
type Query {
${d}
}
type Mutation {
${e}
}`};module.exports=composeGqlTypes;