/**
 * utils.js
 * Utility functions yang digunakan di berbagai modul
 */

/**
 * Hitung jarak antara 2 koordinat menggunakan formula Haversine
 * @param {number} lat1 - Latitude titik pertama
 * @param {number} lon1 - Longitude titik pertama
 * @param {number} lat2 - Latitude titik kedua
 * @param {number} lon2 - Longitude titik kedua
 * @returns {number} Jarak dalam kilometer
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius bumi dalam km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Konversi derajat ke radian
 * @param {number} value - Nilai dalam derajat
 * @returns {number} Nilai dalam radian
 */
export function toRad(value) {
  return (value * Math.PI) / 180;
}

/**
 * Delay promise untuk minimum loading time
 * @param {number} ms - Waktu delay dalam milliseconds
 * @returns {Promise}
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format jarak ke string yang readable
 * @param {number} distance - Jarak dalam km
 * @returns {string} String jarak terformat
 */
export function formatDistance(distance) {
  if (distance === null || distance === undefined) {
    return "? km";
  }
  return `${distance.toFixed(1)} km`;
}
