/**
 * ui.js
 * Mengelola semua interaksi UI dan tampilan
 */

import { CONFIG } from "./constants.js";
import { AppState } from "./state.js";
import * as MapModule from "./map.js";
import { formatDistance } from "./utils.js";

// Lazy import untuk menghindari circular dependency
let SearchModule = null;

async function getSearchModule() {
  if (!SearchModule) {
    SearchModule = await import("./search.js");
  }
  return SearchModule;
}

/**
 * Setup semua event listeners untuk elemen UI
 */
export function initEventListeners() {
  // Tombol cari rumah sakit
  document.getElementById("search-btn").addEventListener("click", async () => {
    const search = await getSearchModule();
    search.performSearch();
  });

  // Tombol reset filter
  document.getElementById("clear-filters-btn").addEventListener("click", () => {
    document.getElementById("hospital-search").value = "";
    document.getElementById("hospital-type-filter").value = "all";
    updateSearchStatus(
      'Filter direset. Klik "Cari Rumah Sakit" untuk mencari ulang.',
      "info"
    );
  });

  // Slider radius
  document.getElementById("radius-slider").addEventListener("input", (e) => {
    document.getElementById(
      "radius-value"
    ).textContent = `${e.target.value} km`;
  });

  // Pilihan wilayah
  document.getElementById("location-select").addEventListener("change", (e) => {
    const location = CONFIG.PREDEFINED_LOCATIONS[e.target.value];
    if (location) {
      setSearchCenter(location);
      MapModule.focusMap(location, location.zoom);
      updateSearchStatus(
        `Lokasi diubah ke ${e.target.value}. Klik "Cari Rumah Sakit" untuk mencari.`,
        "info"
      );
    }
  });

  // Filter real-time
  document
    .getElementById("hospital-search")
    .addEventListener("input", async () => {
      if (AppState.currentHospitals.length > 0) {
        const search = await getSearchModule();
        search.applyFilters();
      }
    });

  document
    .getElementById("hospital-type-filter")
    .addEventListener("change", async () => {
      if (AppState.currentHospitals.length > 0) {
        const search = await getSearchModule();
        search.applyFilters();
      }
    });

  // Tombol lokasi default
  document.getElementById("use-default-btn").addEventListener("click", () => {
    setSearchCenter(CONFIG.DEFAULT_LOCATION);
    updateSearchStatus("Lokasi default Jakarta Pusat diterapkan.", "info");
  });

  // Tombol pusat peta
  document
    .getElementById("use-map-center-btn")
    .addEventListener("click", () => {
      setSearchCenter(MapModule.getMapCenter());
      updateSearchStatus(
        "Pusat peta diterapkan sebagai lokasi pencarian.",
        "info"
      );
    });

  // Input koordinat manual
  document
    .getElementById("latitude-input")
    .addEventListener("change", handleCoordinateChange);
  document
    .getElementById("longitude-input")
    .addEventListener("change", handleCoordinateChange);

  // Klik pada hasil pencarian
  document.addEventListener("click", handleResultItemClick);
}

/**
 * Handle perubahan input koordinat
 */
function handleCoordinateChange() {
  const lat = parseFloat(document.getElementById("latitude-input").value);
  const lng = parseFloat(document.getElementById("longitude-input").value);
  if (!isNaN(lat) && !isNaN(lng)) {
    MapModule.addCenterMarker({ lat, lng });
  }
}

/**
 * Handle klik pada item hasil pencarian
 * @param {Event} e - Click event
 */
function handleResultItemClick(e) {
  if (e.target.closest(".result-navigate-btn")) return;

  const resultItemHeader = e.target.closest(".result-item-header");
  if (resultItemHeader) {
    const hospitalId =
      resultItemHeader.closest(".result-item").dataset.hospitalId;
    centerMapOnHospital(hospitalId);
  }
}

/**
 * Set koordinat pusat pencarian dan update input fields
 * @param {Object} coords - Koordinat {lat, lng}
 */
export function setSearchCenter(coords) {
  document.getElementById("latitude-input").value = coords.lat.toFixed(6);
  document.getElementById("longitude-input").value = coords.lng.toFixed(6);
  MapModule.addCenterMarker(coords);
  AppState.searchCenter = coords;
}

/**
 * Toggle tampilan loading spinner pada button
 * @param {boolean} show - True untuk menampilkan loading
 */
export function toggleLoadingModal(show) {
  const searchBtn = document.getElementById("search-btn");
  const resultsContainer = document.getElementById("results-container");

  if (show) {
    searchBtn.disabled = true;
    searchBtn.classList.add("opacity-75", "cursor-wait");
    searchBtn.innerHTML = `
      <div class="flex items-center justify-center">
        <svg class="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Mencari...
      </div>`;
    resultsContainer.classList.add("hidden");
  } else {
    searchBtn.disabled = false;
    searchBtn.classList.remove("opacity-75", "cursor-wait");
    searchBtn.innerHTML =
      '<i class="fas fa-hospital mr-2"></i>Cari Rumah Sakit';
  }
}

/**
 * Fokuskan peta ke rumah sakit yang dipilih dan buka popup
 * @param {string} hospitalId - ID rumah sakit
 */
function centerMapOnHospital(hospitalId) {
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
}

/**
 * Tampilkan hasil pencarian rumah sakit di sidebar
 * @param {Array} hospitals - Array data rumah sakit
 */
export function displayResults(hospitals) {
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
      const resultItem = createResultItem(hospital);
      resultsList.appendChild(resultItem);
    });

    // Count by type
    const typeCount = countByType(hospitals);
    const typeCountText = Object.entries(typeCount)
      .map(
        ([type, count]) => `<span class="text-red-600">${count} ${type}</span>`
      )
      .join(", ");

    searchResultsInfo.innerHTML = `
      Ditemukan <strong>${hospitals.length}</strong> rumah sakit:<br>
      ${typeCountText}
    `;
  }

  resultsContainer.classList.remove("hidden");
}

/**
 * Hitung jumlah rumah sakit per tipe
 * @param {Array} hospitals - Array data rumah sakit
 * @returns {Object} Object dengan key tipe dan value jumlah
 */
function countByType(hospitals) {
  const typeCount = {};
  hospitals.forEach((h) => {
    const type = h.hospitalType || "RS";
    typeCount[type] = (typeCount[type] || 0) + 1;
  });
  return typeCount;
}

/**
 * Buat HTML element untuk item rumah sakit di sidebar
 * @param {Object} hospital - Data rumah sakit
 * @returns {DocumentFragment} Document fragment dengan item
 */
function createResultItem(hospital) {
  const template = document.getElementById("result-item-template");
  const item = template.content.cloneNode(true);

  const container = item.querySelector(".result-item");
  container.dataset.hospitalId = hospital.id || hospital.properties?.place_id;

  item.querySelector(".result-name").textContent =
    hospital.name || "Rumah Sakit";
  item.querySelector(".result-type").textContent =
    hospital.hospitalType || "RS";
  item.querySelector(".result-distance span").textContent = formatDistance(
    hospital.distance
  );

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
}

/**
 * Update status message dengan icon sesuai tipe
 * @param {string} message - Pesan status
 * @param {string} type - Tipe status (success/error/info)
 */
export function updateSearchStatus(message, type = "info") {
  const searchResultsInfo = document.getElementById("search-results-info");

  const icons = {
    success: '<i class="fas fa-check-circle text-green-500 mr-2"></i>',
    error: '<i class="fas fa-exclamation-circle text-red-500 mr-2"></i>',
    info: '<i class="fas fa-info-circle text-blue-500 mr-2"></i>',
  };

  const icon = icons[type] || icons.info;
  searchResultsInfo.innerHTML = `${icon}${message}`;
}
