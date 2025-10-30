require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

console.log('='.repeat(60));
console.log('👤 ADMIN KULLANICI YÖNETİMİ');
console.log('='.repeat(60));
console.log();

async function manageAdmin() {
  try {
    console.log('⏳ MongoDB\'ye bağlanıyor...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı!');
    console.log();

    // Mevcut admin kontrolü
    const existingAdmin = await Admin.findOne({ username: process.env.ADMIN_USERNAME || 'admin' });

    if (existingAdmin) {
      console.log('⚠️  Admin kullanıcısı zaten mevcut!');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Oluşturulma: ${existingAdmin.createdAt}`);
      console.log();
      console.log('📝 Şifre sıfırlamak için:');
      console.log('   1. MongoDB\'de admin dokümanını silin');
      console.log('   2. server\\.env dosyasında ADMIN_PASSWORD değiştirin');
      console.log('   3. Bu scripti tekrar çalıştırın');
      console.log();
      console.log('   VEYA');
      console.log();
      console.log('   MongoDB Atlas → Browse Collections → admins → Delete');
      console.log('   Sonra backend\'i yeniden başlatın (npm run dev)');
      console.log();

      await mongoose.connection.close();
      process.exit(0);
    }

    // Yeni admin oluştur
    console.log('📝 Yeni admin kullanıcısı oluşturuluyor...');
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'changeme123';

    const admin = new Admin({
      username: username,
      password: password
    });

    await admin.save();

    console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!');
    console.log();
    console.log('─'.repeat(60));
    console.log('📋 GİRİŞ BİLGİLERİ:');
    console.log('─'.repeat(60));
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log('─'.repeat(60));
    console.log();
    console.log('🔐 Login URL: http://localhost:3000/admin/login');
    console.log();
    console.log('⚠️  ÖNEMLİ: İlk girişten sonra şifrenizi değiştirin!');
    console.log();

    await mongoose.connection.close();
    console.log('✅ Bağlantı kapatıldı');
    process.exit(0);

  } catch (error) {
    console.error('❌ HATA:', error.message);
    console.log();

    if (error.message.includes('connect')) {
      console.log('💡 ÇÖZÜM:');
      console.log('   1. server\\.env dosyasında MONGODB_URI kontrol edin');
      console.log('   2. MongoDB Atlas cluster\'ınız çalışıyor mu?');
      console.log('   3. IP whitelist ayarlarını kontrol edin');
    }

    process.exit(1);
  }
}

manageAdmin();
