/**
 * state.js
 * Menyimpan state aplikasi yang berubah saat runtime
 */

export const AppState = {
  map: null, // Instance Leaflet map
  centerMarker: null, // Marker pusat pencarian
  hospitalMarkers: [], // Array marker rumah sakit di map
  searchCenter: null, // Koordinat pusat pencarian saat ini
  currentHospitals: [], // Data rumah sakit hasil pencarian
  isSearching: false, // Status loading saat pencarian
};
