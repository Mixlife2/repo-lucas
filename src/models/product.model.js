import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'

const productCollection = 'Products';
const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    thumbnail:{
        type: String,
        default: null,
        required: false 
    },
    code:{
        type:String,
        unique: true, 
        required: true
    },
    stock:{
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true 
    },
    owner: {
        type: String,
        default: 'admin' 
    }
});

productSchema.plugin(mongoosePaginate);

export const productModel = mongoose.model(productCollection, productSchema);