/**
 * map.js
 * Mengelola semua fungsi terkait peta Leaflet
 */

import { CONFIG } from "./constants.js";
import { AppState } from "./state.js";

/**
 * Inisialisasi peta dengan tile layer Geoapify
 * @param {Object} center - Koordinat pusat peta {lat, lng}
 */
export function initMap(center) {
  AppState.map = L.map("map").setView([center.lat, center.lng], 12);

  L.tileLayer(
    `https://maps.geoapify.com/v1/tile/carto/{z}/{x}/{y}.png?apiKey=${CONFIG.GEOAPIFY_API_KEY}`,
    {
      attribution:
        'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      maxZoom: 20,
    }
  ).addTo(AppState.map);

  addCenterMarker(center);
  addMapClickListener();
}

/**
 * Tambahkan atau update marker pusat pencarian
 * @param {Object} coords - Koordinat marker {lat, lng}
 */
export function addCenterMarker(coords) {
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
}

/**
 * Event listener untuk klik pada peta (ubah pusat pencarian)
 */
function addMapClickListener() {
  AppState.map.on("click", (e) => {
    const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
    addCenterMarker(coords);

    document.getElementById("latitude-input").value = coords.lat.toFixed(6);
    document.getElementById("longitude-input").value = coords.lng.toFixed(6);

    // Import dinamis untuk menghindari circular dependency
    import("./ui.js").then(({ updateSearchStatus }) => {
      updateSearchStatus(
        'Lokasi pusat pencarian diperbarui. Klik "Cari Rumah Sakit" untuk mencari.',
        "info"
      );
    });
  });
}

/**
 * Tambahkan semua marker rumah sakit ke peta
 * @param {Array} hospitals - Array data rumah sakit
 */
export function addHospitalMarkers(hospitals) {
  clearHospitalMarkers();
  AppState.hospitalMarkers = [];

  hospitals.forEach((hospital) => {
    const marker = createHospitalMarker(hospital);
    if (marker) {
      AppState.hospitalMarkers.push(marker);
      marker.addTo(AppState.map);
    }
  });
}

/**
 * Buat marker individual untuk rumah sakit dengan popup info lengkap
 * @param {Object} hospital - Data rumah sakit
 * @returns {L.Marker|null} Leaflet marker atau null
 */
function createHospitalMarker(hospital) {
  if (!hospital.lat || !hospital.lon) return null;

  const hospitalIcon = L.divIcon({
    className: "hospital-marker",
    html: `<div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style="background-color: ${CONFIG.HOSPITAL_COLOR}">
             <i class="fas ${CONFIG.HOSPITAL_ICON} text-white"></i>
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

  const popupContent = createPopupContent(hospital);
  const marker = L.marker([hospital.lat, hospital.lon], {
    icon: hospitalIcon,
  }).bindPopup(popupContent);

  marker.on("click", () => {
    highlightSidebarItem(hospital.properties?.place_id || hospital.id);
  });

  return marker;
}

/**
 * Buat HTML content untuk popup marker
 * @param {Object} hospital - Data rumah sakit
 * @returns {string} HTML string untuk popup
 */
function createPopupContent(hospital) {
  return `
    <div style="min-width: 250px; padding: 8px;">
      ${
        hospital.name
          ? `
        <h3 style="font-weight: bold; font-size: 1.1rem; margin-bottom: 10px; color: #1f2937;">
          <i class="fas fa-hospital text-red-600 mr-2"></i>${hospital.name}
        </h3>`
          : ""
      }
      ${
        hospital.hospitalType
          ? `
        <p style="margin-bottom: 6px; font-size: 0.9rem; color: #4b5563;">
          <strong>Tipe:</strong> 
          <span class="text-red-600 font-semibold">${hospital.hospitalType}</span>
        </p>`
          : ""
      }
      ${
        hospital.address_line2 || hospital.formatted
          ? `
        <p style="margin-bottom: 6px; font-size: 0.9rem; color: #4b5563;">
          <strong>Alamat:</strong> ${
            hospital.address_line2 || hospital.formatted
          }
        </p>`
          : ""
      }
      ${
        hospital.distance
          ? `
        <p style="margin-bottom: 6px; font-size: 0.9rem; color: #4b5563;">
          <strong>Jarak dari pusat:</strong> ${hospital.distance.toFixed(2)} km
        </p>`
          : ""
      }
      ${
        hospital.website
          ? `
        <p style="margin-bottom: 6px; font-size: 0.9rem; color: #4b5563;">
          <strong>Website:</strong> 
          <a href="${hospital.website}" target="_blank" style="color: #dc2626; text-decoration: underline;">Kunjungi</a>
        </p>`
          : ""
      }
      ${
        hospital.phone
          ? `
        <p style="margin-bottom: 6px; font-size: 0.9rem; color: #4b5563;">
          <strong>Telepon:</strong> ${hospital.phone}
        </p>`
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
}

/**
 * Hapus semua marker rumah sakit dari peta
 */
export function clearHospitalMarkers() {
  AppState.hospitalMarkers.forEach((marker) => {
    if (marker && AppState.map) {
      AppState.map.removeLayer(marker);
    }
  });
  AppState.hospitalMarkers = [];
}

/**
 * Highlight item rumah sakit di sidebar saat marker diklik
 * @param {string} hospitalId - ID rumah sakit
 */
function highlightSidebarItem(hospitalId) {
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
}

/**
 * Fokuskan peta ke koordinat tertentu dengan zoom level
 * @param {Object} coords - Koordinat {lat, lng}
 * @param {number} zoom - Zoom level
 */
export function focusMap(coords, zoom = 14) {
  if (AppState.map) {
    AppState.map.setView([coords.lat, coords.lng], zoom);
  }
}

/**
 * Dapatkan koordinat pusat peta saat ini
 * @returns {Object} Koordinat {lat, lng}
 */
export function getMapCenter() {
  if (AppState.map) {
    const center = AppState.map.getCenter();
    return { lat: center.lat, lng: center.lng };
  }
  return CONFIG.DEFAULT_LOCATION;
}
