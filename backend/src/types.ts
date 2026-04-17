export type RepairType =
  | "screen_replacement"
  | "battery_replacement"
  | "camera_repair"
  | "charging_port"
  | "water_damage";

export interface ServiceCenter {
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
}

export interface RepairPrice {
  serviceCenterId: string;
  brand: string;
  repairType: RepairType;
  price: number;
  currency: "RUB";
  etaMinutes: number;
}

export interface AccessoryPrice {
  serviceCenterId: string;
  category: string;
  productName: string;
  price: number;
  inStock: boolean;
}

export interface UserIntent {
  id: string;
  serviceCenterId: string;
  action: "on_my_way";
  createdAt: string;
  source: "web";
}

export interface SearchFilters {
  brand?: string;
  repairType?: RepairType;
  maxPrice?: number;
  radiusKm?: number;
  openNow?: boolean;
  expressRepair?: boolean;
  verifiedOnly?: boolean;
  lat: number;
  lng: number;
}

export interface ServiceSearchResult extends ServiceCenter {
  bestPrice: number;
  etaMinutes: number;
  distanceKm: number;
  score: number;
}
