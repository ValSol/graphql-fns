const createThingArrayResolver=require("./createThingArrayResolver"),createThingScalarResolver=require("./createThingScalarResolver"),composeThingResolvers=a=>{const{embeddedFields:b,relationalFields:c}=a;if(!c)throw new TypeError("Expected an array as a value of the relationalFields key of thingConfig");const d=c.reduce((a,{array:b,name:c,config:d})=>{if(b){const b=createThingArrayResolver(d);// eslint-disable-next-line no-param-reassign
a[c]=b}else{const b=createThingScalarResolver(d);// eslint-disable-next-line no-param-reassign
a[c]=b}return a},{});return b&&b.reduce((a,{name:b,config:{relationalFields:c}})=>{const d={};return c&&c.reduce((a,{array:b,name:c,config:d})=>{if(b){const b=createThingArrayResolver(d);// eslint-disable-next-line no-param-reassign
a[c]=b}else// const resolver = createThingScalarResolver(config);
// prev2[name2] = resolver;
// eslint-disable-next-line no-param-reassign
a[c]=()=>({id:"5cb4d6130490ee40854416b4",name:"VVaassyyaa"});return a},d),Object.keys(d).length&&(a[b]=d),a},d),d};module.exports=composeThingResolvers;