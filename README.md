# Peta Rumah Sakit Jabodetabek

Aplikasi web untuk mencari dan menemukan rumah sakit terdekat di wilayah Jabodetabek.

## Setup

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
```

Kemudian buka `http://localhost:8000` di browser.

## Fitur

- 🗺️ Peta interaktif dengan Leaflet
- 📍 Pilih lokasi dengan dropdown wilayah Jabodetabek
- 🔍 Pencarian rumah sakit dalam radius 1-10 km
- 🏥 Filter berdasarkan tipe: RSUP, RSUD, RSU, RSIA, RS
- 🔎 Pencarian berdasarkan nama rumah sakit (real-time)
- 📊 Otomatis diurutkan berdasarkan jarak terdekat
- 🧭 Navigasi langsung ke Google Maps
- 📱 Responsive design
- 🎯 Clean code & efisien

## Struktur File

```
rumah-sakit-gis/
├── index.html          # Halaman utama
├── app.js             # JavaScript utama
├── style.css          # Styling
├── config.js          # Konfigurasi API key (tidak di-commit)
├── config.example.js  # Template konfigurasi
├── .gitignore         # File yang diabaikan git
└── README.md          # Dokumentasi ini
```

## Keamanan

⚠️ **PENTING**: File `config.js` berisi API key dan **tidak boleh** di-commit ke repository. File ini sudah ditambahkan ke `.gitignore`.

Untuk berbagi project:

1. Share `config.example.js` sebagai template
2. Instruksikan user untuk membuat `config.js` mereka sendiri
3. Jangan pernah commit file `config.js` ke git

## Teknologi

- Leaflet.js - Library peta interaktif
- Geoapify API - Data peta dan places
- Tailwind CSS - Styling
- Font Awesome - Icons
