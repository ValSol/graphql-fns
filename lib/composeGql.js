/** Supporting recursive fuction to compose fields hierarchy
 * @arg {Object} fields - tree / subtree of fields hierarchy
 * @arg {Object[]} resultArray - array where each item is sting line of fields hierarchy
 * @arg {number} [shift=2] - shift of current lines of fields hierarchy
 */const composeFields=(a,b=[],c=2)=>(Object.keys(a).reduce((b,d)=>{const e=a[d];return null===e?b.push(`${"  ".repeat(c)}${d}`):(b.push(`${"  ".repeat(c)}${d} {`),composeFields(e,b,c+1),b.push(`${"  ".repeat(c)}}`)),b},b),b),composeGql=(a,b,c={})=>{const d=!!c.isMutation,e=c.args?c.args:[],f=c.argsForDirectives?c.argsForDirectives:[],g=c.operationName?c.operationName:`${a}${d?"Mutation":"Query"}`,h=[...e,...f].map(({name:a,type:b})=>b?`$${a}: ${b}`:"").filter(Boolean).join(", "),i=h?`(${h})`:"",j=e.map(({name:a,value:b})=>b?`${a}: ${b}`:`${a}: $${a}`).join(", "),k=j?`(${j})`:"",l=composeFields(b).join("\n");return`
${d?"mutation":"query"} ${g}${i} {
  ${a}${k} {
${l}
  }
}
`};/** Compose graphql query | mutation string by specified parameters
 * @arg {string} queryName - name of query or mutation
 * @arg {Object} fields - tree of graphql fields hierarchy
 * @arg {Object} [options] - optional parameters of graphql query | mutation
 * @arg {Object[]} [options.args] - args in query | mutation
 * @arg {Object[]} [options.argsForDirectives] - args for directives in query | mutation
 * @arg {boolean} [options.isMutation] - true to compose mutation
 * @arg {string} [options.operationName] - operationName of query | mutation
 */module.exports=composeGql;