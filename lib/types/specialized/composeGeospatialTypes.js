const composeGeospatialTypes=a=>{const{thingConfigs:b}=a;let c=!1,d=!1;for(let e=0;e<b.length;e+=1){const a=b[e],{geospatialFields:f}=a;if(f&&f.some(({type:a})=>"Point"===a)&&(c=!0),f&&f.some(({type:a})=>"Polygon"===a)){d=!0;break}}return d?`
type GeospatialPoint {
  longitude: Float!
  latitude: Float!
}
type GeospatialPolygonRing {
  ring: [GeospatialPoint!]!
}
type GeospatialPolygon {
  externalRing: GeospatialPolygonRing!
  internalRings: [GeospatialPolygonRing!]
}
input GeospatialPointInput {
  longitude: Float!
  latitude: Float!
}
input GeospatialPolygonRingInput {
  ring: [GeospatialPointInput!]!
}
input GeospatialPolygonInput {
  externalRing: GeospatialPolygonRingInput!
  internalRings: [GeospatialPolygonRingInput!]
}`:c?`
type GeospatialPoint {
  longitude: Float!
  latitude: Float!
}
input GeospatialPointInput {
  longitude: Float!
  latitude: Float!
}`:""};module.exports=composeGeospatialTypes;