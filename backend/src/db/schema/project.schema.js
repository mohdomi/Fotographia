import mongoose, { Mongoose } from "mongoose";


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
    AdminUserId:[{
          type : mongoose.Schema.Types.ObjectId,
            ref : "User"
    }]
    ,

    ClientUserId:[{
    type : mongoose.Schema.Types.ObjectId,
    ref : "ClientUser"
    }],

    wedding_face: [{
    type: Map,
    of: [String], 
    default: {}
    }],

<<<<<<< HEAD
wedding_img: [{
  type: Map,
  of: [String],
  default: {}
}]
});
=======
})
>>>>>>> 028c7cc43012e4980aab5f9a0735277e1c4f0eb1




const Projects = mongoose.model("Project",projectSchema);

export default Projects;