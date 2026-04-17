/** Прод на Vercel: API через serverless `/api/...`. Локально тот же префикс — см. proxy в vite.config. */
const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export type ServiceSearchItem = {
  id: string;
  name: string;
  phones: string[];
  lat: number;
  lng: number;
  address: string;
  description: string;
  openingHours: string;
  rating: number;
  verified: boolean;
  expressRepair: boolean;
  bestPrice: number;
  etaMinutes: number;
  distanceKm: number;
  score: number;
};

export type SearchResponse = {
  items: ServiceSearchItem[];
  fallbackUsed: boolean;
};

export type RepairPriceRow = {
  serviceCenterId: string;
  brand: string;
  repairType: string;
  price: number;
  currency: string;
  etaMinutes: number;
};

export type AccessoryPriceRow = {
  serviceCenterId: string;
  category: string;
  productName: string;
  price: number;
  inStock: boolean;
};

export type PricesResponse = {
  repairs: RepairPriceRow[];
  accessories: AccessoryPriceRow[];
};

export async function fetchSearch(params: URLSearchParams): Promise<SearchResponse> {
  const response = await fetch(`${API_BASE}/services/search?${params.toString()}`);
  if (!response.ok) throw new Error("Ошибка поиска");
  const data = await response.json();
  return {
    items: Array.isArray(data.items) ? data.items : [],
    fallbackUsed: Boolean(data.fallbackUsed)
  };
}

export async function fetchPrices(serviceId: string): Promise<PricesResponse> {
  const response = await fetch(`${API_BASE}/services/${serviceId}/prices`);
  if (!response.ok) throw new Error("Не удалось загрузить прайс");
  return response.json();
}

export async function postOnMyWay(serviceCenterId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/intents/on-my-way`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ serviceCenterId, source: "web" })
  });
  if (!response.ok) throw new Error("Не удалось отправить");
}
