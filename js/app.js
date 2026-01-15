/**
 * app.js
 * Entry point aplikasi - Inisialisasi dan bootstrap
 */

import { CONFIG } from "./constants.js";
import { initMap } from "./map.js";
import { initEventListeners, setSearchCenter } from "./ui.js";

/**
 * Inisialisasi aplikasi saat DOM sudah ready
 */
function initializeApp() {
  try {
    // Validasi API key
    if (!CONFIG.GEOAPIFY_API_KEY) {
      console.warn(
        "Warning: Geoapify API key tidak ditemukan. Pastikan config.js sudah dikonfigurasi."
      );
    }

    // Inisialisasi peta dengan lokasi default
    initMap(CONFIG.DEFAULT_LOCATION);

    // Setup event listeners UI
    initEventListeners();

    // Set pusat pencarian ke lokasi default
    setSearchCenter(CONFIG.DEFAULT_LOCATION);

    console.log("✅ Aplikasi Peta Rumah Sakit berhasil diinisialisasi");
  } catch (error) {
    console.error("❌ Error initializing app:", error);
    alert("Gagal menginisialisasi aplikasi: " + error.message);
  }
}

// Jalankan saat DOM sudah ready
document.addEventListener("DOMContentLoaded", initializeApp);
