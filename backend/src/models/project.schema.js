import mongoose, { Mongoose } from "mongoose";


const projectSchema = new mongoose.Schema({

    wedding_name: {
        type: String,
        required: true,
        trim: true
    },
    Package: {
        type: String,
        enum: ['Free', 'Silver', 'Gold', 'Platinum'],
        default: 'Free'
    },
    Date: {
        type: Date,
        required: true
    },
    Mobile_Number: {
        type: String,
        required: true,
        trim: true
    },
    months: {
        type: Number,
        default: 0
    },
    days: {
        type: Number,
        default: 0
    },
    hours: {
        type: Number,
        default: 0
    },
    minutes: {
        type: Number,
        default: 0
    },
    Userpin: {
        type: String,
        trim: true
    },
    AdminUserId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
    ,

    ClientUserId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ClientUser"
    }],

    wedding_face: {
        type: Map,
        of: [String],
        default: {}
    },

    wedding_img: {
        type: Map,
        of: [String],
        default: {}
    },

    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }]

});




const Project = mongoose.model("Project", projectSchema);

export default Project;