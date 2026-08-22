import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import path from "path";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// السماح لجميع المواقع (بما فيها GitHub Pages) بالتواصل مع السيرفر
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());

app.use(
  "/api/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);

app.get("/", (req, res) => {
  res.send("Halapino API Server is Running");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
