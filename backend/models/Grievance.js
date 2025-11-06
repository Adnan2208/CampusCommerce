import mongoose from 'mongoose';

const grievanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Technical Issue', 'Payment Problem', 'User Behavior', 'Product Issue', 'Feature Request', 'Other']
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const Grievance = mongoose.model('Grievance', grievanceSchema);

export default Grievance;
