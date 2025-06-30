// models/AccessUser.js
import mongoose from 'mongoose';

const accessUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['viewer', 'admin'],
    default: 'viewer'
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // or 'AdminUser' if you split them
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('AccessUser', accessUserSchema);
