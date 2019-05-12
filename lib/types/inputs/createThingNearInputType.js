const createThingNearInputType=a=>{const{name:b,geospatialFields:c}=a,d=c?c// for 'near' query will use only scalar points
.filter(({array:a,type:b})=>!a&&"Point"===b).map(({name:a})=>`  ${a}`):[];return d.length?`enum ${b}GeospatialFieldNamesEnumeration {
${d.join("\n")}
}
input ${b}NearInput {
  geospatialField: ${b}GeospatialFieldNamesEnumeration
  coordinates: GeospatialPointInput
  maxDistance: Float
}`:""};module.exports=createThingNearInputType;