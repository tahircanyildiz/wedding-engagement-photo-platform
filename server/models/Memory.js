const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
  guest_name: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Memory', memorySchema);
