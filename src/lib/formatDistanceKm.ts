export function formatDistanceKm(distanceKm?: number): string | null {
  if (distanceKm === undefined || Number.isNaN(distanceKm)) {
    return null;
  }

  return `${distanceKm.toFixed(1)}km`;
}
