import mongoose from 'mongoose';

const userSchema=new mongoose.Schema({
  password:{
    type: String,
    required: [true, "password is required"]
  },
  role: {
    type: String,
    enum: ['AdminUser', 'MainAdmin'],
    default: 'AdminUser'
  },
 
  projects:[{
         type:mongoose.Schema.Types.ObjectId,
         ref:"Projects"
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

export default User;



 