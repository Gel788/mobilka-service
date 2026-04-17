import express from "express";
import serverless from "serverless-http";
import { app } from "../backend/src/app";

/**
 * Vercel: запросы `/api/services/...` → снимаем `/api` → Express (`/services/...`).
 */
const root = express();
root.use((req, _res, next) => {
  const u = req.url ?? "/";
  if (u === "/api" || u.startsWith("/api/")) {
    req.url = u.slice(4) || "/";
  }
  next();
});
root.use(app);

export default serverless(root);
