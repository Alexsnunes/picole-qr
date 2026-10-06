import { Router } from "express";
import crypto from "node:crypto";
import { z } from "zod";

const router = Router();

router.post("/login", (req, res) => {
  const parsed = z.object({ pin: z.string().min(1).max(100) }).safeParse(req.body);

  if (!parsed.success || parsed.data.pin !== req.app.locals.adminPin) {
    return res.status(401).json({ message: "PIN incorreto." });
  }

  const token = crypto.randomBytes(32).toString("hex");
  req.app.locals.activeTokens.add(token);

  res.json({ token });
});

export default router;
