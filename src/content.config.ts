import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
// Imported directly rather than from `astro:content` — that re-export is
// deprecated as of Astro 7.
import { z } from "zod";

/**
 * The schema enforces the editorial rules rather than trusting anyone to
 * remember them:
 *
 *   - `problem` is required, so a case study cannot open with technology.
 *   - every metric needs a `basis`, so no number appears without its source.
 *   - `tradeoff` and `wouldChange` are required, so the honest parts cannot
 *     be quietly dropped when they are the hard ones to write.
 *
 * Miss any of them and the build fails.
 */
const work = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
  schema: z.object({
    title: z.string(),
    /** One line. What was broken before this existed. */
    tagline: z.string(),
    /** The opening paragraph — a problem a reader wants resolved. */
    problem: z.string().min(80),
    status: z.enum(["production", "research", "shipped"]),
    period: z.string(),
    order: z.number(),
    stack: z.array(z.string()).min(3),
    metrics: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
          /** Where the number comes from. No bare figures. */
          basis: z.string(),
        }),
      )
      .min(2)
      .max(4),
    /** What the design cost — every decision buys something and spends something. */
    tradeoff: z.string().min(60),
    /** The admission. What you would build differently now. */
    wouldChange: z.string().min(60),
    /** Optional: drives the scroll-driven trace diagram. */
    trace: z
      .array(
        z.object({
          step: z.string(),
          detail: z.string(),
          emphasis: z.boolean().optional(),
        }),
      )
      .optional(),
  }),
});

export const collections = { work };
