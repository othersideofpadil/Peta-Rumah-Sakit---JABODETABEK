// ===========================
// KONFIGURASI APLIKASI
// ===========================
// Menyimpan semua konstanta dan pengaturan aplikasi
const CONFIG = {
  GEOAPIFY_API_KEY: window.APP_CONFIG?.GEOAPIFY_API_KEY || "", // API key dari config.js
  DEFAULT_LOCATION: { lat: -6.2088, lng: 106.8456 }, // Jakarta Pusat sebagai lokasi default
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
  HOSPITAL_COLOR: "#dc2626", // Warna merah untuk marker rumah sakit
  HOSPITAL_ICON: "fa-hospital", // Icon Font Awesome untuk marker
};

// ===========================
// STATE MANAGEMENT
// ===========================
// Menyimpan state aplikasi yang berubah saat runtime
const AppState = {
  map: null, // Instance Leaflet map
  centerMarker: null, // Marker pusat pencarian
  hospitalMarkers: [], // Array marker rumah sakit di map
  searchCenter: null, // Koordinat pusat pencarian saat ini
  currentHospitals: [], // Data rumah sakit hasil pencarian
  isSearching: false, // Status loading saat pencarian
};

// ===========================
// MAP MODULE
// ===========================
// Mengelola semua fungsi terkait peta Leaflet
const MapModule = {
  // Inisialisasi peta dengan tile layer Geoapify
  initMap: function (center) {
    AppState.map = L.map("map").setView([center.lat, center.lng], 12);
    L.tileLayer(
      `https://maps.geoapify.com/v1/tile/carto/{z}/{x}/{y}.png?apiKey=${CONFIG.GEOAPIFY_API_KEY}`,
      {
        attribution:
          'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        maxZoom: 20,
      }
    ).addTo(AppState.map);
    this.addCenterMarker(center);
    this.addMapClickListener();
  },

  // Tambahkan atau update marker pusat pencarian
  addCenterMarker: function (coords) {
    if (AppState.centerMarker) {
      AppState.map.removeLayer(AppState.centerMarker);
    }
    const centerIcon = L.divIcon({
      className: "center-marker",
      html: '<div class="center-marker-icon"><i class="fas fa-crosshairs"></i></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    AppState.centerMarker = L.marker([coords.lat, coords.lng], {
      icon: centerIcon,
    })
      .addTo(AppState.map)
      .bindPopup("<b>Pusat Pencarian</b><br>Klik di peta untuk mengubah lokasi")
      .openPopup();
    AppState.searchCenter = coords;
  },

  // Event listener untuk klik pada peta (ubah pusat pencarian)
  addMapClickListener: function () {
    AppState.map.on("click", (e) => {
      const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
      this.addCenterMarker(coords);
      document.getElementById("latitude-input").value = coords.lat.toFixed(6);
      document.getElementById("longitude-input").value = coords.lng.toFixed(6);
      UIModule.updateSearchStatus(
        'Lokasi pusat pencarian diperbarui. Klik "Cari Rumah Sakit" untuk mencari.',
        "info"
      );
    });
  },

  // Tambahkan semua marker rumah sakit ke peta
  addHospitalMarkers: function (hospitals) {
    this.clearHospitalMarkers();
    AppState.hospitalMarkers = [];
    hospitals.forEach((hospital) => {
      const marker = this.createHospitalMarker(hospital);
      if (marker) {
        AppState.hospitalMarkers.push(marker);
        marker.addTo(AppState.map);
      }
    });
  },

  // Buat marker individual untuk rumah sakit dengan popup info lengkap
  createHospitalMarker: function (hospital) {
    if (!hospital.lat || !hospital.lon) return null;

    const hospitalIcon = L.divIcon({
      className: "hospital-marker",
      html: `<div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style="background-color: ${CONFIG.HOSPITAL_COLOR}">
                     <i class="fas ${CONFIG.HOSPITAL_ICON} text-white"></i>
                   </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    const popupContent = `
            <div style="min-width: 250px; padding: 8px;">
                ${
                  hospital.name
                    ? `<h3 style="font-weight: bold; font-size: 1.1rem; margin-bottom: 10px; color: #1f2937;">
                        <i class="fas fa-hospital text-red-600 mr-2"></i>${hospital.name}
                      </h3>`
                    : ""
                }
                ${
                  hospital.hospitalType
                    ? `<p style="margin-bottom: 6px; font-size: 0.9rem; color: #4b5563;">
                        <strong>Tipe:</strong> 
                        <span class="text-red-600 font-semibold">${hospital.hospitalType}</span>
                      </p>`
                    : ""
                }
                ${
                  hospital.address_line2 || hospital.formatted
                    ? `<p style="margin-bottom: 6px; font-size: 0.9rem; color: #4b5563;"><strong>Alamat:</strong> ${
                        hospital.address_line2 || hospital.formatted
                      }</p>`
                    : ""
                }
                ${
                  hospital.distance
                    ? `<p style="margin-bottom: 6px; font-size: 0.9rem; color: #4b5563;"><strong>Jarak dari pusat:</strong> ${hospital.distance.toFixed(
                        2
                      )} km</p>`
                    : ""
                }
                ${
                  hospital.website
                    ? `<p style="margin-bottom: 6px; font-size: 0.9rem; color: #4b5563;"><strong>Website:</strong> <a href="${hospital.website}" target="_blank" style="color: #dc2626; text-decoration: underline;">Kunjungi</a></p>`
                    : ""
                }
                ${
                  hospital.phone
                    ? `<p style="margin-bottom: 6px; font-size: 0.9rem; color: #4b5563;"><strong>Telepon:</strong> ${hospital.phone}</p>`
                    : ""
                }
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${
                      hospital.lat
                    },${hospital.lon}" 
                       target="_blank" 
                       style="display: block; width: 100%; background-color: #dc2626; color: white; text-align: center; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.875rem; transition: background-color 0.2s;"
                       onmouseover="this.style.backgroundColor='#b91c1c'"
                       onmouseout="this.style.backgroundColor='#dc2626'">
                        <i class="fas fa-directions" style="margin-right: 8px;"></i>Navigasi ke Rumah Sakit
                    </a>
                </div>
            </div>
        `;

    const marker = L.marker([hospital.lat, hospital.lon], {
      icon: hospitalIcon,
    }).bindPopup(popupContent);

    marker.on("click", () => {
      this.highlightSidebarItem(hospital.properties?.place_id || hospital.id);
    });

    return marker;
  },

  // Hapus semua marker rumah sakit dari peta
  clearHospitalMarkers: function () {
    AppState.hospitalMarkers.forEach((marker) => {
      if (marker && AppState.map) {
        AppState.map.removeLayer(marker);
      }
    });
    AppState.hospitalMarkers = [];
  },

  // Highlight item rumah sakit di sidebar saat marker diklik
  highlightSidebarItem: function (hospitalId) {
    document.querySelectorAll(".result-item").forEach((item) => {
      item.classList.remove("bg-red-100", "border-red-400");
    });
    const targetItem = document.querySelector(
      `[data-hospital-id="${hospitalId}"]`
    );
    if (targetItem) {
      targetItem.classList.add("bg-red-100", "border-red-400");
      targetItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  },

  // Fokuskan peta ke koordinat tertentu dengan zoom level
  focusMap: function (coords, zoom = 14) {
    if (AppState.map) {
      AppState.map.setView([coords.lat, coords.lng], zoom);
    }
  },

  // Dapatkan koordinat pusat peta saat ini
  getMapCenter: function () {
    if (AppState.map) {
      const center = AppState.map.getCenter();
      return { lat: center.lat, lng: center.lng };
    }
    return CONFIG.DEFAULT_LOCATION;
  },
};

// ===========================
// GEOAPIFY API MODULE
// ===========================
// Mengelola request API dan pengolahan data dari Geoapify
const GeoapifyModule = {
  // Fetch data rumah sakit dari Geoapify Places API
  fetchHospitals: async function (params) {
    const { lat, lng, radius } = params;
    if (!lat || !lng) throw new Error("Koordinat tidak valid");

    const radiusInMeters = radius * 1000;
    const apiUrl = `https://api.geoapify.com/v2/places?categories=building.healthcare&filter=circle:${lng},${lat},${radiusInMeters}&bias=proximity:${lng},${lat}&limit=100&apiKey=${CONFIG.GEOAPIFY_API_KEY}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return this.extractHospitalsData(data.features || [], { lat, lng });
  },

  // Extract dan format data rumah sakit dari response API
  extractHospitalsData: function (features, centerCoords) {
    return features
      .map((feature) => {
        const props = feature.properties;
        const coords = feature.geometry?.coordinates || [];
        const name = props.name || "";

        if (!this.isHospital(name)) return null;

        const distance =
          centerCoords && coords.length >= 2
            ? this.calculateDistance(
                centerCoords.lat,
                centerCoords.lng,
                coords[1],
                coords[0]
              )
            : null;

        return {
          id: props.place_id,
          name,
          category: props.categories?.[0] || "",
          hospitalType: this.detectHospitalType(name),
          lat: coords[1],
          lon: coords[0],
          address_line2: props.address_line2,
          formatted: props.formatted,
          website: props.website,
          phone: props.phone,
          distance,
          properties: props,
        };
      })
      .filter((h) => h !== null);
  },

  // Cek apakah nama place adalah rumah sakit
  isHospital: function (name) {
    if (!name) return false;
    const nameLower = name.toLowerCase();
    return (
      nameLower.includes("rumah sakit") ||
      nameLower.includes("hospital") ||
      nameLower.includes("rs ") ||
      nameLower.includes("rsud") ||
      nameLower.includes("rsup") ||
      nameLower.includes("rsu ") ||
      nameLower.includes("rsia")
    );
  },

  // Deteksi tipe rumah sakit berdasarkan nama (RSUP, RSUD, RSU, RSIA, RS)
  detectHospitalType: function (name) {
    const nameLower = name.toLowerCase();

    for (const keyword of CONFIG.HOSPITAL_KEYWORDS.RSUP) {
      if (nameLower.includes(keyword)) return "RSUP";
    }
    for (const keyword of CONFIG.HOSPITAL_KEYWORDS.RSUD) {
      if (nameLower.includes(keyword)) return "RSUD";
    }
    for (const keyword of CONFIG.HOSPITAL_KEYWORDS.RSIA) {
      if (nameLower.includes(keyword)) return "RSIA";
    }
    for (const keyword of CONFIG.HOSPITAL_KEYWORDS.RSU) {
      if (nameLower.includes(keyword)) return "RSU";
    }
    return "RS";
  },

  // Hitung jarak antara 2 koordinat menggunakan formula Haversine (dalam km)
  calculateDistance: function (lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // Konversi derajat ke radian
  toRad: function (value) {
    return (value * Math.PI) / 180;
  },
};

// ===========================
// UI MODULE
// ===========================
// Mengelola semua interaksi UI dan tampilan
const UIModule = {
  // Setup semua event listeners untuk elemen UI
  initEventListeners: function () {
    document.getElementById("search-btn").addEventListener("click", () => {
      SearchModule.performSearch();
    });

    document
      .getElementById("clear-filters-btn")
      .addEventListener("click", () => {
        document.getElementById("hospital-search").value = "";
        document.getElementById("hospital-type-filter").value = "all";
        UIModule.updateSearchStatus(
          'Filter direset. Klik "Cari Rumah Sakit" untuk mencari ulang.',
          "info"
        );
      });

    document.getElementById("radius-slider").addEventListener("input", (e) => {
      document.getElementById(
        "radius-value"
      ).textContent = `${e.target.value} km`;
    });

    document
      .getElementById("location-select")
      .addEventListener("change", (e) => {
        const location = CONFIG.PREDEFINED_LOCATIONS[e.target.value];
        if (location) {
          this.setSearchCenter(location);
          MapModule.focusMap(location, location.zoom);
          UIModule.updateSearchStatus(
            `Lokasi diubah ke ${e.target.value}. Klik "Cari Rumah Sakit" untuk mencari.`,
            "info"
          );
        }
      });

    // Filter pencarian nama dan tipe real-time
    document.getElementById("hospital-search").addEventListener("input", () => {
      if (AppState.currentHospitals.length > 0) SearchModule.applyFilters();
    });

    document
      .getElementById("hospital-type-filter")
      .addEventListener("change", () => {
        if (AppState.currentHospitals.length > 0) SearchModule.applyFilters();
      });

    document.getElementById("use-default-btn").addEventListener("click", () => {
      this.setSearchCenter(CONFIG.DEFAULT_LOCATION);
      UIModule.updateSearchStatus(
        "Lokasi default Jakarta Pusat diterapkan.",
        "info"
      );
    });

    document
      .getElementById("use-map-center-btn")
      .addEventListener("click", () => {
        this.setSearchCenter(MapModule.getMapCenter());
        UIModule.updateSearchStatus(
          "Pusat peta diterapkan sebagai lokasi pencarian.",
          "info"
        );
      });

    document
      .getElementById("latitude-input")
      .addEventListener("change", (e) => {
        const lat = parseFloat(e.target.value);
        const lng = parseFloat(
          document.getElementById("longitude-input").value
        );
        if (!isNaN(lat) && !isNaN(lng)) MapModule.addCenterMarker({ lat, lng });
      });

    document
      .getElementById("longitude-input")
      .addEventListener("change", (e) => {
        const lat = parseFloat(document.getElementById("latitude-input").value);
        const lng = parseFloat(e.target.value);
        if (!isNaN(lat) && !isNaN(lng)) MapModule.addCenterMarker({ lat, lng });
      });

    document.addEventListener("click", (e) => {
      if (e.target.closest(".result-navigate-btn")) return;
      const resultItemHeader = e.target.closest(".result-item-header");
      if (resultItemHeader) {
        const hospitalId =
          resultItemHeader.closest(".result-item").dataset.hospitalId;
        this.centerMapOnHospital(hospitalId);
      }
    });
  },

  // Set koordinat pusat pencarian dan update input fields
  setSearchCenter: function (coords) {
    document.getElementById("latitude-input").value = coords.lat.toFixed(6);
    document.getElementById("longitude-input").value = coords.lng.toFixed(6);
    MapModule.addCenterMarker(coords);
    AppState.searchCenter = coords;
  },

  // Toggle tampilan loading spinner pada button
  toggleLoadingModal: function (show) {
    const searchBtn = document.getElementById("search-btn");
    const resultsContainer = document.getElementById("results-container");

    if (show) {
      searchBtn.disabled = true;
      searchBtn.classList.add("opacity-75", "cursor-wait");
      searchBtn.innerHTML =
        '<div class="flex items-center justify-center"><svg class="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Mencari...</div>';
      resultsContainer.classList.add("hidden");
    } else {
      searchBtn.disabled = false;
      searchBtn.classList.remove("opacity-75", "cursor-wait");
      searchBtn.innerHTML =
        '<i class="fas fa-hospital mr-2"></i>Cari Rumah Sakit';
    }
  },

  // Fokuskan peta ke rumah sakit yang dipilih dan buka popup
  centerMapOnHospital: function (hospitalId) {
    const hospital = AppState.currentHospitals.find(
      (h) => h.id === hospitalId || h.properties?.place_id === hospitalId
    );
    if (!hospital || !AppState.map) return;

    const marker = AppState.hospitalMarkers.find((m) => {
      const pos = m.getLatLng();
      return pos.lat === hospital.lat && pos.lng === hospital.lon;
    });

    if (marker) {
      AppState.map.setView([hospital.lat, hospital.lon], 16);
      marker.openPopup();
    }
  },

  // Tampilkan hasil pencarian rumah sakit di sidebar
  displayResults: function (hospitals) {
    const resultsContainer = document.getElementById("results-container");
    const resultsList = document.getElementById("results-list");
    const searchResultsInfo = document.getElementById("search-results-info");

    resultsList.innerHTML = "";

    if (hospitals.length === 0) {
      const emptyTemplate = document.getElementById("empty-state-template");
      const emptyContent = emptyTemplate.content.cloneNode(true);
      resultsList.appendChild(emptyContent);
      searchResultsInfo.textContent = "Tidak ditemukan rumah sakit";
    } else {
      hospitals.forEach((hospital) => {
        const resultItem = this.createResultItem(hospital);
        resultsList.appendChild(resultItem);
      });

      // Count by type
      const typeCount = {};
      hospitals.forEach((h) => {
        const type = h.hospitalType || "RS";
        typeCount[type] = (typeCount[type] || 0) + 1;
      });

      const typeCountText = Object.entries(typeCount)
        .map(
          ([type, count]) =>
            `<span class="text-red-600">${count} ${type}</span>`
        )
        .join(", ");

      searchResultsInfo.innerHTML = `
                Ditemukan <strong>${hospitals.length}</strong> rumah sakit:<br>
                ${typeCountText}
            `;
    }
    resultsContainer.classList.remove("hidden");
  },

  // Buat HTML element untuk item rumah sakit di sidebar
  createResultItem: function (hospital) {
    const template = document.getElementById("result-item-template");
    const item = template.content.cloneNode(true);

    const container = item.querySelector(".result-item");
    container.dataset.hospitalId = hospital.id || hospital.properties?.place_id;

    item.querySelector(".result-name").textContent =
      hospital.name || "Rumah Sakit";
    item.querySelector(".result-type").textContent =
      hospital.hospitalType || "RS";
    item.querySelector(".result-distance span").textContent = hospital.distance
      ? `${hospital.distance.toFixed(1)} km`
      : "? km";

    const addressElement = item.querySelector(".result-address");
    if (hospital.address_line2 || hospital.formatted) {
      addressElement.textContent = hospital.address_line2 || hospital.formatted;
    } else {
      addressElement.remove();
    }

    const navigateBtn = item.querySelector(".result-navigate-btn");
    navigateBtn.href = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`;
    navigateBtn.target = "_blank";
    navigateBtn.addEventListener("click", (e) => e.stopPropagation());

    return item;
  },

  // Update status message dengan icon sesuai tipe (success/error/info)
  updateSearchStatus: function (message, type = "info") {
    const searchResultsInfo = document.getElementById("search-results-info");
    let icon = "";
    switch (type) {
      case "success":
        icon = '<i class="fas fa-check-circle text-green-500 mr-2"></i>';
        break;
      case "error":
        icon = '<i class="fas fa-exclamation-circle text-red-500 mr-2"></i>';
        break;
      default:
        icon = '<i class="fas fa-info-circle text-blue-500 mr-2"></i>';
    }
    searchResultsInfo.innerHTML = `${icon}${message}`;
  },
};

// ===========================
// SEARCH MODULE
// ===========================
// Mengelola logika pencarian dan filtering rumah sakit
const SearchModule = {
  // Jalankan pencarian rumah sakit berdasarkan lokasi dan radius
  performSearch: async function () {
    const lat = parseFloat(document.getElementById("latitude-input").value);
    const lng = parseFloat(document.getElementById("longitude-input").value);
    const radius = parseInt(document.getElementById("radius-slider").value);

    if (isNaN(lat) || isNaN(lng)) {
      UIModule.updateSearchStatus("Koordinat tidak valid", "error");
      return;
    }

    UIModule.toggleLoadingModal(true);
    AppState.isSearching = true;

    const startTime = Date.now();
    const minimumLoadingTime = 800;

    try {
      const hospitals = await GeoapifyModule.fetchHospitals({
        lat,
        lng,
        radius,
      });
      AppState.currentHospitals = hospitals;

      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);
      if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      }

      this.applyFilters();

      const message =
        hospitals.length === 0
          ? "Tidak ditemukan rumah sakit di area ini. Coba perbesar radius atau ubah lokasi."
          : `Berhasil menemukan ${hospitals.length} rumah sakit!`;
      UIModule.updateSearchStatus(
        message,
        hospitals.length > 0 ? "success" : "info"
      );
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      UIModule.updateSearchStatus(
        `Terjadi kesalahan: ${error.message}. Silakan coba lagi.`,
        "error"
      );
      UIModule.displayResults([]);
      MapModule.addHospitalMarkers([]);
    } finally {
      UIModule.toggleLoadingModal(false);
      AppState.isSearching = false;
    }
  },

  // Terapkan filter nama dan tipe rumah sakit, lalu sort berdasarkan jarak
  applyFilters: function () {
    let filtered = [...AppState.currentHospitals];

    const searchQuery = document
      .getElementById("hospital-search")
      .value.toLowerCase()
      .trim();
    if (searchQuery) {
      filtered = filtered.filter((h) =>
        h.name.toLowerCase().includes(searchQuery)
      );
    }

    const typeFilter = document.getElementById("hospital-type-filter").value;
    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (h) => h.hospitalType.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    // Sort by distance (terdekat)
    filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999));

    MapModule.addHospitalMarkers(filtered);
    UIModule.displayResults(filtered);

    if (filtered.length === 0 && AppState.currentHospitals.length > 0) {
      UIModule.updateSearchStatus(
        "Tidak ada rumah sakit yang sesuai dengan filter",
        "info"
      );
    }
  },
};

// ===========================
// INISIALISASI APLIKASI
// ===========================
// Jalankan saat DOM sudah ready
document.addEventListener("DOMContentLoaded", function () {
  try {
    MapModule.initMap(CONFIG.DEFAULT_LOCATION);
    UIModule.initEventListeners();
    UIModule.setSearchCenter(CONFIG.DEFAULT_LOCATION);
  } catch (error) {
    console.error("Error initializing app:", error);
    alert("Gagal menginisialisasi aplikasi: " + error.message);
  }
});
