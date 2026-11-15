const SUPABASE_URL = "https://dhzkkpsdowpsneozkhvt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_uLdZ-Lj2jEWMmyyFNl7W7w_oXlom5lN";
const SITE_URL = "https://walloraa.vercel.app";

const CATEGORIES = [
  "Beauty",
  "Abstract",
  "Nature",
  "Cars & Bikes",
  "Anime",
  "Minimal",
  "AMOLED Dark"
];

function escapeXml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default async function handler(req, res) {
  try {
    // Fetch all wallpapers (up to 5,000) from Supabase REST API
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/wallpapers?select=id,title,image_url,created_at&order=created_at.desc&limit=5000`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Supabase fetch failed: ${response.status}`);
    }

    const wallpapers = await response.json();
    const today = new Date().toISOString().split("T")[0];

    let urls = `
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/explore.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/explore.html?sort=popular</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>`;

    // Category pages
    for (const cat of CATEGORIES) {
      urls += `
  <url>
    <loc>${SITE_URL}/explore.html?cat=${encodeURIComponent(cat)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    // Individual 4K Wallpaper pages + Google Image Sitemap tags
    for (const wp of wallpapers) {
      const lastmod = wp.created_at
        ? new Date(wp.created_at).toISOString().split("T")[0]
        : today;
      const pageUrl = `${SITE_URL}/wallpaper.html?id=${encodeURIComponent(wp.id)}`;

      urls += `
  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>${
      wp.image_url
        ? `
    <image:image>
      <image:loc>${escapeXml(wp.image_url)}</image:loc>
      <image:title>${escapeXml(wp.title || "Walloraa 4K Wallpaper")}</image:title>
    </image:image>`
        : ""
    }
  </url>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");
    return res.status(200).send(xml);
  } catch (err) {
    console.error("Sitemap Error:", err);
    return res.status(500).send("Error generating sitemap");
  }
}
