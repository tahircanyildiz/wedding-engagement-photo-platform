const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  upload_enabled: {
    type: Boolean,
    default: true
  },
  event_info: {
    couple_names: {
      type: String,
      default: 'Ayşe & Mehmet'
    },
    date: {
      type: Date,
      default: null
    },
    location: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: 'Mutluluğumuzu sizinle paylaşmak istiyoruz!'
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Only one settings document should exist
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
