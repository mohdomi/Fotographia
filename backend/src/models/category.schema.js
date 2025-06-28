import mongoose from 'mongoose';


const categorySchema = new mongoose.Schema({

    weddingId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    order: {
        type : Number ,
        required : true
    }, // keeping this temporarily for now.
    
    unlockThreshhold: { type: Number ,required : true },

    images: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image'
    }],
    
    createdAt: Date

})


const Category = mongoose.model('Category', categorySchema);

export default Category;