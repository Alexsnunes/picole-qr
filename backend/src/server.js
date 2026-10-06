import "dotenv/config";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import productsRouter from "./routes/products.js";
import settingsRouter from "./routes/settings.js";

const app = express();
const port = Number(process.env.PORT || 10000);

app.locals.adminPin = process.env.ADMIN_PIN || "1234";
app.locals.activeTokens = new Set();

const allowedOrigin = process.env.CORS_ORIGIN || true;

app.use(cors({
  origin: allowedOrigin,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "picole-qr-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/settings", settingsRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Erro interno do servidor." });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`API Picolé QR ouvindo na porta ${port}`);
});
