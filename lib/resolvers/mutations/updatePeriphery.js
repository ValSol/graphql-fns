// flow
const createThingSchema=require("../../mongooseModels/createThingSchema"),updatePeriphery=async(a,b)=>{const c=[];a.forEach((a,d)=>{const{name:e}=d,f=createThingSchema(d),g=b.model(e,f);Object.keys(a).forEach(d=>{const{array:e,name:f,oppositeConfig:h,oppositeIds:j}=a[d],{name:k}=h,l=createThingSchema(h),m=b.model(k,l);c.push(g.find({_id:{$in:j}},{[d]:1}).then(a=>{const b=a.map((a,b)=>a?{updateOne:{filter:{// eslint-disable-next-line no-underscore-dangle
_id:a[d]},update:e?{$pull:{[f]:j[b]}}:{$unset:{[f]:1}}}}:null).filter(Boolean);return m.bulkWrite(b)}))})}),await Promise.all(c)};module.exports=updatePeriphery;