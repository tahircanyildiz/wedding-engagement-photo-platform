# 💒 Düğün Fotoğraf Paylaşım Platformu

Modern ve kullanıcı dostu düğün/nişan fotoğraf paylaşım uygulaması. Misafirlerinizin çektiği fotoğrafları tek bir platformda toplayın ve QR kod ile kolayca paylaşın.

## ✨ Özellikler

### Genel Özellikler
- 🎨 Modern ve romantik tasarım (pastel renkler)
- 📱 Tam responsive tasarım (mobil, tablet, desktop)
- ⚡ Hızlı ve performanslı
- 🔒 Güvenli admin paneli
- 🌐 Türkçe dil desteği

### Anasayfa
- Çiftin isimleri, tarih ve yer bilgisi
- Geri sayım sayacı (countdown timer)
- Gösterişli hero section
- Bilgilendirme bölümleri

### Galeri
- Pinterest tarzı masonry layout
- Lazy loading (performans için)
- Lightbox ile fotoğraf görüntüleme
- Fotoğraf indirme
- Filtreleme (en yeni, en eski, yükleyene göre)
- Responsive grid yapısı

### Fotoğraf Yükleme
- QR kod ile kolay erişim
- Drag & drop yükleme
- Multiple file upload
- Önizleme özelliği
- Progress bar
- Cloudinary entegrasyonu
- Yükleyen adı kaydetme

### Admin Paneli
- JWT ile güvenli giriş
- Dashboard istatistikleri
- Fotoğraf yönetimi
- Toplu silme özelliği
- QR kod oluşturma ve indirme
- Yükleme durumu kontrolü
- Etkinlik ayarları

## 🛠️ Teknoloji Stack

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- Axios
- React Dropzone
- React Toastify
- QRCode.react
- Yet Another React Lightbox
- React Masonry CSS
- Date-fns
- Vite

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Bcrypt.js
- Cloudinary
- QRCode
- CORS

## 📋 Gereksinimler

- Node.js (v16 veya üzeri)
- MongoDB (yerel veya cloud)
- Cloudinary hesabı
- npm veya yarn

## 🚀 Kurulum

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd weddindPhotos
```

### 2. Bağımlılıkları Yükleyin
```bash
npm run install-all
```

Bu komut root, client ve server klasörlerindeki tüm bağımlılıkları yükler.

### 3. Environment Variables Ayarlayın

#### Server (.env)
`server` klasöründe `.env` dosyası oluşturun:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/wedding-photos

# JWT Secret (güçlü bir şifre kullanın)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-secure

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
PORT=5000
NODE_ENV=development

# Admin Credentials (ilk giriş için, sonra değiştirin!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme123
```

#### Client (.env)
`client` klasöründe `.env` dosyası oluşturun:

```env
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

### 4. Cloudinary Ayarları

1. [Cloudinary](https://cloudinary.com/) hesabı oluşturun (ücretsiz)
2. Dashboard'dan Cloud Name, API Key ve API Secret bilgilerinizi alın
3. Settings > Upload > Upload Presets bölümünden yeni bir preset oluşturun:
   - Preset name: `wedding-photos` (veya istediğiniz bir isim)
   - Signing mode: `Unsigned` (önerilen)
   - Folder: `wedding-photos` (opsiyonel)
4. Preset adını `.env` dosyasına ekleyin

### 5. MongoDB Ayarları

#### Yerel MongoDB
```bash
# MongoDB'yi başlatın
mongod
```

#### MongoDB Atlas (Cloud)
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) hesabı oluşturun
2. Cluster oluşturun
3. Database Access'ten kullanıcı oluşturun
4. Network Access'ten IP adresinizi whitelist'e ekleyin (0.0.0.0/0 tüm IP'lere izin verir)
5. Connection string'i `.env` dosyasına ekleyin

## 🎯 Kullanım

### Development Mode

Hem frontend hem backend'i aynı anda çalıştırın:

```bash
npm run dev
```

Veya ayrı ayrı:

```bash
# Backend
npm run server

# Frontend (yeni terminal)
npm run client
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Production Build

```bash
# Client build
cd client
npm run build
```

## 📱 Sayfa Yapısı

```
/ (Anasayfa)
├── /gallery (Fotoğraf Galerisi)
├── /upload (Fotoğraf Yükleme - QR kod ile erişilebilir)
└── /admin
    ├── /login (Admin Girişi)
    └── /dashboard (Admin Paneli)
        ├── /dashboard (İstatistikler)
        ├── /photos (Fotoğraf Yönetimi)
        ├── /qrcode (QR Kod Yönetimi)
        └── /settings (Ayarlar)
```

## 🔐 Admin Paneli

### İlk Giriş
- Kullanıcı adı: `admin` (veya .env'de belirlediğiniz)
- Şifre: `changeme123` (veya .env'de belirlediğiniz)

**ÖNEMLİ:** İlk girişten sonra şifreyi değiştirin!

### Admin Paneli Özellikleri

#### Dashboard
- Toplam fotoğraf sayısı
- Katkıda bulunan kişi sayısı
- En çok fotoğraf yükleyen 5 kişi
- Son yüklenen fotoğraflar
- Yükleme durumu toggle

#### Fotoğraf Yönetimi
- Tüm fotoğrafları görüntüleme
- Grid layout
- Fotoğraf silme (tekli)
- Toplu silme
- İsme göre arama
- Kullanıcı bazında istatistikler

#### QR Kod Yönetimi
- QR kod oluşturma
- QR kod görüntüleme
- PNG olarak indirme
- Kullanım talimatları

#### Ayarlar
- Etkinlik bilgileri düzenleme
  - Çift isimleri
  - Tarih
  - Mekan
  - Açıklama
- Yükleme durumu (açık/kapalı)
- Anasayfa önizlemesi

## 🎨 Tasarım

### Renk Paleti
- Romantic Pink: #e85a87
- Pastel Pink: #ffc0cb
- Pastel Lavender: #e6e6fa
- Pastel Peach: #ffdab9

### Font Aileleri
- Başlıklar: Playfair Display (elegant)
- Metin: Poppins (modern)

### Tailwind Custom Classes
- `.btn-primary`: Ana butonlar
- `.btn-secondary`: İkincil butonlar
- `.card`: Kart container'ları
- `.input-field`: Form input'ları

## 📂 Proje Yapısı

```
weddindPhotos/
├── client/                  # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin pages
│   │   │   ├── HomePage.jsx
│   │   │   ├── GalleryPage.jsx
│   │   │   └── UploadPage.jsx
│   │   ├── utils/          # Utilities
│   │   │   ├── api.js      # API calls
│   │   │   └── auth.js     # Auth helpers
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
├── server/                  # Express Backend
│   ├── config/             # Configuration
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── models/             # MongoDB Models
│   │   ├── Photo.js
│   │   ├── Admin.js
│   │   └── Settings.js
│   ├── routes/             # API Routes
│   │   ├── auth.js
│   │   ├── photos.js
│   │   ├── settings.js
│   │   └── qrcode.js
│   ├── middleware/         # Middleware
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

## 🔧 API Endpoints

### Public Endpoints
- `GET /api/photos` - Tüm fotoğrafları getir
- `POST /api/photos/upload` - Fotoğraf yükle
- `GET /api/settings` - Ayarları getir

### Protected Endpoints (Admin)
- `POST /api/auth/login` - Admin girişi
- `GET /api/auth/verify` - Token doğrulama
- `DELETE /api/photos/:id` - Fotoğraf sil
- `POST /api/photos/bulk-delete` - Toplu silme
- `GET /api/photos/stats/overview` - İstatistikler
- `PUT /api/settings` - Ayarları güncelle
- `PATCH /api/settings/toggle-upload` - Yükleme durumu toggle
- `POST /api/qrcode/generate` - QR kod oluştur

## 🎯 Kullanım Senaryosu

1. **Düğün Öncesi Hazırlık**
   - Admin paneline giriş yapın
   - Ayarlar'dan etkinlik bilgilerini girin (isimler, tarih, yer)
   - QR kod oluşturun ve yazdırın
   - QR kodu davetiyelerinize, masalara veya düğün girişine yerleştirin

2. **Düğün Günü**
   - Misafirler QR kodu tarayarak `/upload` sayfasına erişir
   - İsimlerini girer ve fotoğrafları yükler
   - Yüklenen fotoğraflar otomatik olarak galeride görünür

3. **Düğün Sonrası**
   - Admin panelinden tüm fotoğrafları görüntüleyin
   - İstenmeyen fotoğrafları silin
   - İstatistikleri inceleyin
   - Fotoğraf yüklemeyi kapatın (isteğe bağlı)

## 🐛 Sorun Giderme

### MongoDB Bağlantı Hatası
```bash
# MongoDB'nin çalıştığından emin olun
mongod --version

# MongoDB servisini başlatın
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

### Port Zaten Kullanımda
```bash
# Port'u kullanan process'i bulun
lsof -i :5000  # Backend port
lsof -i :3000  # Frontend port

# Process'i sonlandırın
kill -9 <PID>
```

### Cloudinary Upload Hatası
- Upload preset'in `unsigned` olduğundan emin olun
- Cloud name, API key ve preset adının doğru olduğunu kontrol edin
- CORS ayarlarını kontrol edin (Cloudinary dashboard)

### Admin Girişi Yapılamıyor
- `.env` dosyasındaki admin bilgilerini kontrol edin
- MongoDB'de admin kaydının oluşturulduğunu kontrol edin
- JWT_SECRET'in ayarlandığından emin olun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add some amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📧 İletişim

Sorularınız için issue açabilirsiniz.

---

Made with ❤️ for your special day
