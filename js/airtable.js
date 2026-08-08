/* RigStorm Labs — Airtable client + product rendering */
(function () {
  const cfg = window.RigStormConfig.airtable;
  const cache = { builds: null, guides: null, all: null };

  function endpointUrl(table) {
    return `${cfg.endpoint}${cfg.baseId}/${encodeURIComponent(table || cfg.tableName)}`;
  }

  async function fetchRecords(table) {
    try {
      const url = endpointUrl(table) + "?pageSize=100";
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${cfg.pat}`,
          "Content-Type": "application/json"
        }
      });
      if (!res.ok) throw new Error(`Airtable ${res.status}`);
      const json = await res.json();
      let records = json.records || [];
      while (json.offset) {
        const next = await fetch(endpointUrl(table) + `?pageSize=100&offset=${json.offset}`, {
          headers: { Authorization: `Bearer ${cfg.pat}` }
        });
        if (!next.ok) break;
        json = await next.json();
        records = records.concat(json.records || []);
      }
      return records.map(r => ({ id: r.id, ...r.fields }));
    } catch (err) {
      console.warn("[RigStorm] Airtable fetch failed, using fallback:", err.message);
      return null;
    }
  }

  function getAttachmentUrl(fields) {
    if (Array.isArray(fields.Image) && fields.Image.length) {
      return fields.Image[0].url;
    }
    if (fields["Image URL"]) return fields["Image URL"];
    return null;
  }

  function toProduct(rec, fallback) {
    if (!rec) return fallback;
    return {
      id: rec.id,
      Name: rec.Name || fallback.Name,
      Tier: rec.Tier || fallback.Tier,
      Specs: rec.Specs || fallback.Specs,
      Description: rec.Description || fallback.Description,
      Price: rec.Price ?? fallback.Price,
      "Price(Slashed)": rec["Price(Slashed)"] ?? fallback["Price(Slashed)"],
      ImageURL: getAttachmentUrl(rec) || null,
      Category: rec.Category || fallback.Category
    };
  }

  async function loadProducts() {
    if (cache.all) return cache.all;
    const fb = window.RigStormConfig.fallbackProducts;
    const records = await fetchRecords();
    if (!records || !records.length) {
      cache.builds = fb.builds.map(p => ({ ...p, ImageURL: "assets/logo.svg" }));
      cache.guides = fb.guides.map(p => ({ ...p, ImageURL: null }));
      cache.all = cache.builds.concat(cache.guides);
      return cache.all;
    }
    // Normalize Airtable records; split by Category or heuristics
    const builds = [];
    const guides = [];
    records.forEach(r => {
      const fbMatch = fb.builds.find(b => b.Name === r.Name) || fb.guides.find(g => g.Name === r.Name) || {};
      const prod = toProduct(r, fbMatch);
      if (prod.Category === "Guide" || /guide/i.test(prod.Name || "")) guides.push(prod);
      else builds.push(prod);
    });
    if (!builds.length) fb.builds.forEach(b => builds.push({ ...b, ImageURL: "assets/logo.svg" }));
    if (!guides.length) fb.guides.forEach(g => guides.push({ ...g, ImageURL: null }));
    cache.builds = builds;
    cache.guides = guides;
    cache.all = builds.concat(guides);
    return cache.all;
  }

  async function loadBuilds() {
    await loadProducts();
    return cache.builds;
  }

  async function loadGuides() {
    await loadProducts();
    return cache.guides;
  }

  async function getById(id) {
    try {
      const res = await fetch(endpointUrl() + "/" + encodeURIComponent(id), {
        headers: { Authorization: `Bearer ${cfg.pat}` }
      });
      if (!res.ok) throw new Error(res.status);
      const json = await res.json();
      return { id: json.id, ...json.fields };
    } catch (e) {
      const all = await loadProducts();
      return all.find(p => p.id === id || p.id === "fallback") || null;
    }
  }

  function formatPrice(n) {
    if (n == null || isNaN(n)) return "";
    return "₹" + Number(n).toLocaleString("en-IN");
  }

  function buildCard(p, i) {
    const priceHtml = p["Price(Slashed)"]
      ? `<div class="price-row"><span class="price">${formatPrice(p.Price)}</span><span class="price slashed">${formatPrice(p["Price(Slashed)"])}</span></div>`
      : `<div class="price-row"><span class="price">${formatPrice(p.Price)}</span></div>`;
    const imgHtml = p.ImageURL
      ? `<img class="product-img" src="${p.ImageURL}" alt="${p.Name}" loading="lazy" onerror="this.style.display='none'">`
      : `<div class="product-img" style="display:flex;align-items:center;justify-content:center;font-size:2.4rem">🖥️</div>`;
    const tier = p.Tier ? `<div class="tier-badge" style="color:var(--accent-3);font-size:.72rem;font-weight:700;letter-spacing:1px;text-transform:uppercase">${p.Tier} Tier</div>` : "";
    return `
      <article class="card reveal" style="--i:${i}">
        ${imgHtml}
        ${tier}
        <h3>${p.Name}</h3>
        <p>${p.Description || ""}</p>
        <div class="spec-list">${(p.Specs || "").split(",").map(s => `<li>${s.trim()}</li>`).join("")}</div>
        ${priceHtml}
        <button class="btn btn-primary btn-glow" data-buy-now data-id="${p.id}" data-name="${encodeURIComponent(p.Name)}" data-price="${p.Price}">Buy Now</button>
        <a class="btn btn-ghost" href="product.html?id=${p.id}">View Details</a>
      </article>`;
  }

  window.AirtableClient = {
    loadProducts, loadBuilds, loadGuides, getById, formatPrice, buildCard, fetchRecords
  };
})();
