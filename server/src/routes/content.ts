import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { DEFAULT_HOME_SECTIONS } from "../lib/defaultContent.js";

export const contentRouter = Router();

// Public: fetch a page by slug with its sections (falls back to defaults for "home")
contentRouter.get("/:slug", async (req, res, next) => {
  try {
    let page = await prisma.page.findUnique({
      where: { slug: req.params.slug },
      include: { sections: { orderBy: { order: "asc" }, where: { enabled: true } } },
    });

    // Auto-seed the home page the first time it's requested
    if (!page && req.params.slug === "home") {
      page = await prisma.page.create({
        data: {
          slug: "home",
          title: "Home",
          sections: {
            create: DEFAULT_HOME_SECTIONS.map((s) => ({
              type: s.type,
              order: s.order,
              enabled: s.enabled,
              data: s.data as any,
            })),
          },
        },
        include: { sections: { orderBy: { order: "asc" }, where: { enabled: true } } },
      });
    }

    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json({ page });
  } catch (e) { next(e); }
});
