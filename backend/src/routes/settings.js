import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

function mapSettings(row) {
  return {
    storeName: row.store_name,
    storeSubtitle: row.store_subtitle,
    currency: row.currency,
    publicUrl: row.public_url
  };
}

router.get("/", async (_req, res, next) => {
  try {
    const result = await query("select * from settings where id=1");
    if (!result.rowCount) {
      return res.json({
        storeName: "Picolés Delícia",
        storeSubtitle: "Escolha seu sabor favorito",
        currency: "BRL",
        publicUrl: "http://localhost:5173"
      });
    }
    res.json(mapSettings(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

router.put("/", requireAdmin, async (req, res, next) => {
  try {
    const parsed = z.object({
      storeName: z.string().trim().min(1).max(100),
      storeSubtitle: z.string().trim().max(200),
      currency: z.string().trim().min(1).max(10),
      publicUrl: z.string().trim().url().max(2000)
    }).safeParse(req.body);

    if (!parsed.success) return res.status(400).json({ message: "Configurações inválidas." });

    const p = parsed.data;
    const result = await query(
      `insert into settings (id, store_name, store_subtitle, currency, public_url)
       values (1,$1,$2,$3,$4)
       on conflict (id) do update set
         store_name=excluded.store_name,
         store_subtitle=excluded.store_subtitle,
         currency=excluded.currency,
         public_url=excluded.public_url
       returning *`,
      [p.storeName, p.storeSubtitle, p.currency, p.publicUrl]
    );

    res.json(mapSettings(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

export default router;
