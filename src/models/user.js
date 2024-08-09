import mongoose from "mongoose";

const collection = 'users';
const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: {
        type: String,
        unique: true,
        require: true 
    },
    age: Number,
    password: {
        type: String,
        require: true
    },
    cart: {
        type:[
            {
                cartId:{    
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Carts' 
                }
            }
        ],
        default:[] 
    },
    role: {
        type:String,
        enum: ['user', 'admin' , 'premium'], 
        default:'user'
    },
    documents: [{
        name: String,
        reference: String
      }],
    last_connection: {
        type: Date,
        default: Date.now
    }
});
userSchema.pre('find', function(){
    this.populate('cart.cartId');
});

export const userModel = mongoose.model(collection,userSchema)