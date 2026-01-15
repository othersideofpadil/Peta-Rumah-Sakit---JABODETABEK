/**
 * constants.js
 * Menyimpan semua konstanta dan pengaturan aplikasi
 */

export const CONFIG = {
  // API key dari config.js global
  get GEOAPIFY_API_KEY() {
    return window.APP_CONFIG?.GEOAPIFY_API_KEY || "";
  },

  // Lokasi default (Jakarta Pusat)
  DEFAULT_LOCATION: {
    lat: -6.2088,
    lng: 106.8456,
  },

  // Daftar wilayah Jabodetabek yang dapat dipilih user
  PREDEFINED_LOCATIONS: {
    "Jakarta Pusat": { lat: -6.2088, lng: 106.8456, zoom: 13 },
    "Jakarta Utara": { lat: -6.1382, lng: 106.8634, zoom: 13 },
    "Jakarta Selatan": { lat: -6.2615, lng: 106.8106, zoom: 13 },
    "Jakarta Timur": { lat: -6.225, lng: 106.9004, zoom: 13 },
    "Jakarta Barat": { lat: -6.1673, lng: 106.7591, zoom: 13 },
    Bogor: { lat: -6.5971, lng: 106.806, zoom: 13 },
    Depok: { lat: -6.4025, lng: 106.7942, zoom: 13 },
    Tangerang: { lat: -6.1781, lng: 106.6298, zoom: 13 },
    "Tangerang Selatan": { lat: -6.2884, lng: 106.7161, zoom: 13 },
    Bekasi: { lat: -6.2383, lng: 106.9756, zoom: 13 },
  },

  // Kata kunci untuk deteksi tipe rumah sakit
  HOSPITAL_KEYWORDS: {
    RSUP: ["rsup", "rumah sakit umum pusat"],
    RSUD: ["rsud", "rumah sakit umum daerah"],
    RSU: ["rsu", "rumah sakit umum"],
    RSIA: ["rsia", "rumah sakit ibu dan anak", "rumah sakit bersalin"],
    RS: ["rumah sakit", "hospital", "rs "],
  },

  // Warna dan icon marker
  HOSPITAL_COLOR: "#dc2626",
  HOSPITAL_ICON: "fa-hospital",
};
