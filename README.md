# 🏥 Peta Rumah Sakit Jabodetabek

Aplikasi web berbasis GIS (Geographic Information System) untuk mencari dan menemukan rumah sakit terdekat di wilayah Jabodetabek (Jakarta, Bogor, Depok, Tangerang, Bekasi). Aplikasi ini memanfaatkan Geoapify Places API untuk mendapatkan data lokasi rumah sakit dan Leaflet.js untuk visualisasi peta interaktif.

## 📸 Screenshot

![Peta Rumah Sakit Jabodetabek](https://via.placeholder.com/800x400?text=Screenshot+Aplikasi)

## ✨ Fitur Utama

### 🗺️ Peta Interaktif

- Visualisasi peta dengan tile layer Geoapify
- Zoom in/out dan navigasi drag
- Klik di peta untuk mengubah pusat pencarian

### 📍 Pemilihan Lokasi

- **Dropdown Wilayah**: Pilih dari 10 wilayah Jabodetabek (Jakarta Pusat/Utara/Selatan/Timur/Barat, Bogor, Depok, Tangerang, Tangerang Selatan, Bekasi)
- **Input Manual**: Masukkan koordinat latitude/longitude secara manual
- **Klik di Peta**: Klik langsung pada peta untuk menentukan lokasi

### 🔍 Pencarian & Filter

- **Radius Pencarian**: Atur radius 1-10 km dengan slider
- **Filter Tipe RS**: Filter berdasarkan tipe rumah sakit:
  - RSUP (Rumah Sakit Umum Pusat)
  - RSUD (Rumah Sakit Umum Daerah)
  - RSU (Rumah Sakit Umum)
  - RSIA (Rumah Sakit Ibu & Anak)
  - RS (Rumah Sakit Swasta)
- **Pencarian Nama**: Cari berdasarkan nama rumah sakit (real-time filtering)

### 📊 Hasil Pencarian

- Daftar rumah sakit dengan informasi lengkap
- Otomatis diurutkan berdasarkan jarak terdekat
- Popup informatif dengan detail rumah sakit
- Tombol navigasi langsung ke Google Maps

### 📱 Responsive Design

- Tampilan optimal di desktop dan mobile
- Sidebar yang mudah digunakan

## 🚀 Cara Menjalankan

### 1. Clone Repository

```bash
git clone <repository-url>
cd rumah-sakit-gis
```

### 2. Konfigurasi API Key

1. Copy file `config.example.js` menjadi `config.js`:

   ```bash
   cp config.example.js config.js
   ```

2. Buka `config.js` dan masukkan API key Geoapify Anda:

   ```javascript
   window.APP_CONFIG = {
     GEOAPIFY_API_KEY: "your_api_key_here",
   };
   ```

3. Dapatkan API key gratis di: https://www.geoapify.com/

### 3. Jalankan Aplikasi

Buka file `index.html` di browser atau gunakan local server:

```bash
# Menggunakan Python
python -m http.server 8000

# Atau menggunakan Node.js
npx serve

# Atau menggunakan VS Code Live Server Extension
```

Kemudian buka `http://localhost:8000` di browser.

## 📁 Struktur Project

```
rumah-sakit-gis/
├── index.html          # Halaman utama aplikasi
├── style.css           # Custom styling & CSS
├── config.js           # Konfigurasi API key (tidak di-commit)
├── config.example.js   # Template konfigurasi
├── js/                 # JavaScript modules (ES6)
│   ├── app.js          # Entry point & initialization
│   ├── constants.js    # Konstanta dan pengaturan aplikasi
│   ├── state.js        # State management
│   ├── map.js          # Modul peta Leaflet
│   ├── api.js          # Modul API Geoapify
│   ├── ui.js           # Modul UI dan event handlers
│   ├── search.js       # Modul pencarian dan filtering
│   └── utils.js        # Utility functions
├── .gitignore          # File yang diabaikan git
└── README.md           # Dokumentasi
```

### 📦 Penjelasan Modul JavaScript

| File           | Deskripsi                                                 |
| -------------- | --------------------------------------------------------- |
| `app.js`       | Entry point, bootstrap aplikasi saat DOM ready            |
| `constants.js` | Konfigurasi, lokasi Jabodetabek, keyword tipe RS          |
| `state.js`     | State management untuk map, markers, dan data rumah sakit |
| `map.js`       | Inisialisasi peta, marker management, popup content       |
| `api.js`       | Fetch data dari Geoapify, ekstraksi & format data RS      |
| `ui.js`        | Event handlers, manipulasi DOM, tampilan hasil            |
| `search.js`    | Logika pencarian, filtering tipe/nama, sorting jarak      |
| `utils.js`     | Fungsi utilitas: kalkulasi jarak Haversine, format, delay |

## 🔒 Keamanan

⚠️ **PENTING**: File `config.js` berisi API key dan **tidak boleh** di-commit ke repository. File ini sudah ditambahkan ke `.gitignore`.

Untuk berbagi project:

1. Share `config.example.js` sebagai template
2. Instruksikan user untuk membuat `config.js` mereka sendiri
3. Jangan pernah commit file `config.js` ke git

## 🛠️ Teknologi yang Digunakan

| Teknologi        | Kegunaan                                         |
| ---------------- | ------------------------------------------------ |
| **Leaflet.js**   | Library peta interaktif open-source              |
| **Geoapify API** | Tile layer peta dan Places API untuk data lokasi |
| **Tailwind CSS** | Utility-first CSS framework untuk styling        |
| **Font Awesome** | Icon library untuk ikon-ikon UI                  |
| **ES6 Modules**  | Modular JavaScript untuk kode yang bersih        |

## 📝 Cara Penggunaan

1. **Pilih Lokasi**: Gunakan dropdown untuk memilih wilayah, atau klik langsung di peta
2. **Atur Radius**: Geser slider untuk menentukan radius pencarian (1-10 km)
3. **Klik "Cari Rumah Sakit"**: Aplikasi akan mencari rumah sakit dalam radius tersebut
4. **Filter Hasil** (opsional):
   - Gunakan filter tipe untuk menampilkan tipe RS tertentu
   - Ketik nama untuk mencari rumah sakit spesifik
5. **Lihat Detail**: Klik marker atau item di daftar untuk melihat informasi lengkap
6. **Navigasi**: Klik tombol "Navigasi ke Rumah Sakit" untuk membuka Google Maps

## 👨‍💻 Pengembang

Dibuat untuk keperluan pembelajaran GIS dan pengembangan aplikasi web.

## 📄 Lisensi

MIT License - Silakan gunakan dan modifikasi sesuai kebutuhan.
