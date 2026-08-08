/* RigStorm Labs — Main app logic */
(function () {
  const page = (document.body.dataset.page || "index");

  document.addEventListener("DOMContentLoaded", () => {
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();

    initNav();
    initReveal();
    initMobileMenu();

    if (page === "index" || page === "builds") loadProductGrid();
    if (page === "guides") loadGuideGrid();
    if (page === "product") loadProductDetail();
    if (page === "upgrade") initUpgradePage();
  });

  /* Nav scroll state */
  function initNav() {
    const nav = document.getElementById("nav");
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Scroll reveal via IntersectionObserver */
  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    items.forEach((el, i) => { if (!el.style.getPropertyValue("--i")) el.style.setProperty("--i", i % 6); });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    items.forEach(el => io.observe(el));
  }

  /* Mobile menu */
  function initMobileMenu() {
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");
    if (!toggle || !links) return;
    toggle.addEventListener("click", () => links.classList.toggle("show"));
    links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("show")));
  }

  /* Render product grids */
  async function loadProductGrid() {
    const grid = document.getElementById("buildsGrid");
    if (!grid) return;
    const builds = await window.AirtableClient.loadBuilds();
    if (!builds.length) {
      grid.innerHTML = '<p style="color:var(--text-dim);text-align:center">No builds available right now.</p>';
      return;
    }
    // Limit to 3 featured on index, all on builds page
    const list = page === "index" ? builds.slice(0, 3) : builds;
    grid.innerHTML = list.map((p, i) => window.AirtableClient.buildCard(p, i)).join("");
    initReveal();
  }

  async function loadGuideGrid() {
    const grid = document.getElementById("guidesGrid");
    if (!grid) return;
    const guides = await window.AirtableClient.loadGuides();
    grid.innerHTML = guides.map((p, i) => `
      <article class="card reveal" style="--i:${i}">
        <div class="card-icon">📘</div>
        <h3>${p.Name}</h3>
        <p>${p.Description || ""}</p>
        <div class="price-row"><span class="price">${window.AirtableClient.formatPrice(p.Price)}</span></div>
        <button class="btn btn-primary btn-glow" data-buy-guide="${p.Name}" data-price="${p.Price}">Buy Now</button>
        <p class="guide-note">Receive the Guide in Email reply after payment.</p>
      </article>
    `).join("");
    initReveal();
  }

  async function loadProductDetail() {
    const params = new URLSearchParams(location.search);
    let id = params.get("id");
    const detailWrap = document.getElementById("detailWrap");
    // StormCore King: hardcoded detailed page when no Airtable record
    const kingData = {
      Name: "StormCore King",
      Tier: "Mid-Range",
      Price: 66999,
      "Price(Slashed)": 82999,
      Specs: {
        Processor: "6 Cores & 12 Threads, 16 MB Cache. Base Clock 3.60GHz, Turbo Boost Up To 4.20GHz. AM4 Socket, DDR4 @ 3200MHz.",
        Chipset: "2.5GBps LAN. Supports DDR4 Memory up to 4133MHz.",
        RAM: "16GB DDR4-3200 Dual Channel. Intel XMP profiles for easy overclocking.",
        GPU: "RX 7600 8GB. Up to 8K 60Hz via HDMI & DisplayPort 1.4 with DSC.",
        Cooler: "Stock AMD Wraith Cooler.",
        Storage: "512GB PCIe Gen 3 NVMe SSD — up to 3500MB/s Read.",
        PSU: "650W, 80 PLUS Silver efficiency.",
        Chassis: "ANT eSports Crystal Z2 — 3 preloaded 120mm ARGB PWM fans, panoramic glass, up to 240mm radiator."
      },
      Benchmarks: [
        { category: "GPU", benchmark: "3DMark Timepy", score: "10977" },
        { category: "GPU", benchmark: "Superposition", score: "4730" },
        { category: "Processor", benchmark: "Cinebench R23 Single", score: "1358" },
        { category: "Processor", benchmark: "Cinebench R23 Multi", score: "10412" },
        { category: "Processor", benchmark: "Geekbench 6 Single", score: "1961" },
        { category: "Processor", benchmark: "Geekbench 6 Multi", score: "2200" }
      ],
      GamePerf: [
        { game: "Cyberpunk 2077 (Medium)", res: "1920×1080", fps: "66", min: "56", max: "75", play: "Good" },
        { game: "Cyberpunk 2077 (Medium)", res: "2560×1440", fps: "49", min: "42", max: "56", play: "Okay" },
        { game: "Cyberpunk 2077 (Medium)", res: "3840×2160", fps: "32", min: "27", max: "37", play: "Average" },
        { game: "GTA V", res: "1920×1080", fps: "126", min: "107", max: "145", play: "Very Smooth" },
        { game: "GTA V", res: "2560×1440", fps: "85", min: "72", max: "98", play: "Great" },
        { game: "GTA V", res: "3840×2160", fps: "49", min: "42", max: "56", play: "Okay" },
        { game: "Forza Horizon 5", res: "1920×1080", fps: "103", min: "87", max: "118", play: "Smooth" },
        { game: "Forza Horizon 5", res: "2560×1440", fps: "75", min: "64", max: "86", play: "Good" },
        { game: "Forza Horizon 5", res: "3840×2160", fps: "48", min: "41", max: "55", play: "Okay" },
        { game: "Counter Strike 2", res: "1920×1080", fps: "269", min: "228", max: "309", play: "Very Smooth" },
        { game: "Counter Strike 2", res: "2560×1440", fps: "178", min: "151", max: "205", play: "Very Smooth" },
        { game: "Counter Strike 2", res: "3840×2160", fps: "99", min: "84", max: "114", play: "Smooth" }
      ]
    };

    let product = kingData;
    if (id) {
      try {
        const rec = await window.AirtableClient.getById(id);
        if (rec) {
          product = {
            Name: rec.Name || kingData.Name,
            Tier: rec.Tier || "Mid-Range",
            Price: rec.Price ?? kingData.Price,
            "Price(Slashed)": rec["Price(Slashed)"],
            Specs: (rec.Specs || "").split(/,(?![^()[\]]*[\]])/).reduce((acc, s) => {
              const [k, ...rest] = s.split(/:(.*)/s);
              if (k && rest.length) acc[k.trim()] = rest[0].trim();
              return acc;
            }, {}),
            Benchmarks: kingData.Benchmarks,
            GamePerf: kingData.GamePerf
          };
          // If parsing didn't produce useful specs, fallback
          if (!Object.keys(product.Specs).length) product.Specs = { "Specs": rec.Specs };
        }
      } catch (_) { /* keep kingData */ }
    }

    if (!detailWrap) return;
    const priceHtml = product["Price(Slashed)"]
      ? `<span class="price">${window.AirtableClient.formatPrice(product.Price)}</span>
         <span class="price slashed">${window.AirtableClient.formatPrice(product["Price(Slashed)"])}</span>`
      : `<span class="price">${window.AirtableClient.formatPrice(product.Price)}</span>`;

    const specs = Object.entries(product.Specs || {}).map(([k, v]) =>
      `<div class="spec-item"><small>${k}</small><br><strong>${v}</strong></div>`).join("");

    const bench = (product.Benchmarks || []).map(b => `
      <tr><td>${b.category}</td><td>${b.benchmark}</td><td>${b.score}</td></tr>`).join("");

    const games = (product.GamePerf || []).map(g => `
      <tr><td>${g.game}</td><td>${g.res}</td><td>${g.fps}</td><td>${g.min}</td><td>${g.max}</td><td>${g.play}</td></tr>`).join("");

    detailWrap.innerHTML = `
      <a href="builds.html" style="display:inline-block;margin-bottom:16px;color:var(--accent-2)">← Back to Builds</a>
      <div class="detail-card">
        <div class="detail-img"><img src="assets/stormcore-king.png" alt="StormCore King" loading="lazy"></div>
        <div class="detail-info">
          <div class="tier">${product.Tier || "Pre-Built"}</div>
          <h1>${product.Name}</h1>
          <div class="price-row" style="margin:14px 0">${priceHtml}</div>
          <p style="color:var(--text-dim)">
            A great balanced mid-range gaming build offering smooth 1080p and entry-level 1440p performance with efficiency and style.
          </p>
          <div class="spec-grid">${specs}</div>
          <button class="btn btn-primary btn-glow" data-buy-now data-id="${id || "stormcore-king"}"
                  data-name="${encodeURIComponent(product.Name)}" data-price="${product.Price}">Buy Now</button>
          <button class="btn btn-ghost" data-add-cart data-id="${id || "stormcore-king"}"
                  data-name="${encodeURIComponent(product.Name)}" data-price="${product.Price}" data-kind="build">Add to Cart</button>
        </div>
      </div>

      <div style="margin-top:40px">
        <h2 style="margin-bottom:14px">Hardware Specifications</h2>
      </div>

      <div style="margin-top:40px">
        <h2 style="margin-bottom:14px">Benchmarks</h2>
        <table class="bench-table">
          <thead><tr><th>Category</th><th>Benchmark</th><th>Score</th></tr></thead>
          <tbody>${bench}</tbody>
        </table>
      </div>

      <div style="margin-top:40px">
        <h2 style="margin-bottom:14px">Game Performance <span style="color:var(--text-dim);font-size:.85rem;font-weight:400">(Medium Settings)</span></h2>
        <table class="bench-table">
          <thead><tr><th>Game</th><th>Resolution</th><th>Avg FPS</th><th>Min</th><th>Max</th><th>Playability</th></tr></thead>
          <tbody>${games}</tbody>
        </table>
      </div>
    `;
  }

  function initUpgradePage() {
    const btn = document.querySelector("[data-open-form='upgrade']");
    if (btn) btn.addEventListener("click", () => window.RigStormForms.upgradeForm());
  }
})();
