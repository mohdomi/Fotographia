import mongoose from 'mongoose';


const imageSchema = new mongoose.Schema({

    url : {
        type : String,
        required : true
    },
    categoryId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Category',
        // required : true // temporarily commenting this out because of frontend schema 
    },
    weddingId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Wedding',
        required : false
    },
    folderPath : {
        type : String,
        required : false
    },
    originalName : {
        type : String,
        required : false
    },
    // this is the key created from the uuid + date url.
    key : {
        type : String,
        required : false
    },
    size : {
        type : Number,
        required : false
    },
    uploadedAt : {
        type : Date,
        default : Date.now
    }

})


const Image = mongoose.model('Image' , imageSchema);

export default Image;