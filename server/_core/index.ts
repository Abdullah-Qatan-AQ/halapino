import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import path from "path";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.use(
  "/api/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);

const distPath = path.resolve(process.cwd(), "dist/public");
app.use(express.static(distPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
