/* RigStorm Labs — single source of truth (mirrors DataPRD.md) */
window.RIGSTORM = {
  company: "RigStorm Labs",
  tagline: "High-performance gaming rigs, repairs, upgrades and guides — engineered in the dark.",
  taglineShort: "Built for the dark side of performance.",
  social: {
    instagram: "https://instagram.com/rigstorm_labs",
    youtube: "https://youtube.com/@RigStormLabs"
  },
  ecosystem: [
    { name: "Site Market", url: "https://www.rigstormsitemarket.linkpc.net", note: "Marketplace" },
    { name: "Land Aura", url: "https://www.landaura.run.place", note: "Ecosystem" },
    { name: "Zeyora", url: "https://www.zeyora.run.place", note: "Ecosystem" },
    { name: "Ad Storm", url: "https://www.adstorm.run.place", note: "Ecosystem" },
    { name: "Sky Ed", url: "https://www.skyed.run.place", note: "Ecosystem" }
  ],
  endpoints: {
    custom_build: "https://formspree.io/f/xjgjjnqq",
    buy_now: "https://formspree.io/f/mdayvbwo",
    repair: "https://formspree.io/f/xkoddyza",
    upgrade: "https://formspree.io/f/mkjwglgp"
  },
  // Default catalogue — used when Decap CMS entries are unavailable.
  products: [
    {
      id: "stormcore-king",
      name: "StormCore King",
      tier: "Mid-Range",
      specs: "Ryzen 5 5500, RX 7600 8GB, 16GB DDR4-3200, 512GB NVMe SSD, 650W PSU, ANT eSports Crystal Z2 Case",
      description: "Balanced mid-range gaming build offering smooth 1080p and entry-level 1440p performance.",
      price: 66999,
      priceSlashed: 82999,
      category: "Build",
      image: "assets/stormcore-king.jpg"
    },
    {
      id: "pc-building-guide",
      name: "PC Building Guide",
      tier: "Digital",
      specs: "Digital Download",
      description: "Complete step-by-step guide, component selection tips, assembly instructions. Delivered by email reply after payment.",
      price: 500,
      priceSlashed: null,
      category: "Guide",
      image: "assets/logo.png"
    }
  ],
  repairs: [
    { name: "Thermal Re-Paste", price: 750, original: 1000, icon: "\u{1F321}\uFE0F", description: "Premium paste, careful application and temperature verification for cooler, quieter operation." },
    { name: "Deep Cleaning", price: 500, original: null, icon: "\u2728", description: "Full dust removal, fan and filter care, airflow check and tidy-up inside and out." },
    { name: "Performance Boost", price: 500, original: null, icon: "\u03DE", description: "Driver cleanup, startup tuning and settings review to recover lost frames." },
    { name: "Diagnosis / Other", price: null, original: null, icon: "\u2295", description: "Something else wrong? Describe the issue and receive a custom quote before any work begins." }
  ],
  guides: [
    { name: "PC Building Guide", price: 500, specs: "Digital Download", description: "Complete step-by-step guide, component selection tips, assembly instructions.", delivery: "Email reply after payment" }
  ],
  inr(n) {
    if (n === null || n === undefined || n === "") return "Custom quote";
    return "₹" + Number(n).toLocaleString("en-IN");
  }
};
