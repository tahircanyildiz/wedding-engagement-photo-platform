require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Admin = require('./models/Admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Connect to database
connectDB();

// Initialize admin account if doesn't exist
const initializeAdmin = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const admin = new Admin({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'changeme123'
      });
      await admin.save();
      console.log('Admin hesabı oluşturuldu. Lütfen şifreyi değiştirin!');
    }
  } catch (error) {
    console.error('Admin initialization error:', error);
  }
};

initializeAdmin();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/qrcode', require('./routes/qrcode'));
app.use('/api/memories', require('./routes/memories'));

// Health check endpoint for cron jobs
const startTime = Date.now();
app.get('/api/health', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  res.json({
    status: 'ok',
    message: 'Server is running',
    uptime: `${uptime} seconds`,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Bir hata oluştu!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
