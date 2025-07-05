import mongoose from 'mongoose';


const imageSchema = new mongoose.Schema({

    categoryId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Category',
        required : true
    },
    weddingId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Project',
        required : true
    },
    folderPath : {
        type : String,

    },
    originalName : {
        type : String,

    },
    // this is the key created from the uuid + date url.
    key : {
        type : String,

    },
    size : {
        type : Number,

    },
    uploadedAt : {
        type : Date,
        default : Date.now
    }

})

const Image =  mongoose.model('Image', imageSchema);

export default Image;