/**
 * Retourne le chemin de l'image PNG associée au type de véhicule
 * @param vehicleTypeCode - Le code du type de véhicule (VSAV, FPT, EPA, VTU, etc.)
 * @returns Le chemin de l'image dans le dossier public/vehicles
 */
export function getVehicleImagePath(
  vehicleTypeCode: string | undefined,
): string {
  if (!vehicleTypeCode) {
    return "/vehicles/vehicle_VTU.png"; // Image par défaut
  }

  // Normaliser le code pour gérer les cas spéciaux (espaces, tirets, casse, etc.)
  const normalizedCode = vehicleTypeCode
    .replace(/\s+/g, "_") // Remplacer les espaces par des underscores
    .replace(/-/g, "_") // Remplacer les tirets par des underscores
    .toUpperCase(); // Normaliser en majuscules

  return `/vehicles/vehicle_${normalizedCode}.png`;
}

/**
 * Retourne le chemin de l'image PNG vue de dessus associée au type de véhicule
 * @param vehicleTypeCode - Le code du type de véhicule (VSAV, FPT, EPA, VTU, etc.)
 * @returns Le chemin de l'image vue de dessus dans le dossier public/vehicles
 */
export function getVehicleImagePathTopView(
  vehicleTypeCode: string | undefined,
): string {
  if (!vehicleTypeCode) {
    return "/vehicles/vehicle_VTU_vue_dessus.png"; // Image par défaut
  }

  // Normaliser le code
  const normalizedCode = vehicleTypeCode
    .replace(/\s+/g, "_")
    .replace(/-/g, "_")
    .toUpperCase();

  return `/vehicles/vehicle_${normalizedCode}_vue_dessus.png`;
}
