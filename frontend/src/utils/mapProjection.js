/**
 * Proyección equirectangular recortada que comparten el mapa de puntos y las
 * marcas de amenazas, para que ambos usen exactamente la misma escala.
 * Se recortan los polos: no hay datos ahí y solo agregan espacio vacío.
 */
export const LAT_SPAN = 150

export function projectToPercent(lat, lon) {
  return {
    x: ((lon + 180) / 360) * 100,
    y: ((LAT_SPAN / 2 - lat) / LAT_SPAN) * 100,
  }
}
