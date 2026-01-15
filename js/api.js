/**
 * api.js
 * Mengelola request API dan pengolahan data dari Geoapify
 */

import { CONFIG } from "./constants.js";
import { calculateDistance } from "./utils.js";

/**
 * Fetch data rumah sakit dari Geoapify Places API
 * @param {Object} params - Parameter pencarian
 * @param {number} params.lat - Latitude pusat pencarian
 * @param {number} params.lng - Longitude pusat pencarian
 * @param {number} params.radius - Radius pencarian dalam km
 * @returns {Promise<Array>} Array data rumah sakit
 */
export async function fetchHospitals({ lat, lng, radius }) {
  if (!lat || !lng) {
    throw new Error("Koordinat tidak valid");
  }

  const radiusInMeters = radius * 1000;
  const apiUrl = `https://api.geoapify.com/v2/places?categories=building.healthcare&filter=circle:${lng},${lat},${radiusInMeters}&bias=proximity:${lng},${lat}&limit=100&apiKey=${CONFIG.GEOAPIFY_API_KEY}`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  return extractHospitalsData(data.features || [], { lat, lng });
}

/**
 * Extract dan format data rumah sakit dari response API
 * @param {Array} features - Features dari response Geoapify
 * @param {Object} centerCoords - Koordinat pusat pencarian
 * @returns {Array} Array data rumah sakit yang sudah diformat
 */
function extractHospitalsData(features, centerCoords) {
  return features
    .map((feature) => {
      const props = feature.properties;
      const coords = feature.geometry?.coordinates || [];
      const name = props.name || "";

      if (!isHospital(name)) return null;

      const distance =
        centerCoords && coords.length >= 2
          ? calculateDistance(
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
        hospitalType: detectHospitalType(name),
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
}

/**
 * Cek apakah nama place adalah rumah sakit
 * @param {string} name - Nama tempat
 * @returns {boolean} True jika merupakan rumah sakit
 */
function isHospital(name) {
  if (!name) return false;
  const nameLower = name.toLowerCase();
  const hospitalTerms = [
    "rumah sakit",
    "hospital",
    "rs ",
    "rsud",
    "rsup",
    "rsu ",
    "rsia",
  ];
  return hospitalTerms.some((term) => nameLower.includes(term));
}

/**
 * Deteksi tipe rumah sakit berdasarkan nama
 * @param {string} name - Nama rumah sakit
 * @returns {string} Tipe rumah sakit (RSUP, RSUD, RSU, RSIA, RS)
 */
function detectHospitalType(name) {
  const nameLower = name.toLowerCase();
  const { HOSPITAL_KEYWORDS } = CONFIG;

  // Cek tipe secara berurutan (prioritas)
  const typeOrder = ["RSUP", "RSUD", "RSIA", "RSU"];

  for (const type of typeOrder) {
    const keywords = HOSPITAL_KEYWORDS[type];
    if (keywords.some((keyword) => nameLower.includes(keyword))) {
      return type;
    }
  }

  return "RS";
}
