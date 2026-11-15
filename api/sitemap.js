export default async function handler(req, res) {
  const SITE_URL = "https://walloraa.vercel.app";
  const SUPABASE_URL = "https://dhzkkpsdowpsneozkhvt.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_uLdZ-Lj2jEWMmyyFNl7W7w_oXlom5lN";

  const escapeXml = (str = "") =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  try {
    // Fetch up to 5,000 wallpapers from Supabase REST API
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/wallpapers?select=id,title,category,image_url,created_at&order=created_at.desc&limit=5000`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    const wallpapers = response.ok ? await response.json() : [];
    const today = new Date().toISOString().split("T")[0];

    const categories = [
      "Beauty",
      "Abstract",
      "Nature",
      "Cars & Bikes",
      "Anime",
      "Minimal",
      "AMOLED Dark",
    ];

    const staticUrls = [
      { loc: `${SITE_URL}/`, changefreq: "daily", priority: "1.0" },
      { loc: `${SITE_URL}/explore.html`, changefreq: "daily", priority: "0.9" },
      { loc: `${SITE_URL}/explore.html?sort=popular`, changefreq: "daily", priority: "0.8" },
      ...categories.map((cat) => ({
        loc: `${SITE_URL}/explore.html?cat=${encodeURIComponent(cat)}`,
        changefreq: "weekly",
        priority: "0.8",
      })),
    ];

    const staticXml = staticUrls
      .map(
        (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
      )
      .join("\n");

    const wallpaperXml = wallpapers
      .map((w) => {
        const lastmod = w.created_at
          ? new Date(w.created_at).toISOString().split("T")[0]
          : today;
        const pageUrl = `${SITE_URL}/wallpaper.html?id=${encodeURIComponent(w.id)}`;
        return `  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <image:image>
      <image:loc>${escapeXml(w.image_url)}</image:loc>
      <image:title>${escapeXml(`${w.title} - 4K Wallpaper`)}</image:title>
    </image:image>
  </url>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticXml}
${wallpaperXml}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).send(xml);
  } catch (err) {
    return res.status(500).send(`<!-- Sitemap Error: ${err.message} -->`);
  }
}
