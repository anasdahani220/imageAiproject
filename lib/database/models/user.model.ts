import { model, models, Schema } from "mongoose";


const UserSchema = new Schema({
    clerkId: {type: String , required: true , unique: true} ,
    email: {type: String , required: true , unique: true} ,
    userName: {type: String , required: true , unique: true} ,
    photo: {type: String , required: true} ,
    firstName: {type: String } ,
    lastname: {type: String } ,
    planId: {type: Number , default: 1} ,
    creditBalance: {type: Number , default: 10} ,

})

export const User = models?.User || model('User', UserSchema) ;