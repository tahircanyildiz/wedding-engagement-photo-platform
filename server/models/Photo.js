const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  cloudinary_url: {
    type: String,
    required: true
  },
  cloudinary_public_id: {
    type: String,
    required: true
  },
  uploader_name: {
    type: String,
    required: true,
    trim: true
  },
  upload_date: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
photoSchema.index({ upload_date: -1 });
photoSchema.index({ uploader_name: 1 });

module.exports = mongoose.model('Photo', photoSchema);
