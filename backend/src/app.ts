import cors from "cors";
import express from "express";
import { z } from "zod";
import { intents } from "./data";
import { getServiceById, getServicePrices, searchServices } from "./service-search";

const querySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  brand: z.string().optional(),
  repairType: z.enum(["screen_replacement", "battery_replacement", "camera_repair", "charging_port", "water_damage"]).optional(),
  maxPrice: z.coerce.number().optional(),
  radiusKm: z.coerce.number().optional(),
  expressRepair: z.coerce.boolean().optional(),
  verifiedOnly: z.coerce.boolean().optional(),
  preset: z.string().optional()
});

export const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ ok: true });
});

app.get("/services/search", (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: "Невалидные фильтры", issues: parsed.error.issues });
  }

  const { preset, ...filters } = parsed.data;
  const { items, fallbackUsed } = searchServices(filters, preset);
  return res.json({
    filtersApplied: parsed.data,
    fallbackUsed,
    items
  });
});

app.get("/services/:id", (req, res) => {
  const item = getServiceById(req.params.id);
  if (!item) return res.status(404).json({ message: "Сервис не найден" });
  return res.json(item);
});

app.get("/services/:id/prices", (req, res) => {
  const item = getServiceById(req.params.id);
  if (!item) return res.status(404).json({ message: "Сервис не найден" });
  return res.json(getServicePrices(req.params.id));
});

app.post("/intents/on-my-way", (req, res) => {
  const schema = z.object({
    serviceCenterId: z.string().min(1),
    source: z.literal("web").default("web")
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Невалидный payload" });
  }
  const intent = {
    id: `intent-${Date.now()}`,
    serviceCenterId: parsed.data.serviceCenterId,
    action: "on_my_way" as const,
    source: "web" as const,
    createdAt: new Date().toISOString()
  };
  intents.push(intent);
  return res.status(201).json(intent);
});
