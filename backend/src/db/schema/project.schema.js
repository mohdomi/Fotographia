import mongoose from "mongoose";


const projectSchema = new mongoose.Schema({

    wedding_name: {
        type: String,
        required: true,
        trim: true
    },
    Package: {
        type : String,
        enum : ['Free' , 'Silver' , 'Gold' , 'Platinum'],
        default : 'Free'
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
    wedding_face: {
        type: String,
        default:""
    },
    wedding_img: {
    type: Map,
    of: [String], 
    default: {}
  }

    fz
});




const Projects = mongoose.model("Project",projectSchema);

export default Projects;