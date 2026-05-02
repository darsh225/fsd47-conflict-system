const mongoose = require('mongoose');

const conflictSchema = new mongoose.Schema({
  recordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Record',
    required: true
  },
  recordTitle: {
    type: String
  },
  attemptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attemptedByUsername: {
    type: String
  },
  // The version the user had when they started editing
  clientVersion: {
    type: Number,
    required: true
  },
  // The version that was actually in DB at time of conflict
  serverVersion: {
    type: Number,
    required: true
  },
  // What the user was trying to save
  attemptedData: {
    title: String,
    content: String
  },
  // Who had already updated it
  conflictedWithUsername: {
    type: String
  },
  status: {
    type: String,
    enum: ['rejected'],
    default: 'rejected'
  }
}, { timestamps: true });

module.exports = mongoose.model('Conflict', conflictSchema);
