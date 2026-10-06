import { Router } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { query } from "../db.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

const productSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).default(""),
  price: z.coerce.number().min(0).max(99999),
  imageUrl: z.string().trim().max(2000).default(""),
  available: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(999999).default(0)
});

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    imageUrl: row.image_url,
    available: row.available,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

router.get("/", async (req, res, next) => {
  try {
    const publicOnly = req.query.public === "true";
    const result = await query(
      `select id, name, description, price, image_url, available, sort_order, created_at, updated_at
       from products
       ${publicOnly ? "where available = true" : ""}
       order by sort_order asc, name asc`
    );
    res.json(result.rows.map(mapProduct));
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Dados do picolé inválidos." });

    const p = parsed.data;
    const id = crypto.randomUUID();

    const result = await query(
      `insert into products (id, name, description, price, image_url, available, sort_order)
       values ($1,$2,$3,$4,$5,$6,$7)
       returning *`,
      [id, p.name, p.description, p.price, p.imageUrl, p.available, p.sortOrder]
    );

    res.status(201).json(mapProduct(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireAdmin, async (req, res, next) => {
  try {
    const parsed = productSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Dados inválidos." });

    const current = await query("select * from products where id = $1", [req.params.id]);
    if (!current.rowCount) return res.status(404).json({ message: "Picolé não encontrado." });

    const old = current.rows[0];
    const p = { ...mapProduct(old), ...parsed.data };

    const result = await query(
      `update products
       set name=$1, description=$2, price=$3, image_url=$4, available=$5, sort_order=$6, updated_at=now()
       where id=$7
       returning *`,
      [p.name, p.description, p.price, p.imageUrl, p.available, p.sortOrder, req.params.id]
    );

    res.json(mapProduct(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/availability", requireAdmin, async (req, res, next) => {
  try {
    const parsed = z.object({ available: z.boolean() }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Disponibilidade inválida." });

    const result = await query(
      `update products set available=$1, updated_at=now()
       where id=$2 returning *`,
      [parsed.data.available, req.params.id]
    );

    if (!result.rowCount) return res.status(404).json({ message: "Picolé não encontrado." });
    res.json(mapProduct(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const result = await query("delete from products where id=$1", [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ message: "Picolé não encontrado." });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
