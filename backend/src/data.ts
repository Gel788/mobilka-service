import { AccessoryPrice, RepairPrice, ServiceCenter, UserIntent } from "./types";

/** Демо-данные: Москва и Московская область, цены в ₽ */
export const serviceCenters: ServiceCenter[] = [
  {
    id: "sc-1",
    name: "FixPoint Тверская",
    phones: ["+74951234567"],
    lat: 55.7617,
    lng: 37.6056,
    address: "Москва, ул. Тверская, 12 (вход с торца, 2 этаж)",
    description: "От метро «Тверская» 3 минуты пешком. Позвоните — подскажем, где парковка.",
    openingHours: "09:00–21:00",
    rating: 4.7,
    verified: true,
    expressRepair: true
  },
  {
    id: "sc-2",
    name: "PhoneLab Химки",
    phones: ["+74987654321"],
    lat: 55.888,
    lng: 37.431,
    address: "Московская обл., Химки, мкр. Сходня, ул. Горная, 8",
    description: "ТЦ у ж/д «Сходня», 1 этаж, павильон у эскалатора.",
    openingHours: "10:00–20:00",
    rating: 4.4,
    verified: false,
    expressRepair: false
  },
  {
    id: "sc-3",
    name: "iService Марьино",
    phones: ["+74951112233"],
    lat: 55.65,
    lng: 37.743,
    address: "Москва, ул. Люблинская, 96 к1 (вход со двора)",
    description: "5 минут от метро «Марьино». Экспресс-замена экрана в день обращения.",
    openingHours: "08:00–22:00",
    rating: 4.9,
    verified: true,
    expressRepair: true
  }
];

export const repairPrices: RepairPrice[] = [
  { serviceCenterId: "sc-1", brand: "Apple", repairType: "screen_replacement", price: 9900, currency: "RUB", etaMinutes: 90 },
  { serviceCenterId: "sc-1", brand: "Apple", repairType: "battery_replacement", price: 5200, currency: "RUB", etaMinutes: 45 },
  { serviceCenterId: "sc-1", brand: "Apple", repairType: "charging_port", price: 4500, currency: "RUB", etaMinutes: 60 },
  { serviceCenterId: "sc-1", brand: "Apple", repairType: "camera_repair", price: 6800, currency: "RUB", etaMinutes: 75 },
  { serviceCenterId: "sc-1", brand: "Samsung", repairType: "screen_replacement", price: 11200, currency: "RUB", etaMinutes: 100 },
  { serviceCenterId: "sc-1", brand: "Samsung", repairType: "battery_replacement", price: 4500, currency: "RUB", etaMinutes: 60 },
  { serviceCenterId: "sc-1", brand: "Xiaomi", repairType: "screen_replacement", price: 7600, currency: "RUB", etaMinutes: 110 },
  { serviceCenterId: "sc-2", brand: "Apple", repairType: "screen_replacement", price: 7900, currency: "RUB", etaMinutes: 120 },
  { serviceCenterId: "sc-2", brand: "Apple", repairType: "battery_replacement", price: 4800, currency: "RUB", etaMinutes: 50 },
  { serviceCenterId: "sc-2", brand: "Samsung", repairType: "screen_replacement", price: 9100, currency: "RUB", etaMinutes: 130 },
  { serviceCenterId: "sc-2", brand: "Xiaomi", repairType: "charging_port", price: 3200, currency: "RUB", etaMinutes: 90 },
  { serviceCenterId: "sc-2", brand: "Xiaomi", repairType: "screen_replacement", price: 6900, currency: "RUB", etaMinutes: 95 },
  { serviceCenterId: "sc-3", brand: "Apple", repairType: "screen_replacement", price: 12900, currency: "RUB", etaMinutes: 45 },
  { serviceCenterId: "sc-3", brand: "Apple", repairType: "water_damage", price: 3500, currency: "RUB", etaMinutes: 30 },
  { serviceCenterId: "sc-3", brand: "Samsung", repairType: "camera_repair", price: 5800, currency: "RUB", etaMinutes: 80 },
  { serviceCenterId: "sc-3", brand: "Samsung", repairType: "battery_replacement", price: 3900, currency: "RUB", etaMinutes: 40 },
  { serviceCenterId: "sc-3", brand: "Xiaomi", repairType: "screen_replacement", price: 8200, currency: "RUB", etaMinutes: 85 }
];

export const accessoryPrices: AccessoryPrice[] = [
  { serviceCenterId: "sc-1", category: "Чехол", productName: "MagSafe-совместимый", price: 1900, inStock: true },
  { serviceCenterId: "sc-1", category: "Зарядка", productName: "Блок 20W USB-C", price: 1500, inStock: true },
  { serviceCenterId: "sc-1", category: "Кабель", productName: "USB-C 2 м", price: 990, inStock: true },
  { serviceCenterId: "sc-1", category: "Стекло", productName: "Защита 9H", price: 890, inStock: true },
  { serviceCenterId: "sc-2", category: "Кабель", productName: "USB-C 1.5 м", price: 890, inStock: true },
  { serviceCenterId: "sc-2", category: "Чехол", productName: "Силикон прозрачный", price: 650, inStock: true },
  { serviceCenterId: "sc-2", category: "Аудио", productName: "TWS наушники", price: 2490, inStock: false },
  { serviceCenterId: "sc-3", category: "Стекло", productName: "9H премиум", price: 1200, inStock: true },
  { serviceCenterId: "sc-3", category: "Зарядка", productName: "GaN 65W", price: 3200, inStock: true },
  { serviceCenterId: "sc-3", category: "Чехол", productName: "Кожа премиум", price: 2100, inStock: true }
];

export const intents: UserIntent[] = [];
