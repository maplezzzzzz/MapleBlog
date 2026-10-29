import type { APIRoute } from "astro";
import { getSiteUrl } from "../lib/config";

export const GET: APIRoute = () => new Response(
  `User-agent: *\nAllow: /\nDisallow: /api/*\n\nSitemap: ${getSiteUrl()}/sitemap-index.xml\n`,
  { headers: { "Content-Type": "text/plain; charset=utf-8" } },
);
