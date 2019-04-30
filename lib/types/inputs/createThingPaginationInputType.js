const createThingPaginationInputType=a=>{const{name:b,pagination:c}=a;if(c){const{skip:a,first:d}=c;return`
input ${b}PaginationInput {
  skip: Int = ${a}
  first: Int = ${d}
}`}return""};module.exports=createThingPaginationInputType;