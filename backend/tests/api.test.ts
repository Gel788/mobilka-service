import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";

describe("services API", () => {
  it("searches services with filters", async () => {
    const response = await request(app).get("/services/search").query({
      lat: 55.7558,
      lng: 37.6173,
      brand: "Apple",
      repairType: "screen_replacement",
      maxPrice: 20000,
      radiusKm: 80
    });

    expect(response.status).toBe(200);
    expect(response.body.items.length).toBeGreaterThan(0);
    expect(response.body.items[0]).toHaveProperty("bestPrice");
  });

  it("sets fallbackUsed when strict filters yield no match", async () => {
    const response = await request(app).get("/services/search").query({
      lat: 55.7558,
      lng: 37.6173,
      brand: "Apple",
      repairType: "screen_replacement",
      maxPrice: 100,
      radiusKm: 1
    });
    expect(response.status).toBe(200);
    expect(response.body.fallbackUsed).toBe(true);
    expect(response.body.items.length).toBeGreaterThan(0);
  });

  it("stores on-my-way intent", async () => {
    const response = await request(app).post("/intents/on-my-way").send({
      serviceCenterId: "sc-1",
      source: "web"
    });
    expect(response.status).toBe(201);
    expect(response.body.action).toBe("on_my_way");
  });
});
