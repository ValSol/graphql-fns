const createThingType=require("./createThingType"),createThingCreateInputType=require("./inputs/createThingCreateInputType"),createThingPaginationInputType=require("./inputs/createThingPaginationInputType"),createThingUpdateInputType=require("./inputs/createThingUpdateInputType"),createThingNearInputType=require("./inputs/createThingNearInputType"),createThingSortInputType=require("./inputs/createThingSortInputType"),createThingWhereInputType=require("./inputs/createThingWhereInputType"),createThingWhereOneInputType=require("./inputs/createThingWhereOneInputType"),createThingQueryType=require("./queries/createThingQueryType"),createThingsQueryType=require("./queries/createThingsQueryType"),createCreateThingMutationType=require("./mutations/createCreateThingMutationType"),createUpdateThingMutationType=require("./mutations/createUpdateThingMutationType"),createDeleteThingMutationType=require("./mutations/createDeleteThingMutationType"),composeGeospatialTypes=require("./specialized/composeGeospatialTypes"),composeGqlTypes=a=>{const b=a.map(a=>createThingType(a)).join("\n"),c=a.map(a=>`${createThingCreateInputType(a)}
${createThingUpdateInputType(a)}`).join("\n"),d=a.filter(({isEmbedded:a})=>!a).map(a=>`${createThingWhereOneInputType(a)}${createThingWhereInputType(a)}${createThingSortInputType(a)}${createThingPaginationInputType(a)}${createThingNearInputType(a)}`).join("\n"),e=a.filter(({isEmbedded:a})=>!a).map(a=>`${createThingQueryType(a)}
${createThingsQueryType(a)}`).join("\n"),f=a.filter(({isEmbedded:a})=>!a).map(a=>`${createCreateThingMutationType(a)}
${createUpdateThingMutationType(a)}
${createDeleteThingMutationType(a)}`).join("\n"),g=`scalar DateTime${composeGeospatialTypes(a)}
${b}
${c}
${d}
type Query {
${e}
}
type Mutation {
${f}
}`;return g};module.exports=composeGqlTypes;