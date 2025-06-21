import mongoose from 'mongoose';


const imageSchema = new mongoose.Schema({

    url : {
        type : String,
        required : true
    },
    categoryId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Category',
        required : true
    },
    uploadedAt : {
        type : Date
    }

})


const Image = mongoose.model('Image' , imageSchema);

export default Image;