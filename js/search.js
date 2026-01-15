/**
 * search.js
 * Mengelola logika pencarian dan filtering rumah sakit
 */

import { AppState } from "./state.js";
import { fetchHospitals } from "./api.js";
import * as MapModule from "./map.js";
import * as UIModule from "./ui.js";
import { delay } from "./utils.js";

// Minimum loading time untuk UX yang baik
const MINIMUM_LOADING_TIME = 800;

/**
 * Jalankan pencarian rumah sakit berdasarkan lokasi dan radius
 */
export async function performSearch() {
  const lat = parseFloat(document.getElementById("latitude-input").value);
  const lng = parseFloat(document.getElementById("longitude-input").value);
  const radius = parseInt(document.getElementById("radius-slider").value);

  // Validasi koordinat
  if (isNaN(lat) || isNaN(lng)) {
    UIModule.updateSearchStatus("Koordinat tidak valid", "error");
    return;
  }

  UIModule.toggleLoadingModal(true);
  AppState.isSearching = true;

  const startTime = Date.now();

  try {
    // Fetch data dari API
    const hospitals = await fetchHospitals({ lat, lng, radius });

    // Filter hanya yang benar-benar dalam radius
    const hospitalsInRadius = hospitals.filter((h) => {
      if (h.distance === null || h.distance === undefined) return false;
      return h.distance <= radius;
    });

    AppState.currentHospitals = hospitalsInRadius;

    // Ensure minimum loading time untuk UX
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, MINIMUM_LOADING_TIME - elapsedTime);
    if (remainingTime > 0) {
      await delay(remainingTime);
    }

    // Apply filters dan tampilkan hasil (ini juga akan update status message)
    applyFilters(true);
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
}

/**
 * Terapkan filter nama dan tipe rumah sakit, lalu sort berdasarkan jarak
 * @param {boolean} isNewSearch - True jika dipanggil dari pencarian baru
 */
export function applyFilters(isNewSearch = false) {
  const radius = parseInt(document.getElementById("radius-slider").value);
  let filtered = [...AppState.currentHospitals];
  const totalBeforeFilter = filtered.length;

  // Filter berdasarkan nama
  const searchQuery = document
    .getElementById("hospital-search")
    .value.toLowerCase()
    .trim();

  if (searchQuery) {
    filtered = filtered.filter((h) =>
      h.name.toLowerCase().includes(searchQuery)
    );
  }

  // Filter berdasarkan tipe
  const typeFilter = document.getElementById("hospital-type-filter").value;
  if (typeFilter !== "all") {
    filtered = filtered.filter(
      (h) => h.hospitalType.toLowerCase() === typeFilter.toLowerCase()
    );
  }

  // Sort by distance (terdekat dulu)
  filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999));

  // Update map dan UI
  MapModule.addHospitalMarkers(filtered);
  UIModule.displayResults(filtered);

  // Update status message berdasarkan hasil akhir
  if (filtered.length === 0) {
    if (totalBeforeFilter === 0) {
      UIModule.updateSearchStatus(
        "Tidak ditemukan rumah sakit di area ini. Coba perbesar radius atau ubah lokasi.",
        "info"
      );
    } else {
      // Ada data tapi tidak sesuai filter
      const filterInfo = [];
      if (searchQuery) filterInfo.push(`nama "${searchQuery}"`);
      if (typeFilter !== "all")
        filterInfo.push(`tipe ${typeFilter.toUpperCase()}`);

      UIModule.updateSearchStatus(
        `Tidak ada rumah sakit yang sesuai dengan filter (${filterInfo.join(
          ", "
        )}). Ditemukan ${totalBeforeFilter} rumah sakit dalam radius ${radius} km.`,
        "info"
      );
    }
  } else {
    // Ada hasil yang ditampilkan
    const filterApplied = searchQuery || typeFilter !== "all";
    if (filterApplied) {
      UIModule.updateSearchStatus(
        `Menampilkan ${filtered.length} dari ${totalBeforeFilter} rumah sakit dalam radius ${radius} km`,
        "success"
      );
    } else {
      UIModule.updateSearchStatus(
        `Berhasil menemukan ${filtered.length} rumah sakit dalam radius ${radius} km!`,
        "success"
      );
    }
  }
}
