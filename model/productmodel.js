const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
    name:{
        type:String,
        require:true,
    },

image:{
    type:String,
    require:true,
},
countryName:{
    type:String,
    require:true,
},
countryFlag:{
    type:String,
    require:true,
},
description:{
    type:String,
    require:true,
},
type:{
    type:String,
    require:true,

},
status:{
    type:String,
    require:true,
}
});

const productModel = mongoose.model("productModel",productSchema);
module.exports = productModel;