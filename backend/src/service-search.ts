import { accessoryPrices, repairPrices, serviceCenters } from "./data";
import { applyPresetSort, calculateScore, distanceKm, shouldIncludeByFilters } from "./ranking";
import { SearchFilters, ServiceSearchResult } from "./types";

export type SearchServicesResult = {
  items: ServiceSearchResult[];
  /** Сработал fallback: строгие фильтры дали пусто, показали варианты без лимита цены/радиуса. */
  fallbackUsed: boolean;
};

export function searchServices(filters: SearchFilters, preset?: string): SearchServicesResult {
  const matched = serviceCenters
    .map((center) => {
      const prices = repairPrices.filter((price) => {
        if (price.serviceCenterId !== center.id) return false;
        if (filters.brand && price.brand !== filters.brand) return false;
        if (filters.repairType && price.repairType !== filters.repairType) return false;
        return true;
      });

      if (prices.length === 0) return null;

      const best = prices.reduce((acc, item) => (item.price < acc.price ? item : acc), prices[0]);
      const km = distanceKm(filters.lat, filters.lng, center.lat, center.lng);
      const result: ServiceSearchResult = {
        ...center,
        bestPrice: best.price,
        etaMinutes: best.etaMinutes,
        distanceKm: Number(km.toFixed(2)),
        score: 0
      };
      result.score = calculateScore(result);
      return result;
    })
    .filter((item): item is ServiceSearchResult => item !== null)
    .filter((item) => shouldIncludeByFilters(item, filters));

  if (matched.length > 0) {
    return { items: applyPresetSort(matched, preset), fallbackUsed: false };
  }

  // Fallback: ослабляем фильтры если выдача пустая.
  const relaxed = { ...filters, maxPrice: undefined, radiusKm: undefined };
  const relaxedResults = serviceCenters
    .map((center) => {
      const prices = repairPrices.filter((price) => {
        if (price.serviceCenterId !== center.id) return false;
        if (relaxed.brand && price.brand !== relaxed.brand) return false;
        return true;
      });
      if (prices.length === 0) return null;
      const best = prices.reduce((acc, item) => (item.price < acc.price ? item : acc), prices[0]);
      const km = distanceKm(relaxed.lat, relaxed.lng, center.lat, center.lng);
      const result: ServiceSearchResult = {
        ...center,
        bestPrice: best.price,
        etaMinutes: best.etaMinutes,
        distanceKm: Number(km.toFixed(2)),
        score: 0
      };
      result.score = calculateScore(result);
      return result;
    })
    .filter((item): item is ServiceSearchResult => item !== null);

  return { items: applyPresetSort(relaxedResults, preset), fallbackUsed: true };
}

export function getServiceById(serviceId: string) {
  return serviceCenters.find((center) => center.id === serviceId);
}

export function getServicePrices(serviceId: string) {
  return {
    repairs: repairPrices.filter((price) => price.serviceCenterId === serviceId),
    accessories: accessoryPrices.filter((item) => item.serviceCenterId === serviceId)
  };
}
