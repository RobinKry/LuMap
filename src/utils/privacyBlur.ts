/**
 * Offsets exact coordinates so private / residential locations
 * are never shown precisely on the map.
 */
export function getBlurredCoordinates(
  lat: number,
  lng: number,
): { latitude: number; longitude: number } {
  const seed = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453)
  const frac = seed - Math.floor(seed)
  const magnitude = 0.0025 + frac * 0.001 // 0.0025 … 0.0035
  const angle = (seed % 1) * Math.PI * 2

  return {
    latitude: lat + Math.cos(angle) * magnitude,
    longitude: lng + Math.sin(angle) * magnitude,
  }
}
