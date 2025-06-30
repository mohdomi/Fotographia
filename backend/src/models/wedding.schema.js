import mongoose from 'mongoose';


const weddingSchema  = new mongoose.Schema({

    name : {
        type : String,
        required : true
    },
    package : {
        type : String,
        enum : ['Free' , 'Silver' , 'Gold' , 'Platinum'],
        default : 'Free'
    },
    categories : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Category'
        }
    ],
    createdAt : {
        type : Date,
        required : true
    }

})


const Wedding = mongoose.model('Wedding' , weddingSchema);

export default Wedding;