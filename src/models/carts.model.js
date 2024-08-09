import mongoose from 'mongoose';

const cartCollection = 'Carts';
const cartSchema = new mongoose.Schema({
    products:{
        type:[
            {
                productID:{    
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Products' 
                },
                quantity:{
                    type: Number,
                    default: 1
                }
            }
        ],
        default:[] 
    }
});
cartSchema.pre('find', function(){
    this.populate('products.productID');
});
export const cartModel = mongoose.model(cartCollection, cartSchema)