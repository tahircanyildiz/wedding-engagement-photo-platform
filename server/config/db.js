const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // Connection pooling - daha hızlı bağlantılar için
      maxPoolSize: 10,
      minPoolSize: 2,
      // Timeout ayarları
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Bağlantı koptuğunda otomatik yeniden bağlan
      retryWrites: true,
    });

    console.log('MongoDB bağlantısı başarılı');

    // Bağlantı olaylarını dinle
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB bağlantı hatası:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB bağlantısı kesildi, yeniden bağlanılıyor...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB yeniden bağlandı');
    });

  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
