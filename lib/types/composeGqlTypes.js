const createThingType=require("./createThingType"),createThingCreateInputType=require("./inputs/createThingCreateInputType"),createThingPaginationInputType=require("./inputs/createThingPaginationInputType"),createThingUpdateInputType=require("./inputs/createThingUpdateInputType"),createThingNearInputType=require("./inputs/createThingNearInputType"),createThingSortInputType=require("./inputs/createThingSortInputType"),createThingWhereInputType=require("./inputs/createThingWhereInputType"),createThingWhereOneInputType=require("./inputs/createThingWhereOneInputType"),createThingQueryType=require("./queries/createThingQueryType"),createThingsQueryType=require("./queries/createThingsQueryType"),createCreateThingMutationType=require("./mutations/createCreateThingMutationType"),createUpdateThingMutationType=require("./mutations/createUpdateThingMutationType"),createDeleteThingMutationType=require("./mutations/createDeleteThingMutationType"),composeGeospatialTypes=require("./specialized/composeGeospatialTypes"),composeGqlTypes=a=>{const{thingConfigs:b}=a,c=b.map(a=>createThingType(a)).join("\n"),d=b.map(a=>`${createThingCreateInputType(a)}
${createThingUpdateInputType(a)}`).join("\n"),e=b.filter(({isEmbedded:a})=>!a).map(a=>`${createThingWhereOneInputType(a)}${createThingWhereInputType(a)}${createThingSortInputType(a)}${createThingPaginationInputType(a)}${createThingNearInputType(a)}`).join("\n"),f=b.filter(({isEmbedded:a})=>!a).map(a=>`${createThingQueryType(a)}
${createThingsQueryType(a)}`).join("\n"),g=b.filter(({isEmbedded:a})=>!a).map(a=>`${createCreateThingMutationType(a)}
${createUpdateThingMutationType(a)}
${createDeleteThingMutationType(a)}`).join("\n"),h=`scalar DateTime${composeGeospatialTypes(a)}
${c}
${d}
${e}
type Query {
${f}
}
type Mutation {
${g}
}`;return h};module.exports=composeGqlTypes;