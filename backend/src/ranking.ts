import { SearchFilters, ServiceSearchResult } from "./types";

export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

export function calculateScore(result: Pick<ServiceSearchResult, "bestPrice" | "etaMinutes" | "distanceKm" | "rating">): number {
  const pricePenalty = result.bestPrice / 500;
  const etaPenalty = result.etaMinutes / 5;
  const distancePenalty = result.distanceKm * 8;
  const ratingBonus = result.rating * 16;
  return Math.round(ratingBonus - pricePenalty - etaPenalty - distancePenalty);
}

export function applyPresetSort(results: ServiceSearchResult[], preset: string | undefined): ServiceSearchResult[] {
  if (!preset) {
    return results.sort((a, b) => b.score - a.score);
  }

  switch (preset) {
    case "cheapest":
      return results.sort((a, b) => a.bestPrice - b.bestPrice);
    case "nearest":
      return results.sort((a, b) => a.distanceKm - b.distanceKm);
    case "fastest":
      return results.sort((a, b) => a.etaMinutes - b.etaMinutes);
    case "verified":
      return results.sort((a, b) => Number(b.verified) - Number(a.verified) || b.score - a.score);
    default:
      return results.sort((a, b) => b.score - a.score);
  }
}

export function shouldIncludeByFilters(result: ServiceSearchResult, filters: SearchFilters): boolean {
  if (filters.maxPrice && result.bestPrice > filters.maxPrice) return false;
  if (filters.radiusKm && result.distanceKm > filters.radiusKm) return false;
  if (filters.expressRepair && !result.expressRepair) return false;
  if (filters.verifiedOnly && !result.verified) return false;
  return true;
}
