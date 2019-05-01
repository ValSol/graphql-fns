const composeGeospatialTypes=a=>{let b=!1,c=!1;for(let d=0;d<a.length;d+=1){const e=a[d],{geospatialFields:f}=e;if(f&&f.some(({type:a})=>"Point"===a)&&(b=!0),f&&f.some(({type:a})=>"Polygon"===a)){c=!0;break}}return c?`
type GeospatialPoint {
  longitude: Float!
  latitude: Float!
}
type GeospatialPolygonRing {
  ring: [GeospatialPoint!]!
}
type GeospatialPolygon {
  extarnalRing: GeospatialPolygonRing!
  intarnalRings: [GeospatialPolygonRing!]
}
input GeospatialPointInput {
  longitude: Float!
  latitude: Float!
}
input GeospatialPolygonRingInput {
  ring: [GeospatialPointInput!]!
}
input GeospatialPolygonInput {
  extarnalRing: GeospatialPolygonRingInput!
  intarnalRings: [GeospatialPolygonRingInput!]
}`:b?`
type GeospatialPoint {
  longitude: Float!
  latitude: Float!
}
input GeospatialPointInput {
  longitude: Float!
  latitude: Float!
}`:""};module.exports=composeGeospatialTypes;