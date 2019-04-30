const createThingPaginationInputType=a=>{const{name:b,pagination:c}=a;return c?`
input ${b}PaginationInput {
  skip: Int
  first: Int
}`:""};module.exports=createThingPaginationInputType;