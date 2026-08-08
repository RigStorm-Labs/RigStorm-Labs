/* RigStorm Labs — Global Configuration */
/* In production this PAT would live behind a server/proxy — given the GitHub
   Pages static requirement, credentials are exposed client-side intentionally. */

window.RigStormConfig = {
  // Airtable
  airtable: {
    baseId: "appzKrN92LL2cyb1h",
    pat: "patlFvk9wbkbDiPiV.426e585687356b9ef1f6c9cc27c91c35eab55ccb82b2045b07a564743e77fe65",
    tableName: "Products",
    endpoint: "https://api.airtable.com/v0/"
  },

  // Formspree endpoints
  forms: {
    customBuild: "https://formspree.io/f/xjgjjnqq",
    buyNow:      "https://formspree.io/f/mdayvbwo",
    repair:      "https://formspree.io/f/xkoddyza",
    upgrade:     "https://formspree.io/f/mkjwglgp"
  },

  // Fallback products if Airtable fetch fails
  fallbackProducts: {
    builds: [
      {
        id: "stormcore-king",
        Name: "StormCore King",
        Tier: "Mid-Range",
        Specs: "Ryzen 5 5500, RX 7600 8GB, 16GB DDR4-3200, 512GB NVMe SSD, 650W PSU, ANT eSports Crystal Z2 Case",
        Description: "A great balanced mid-range gaming build offering smooth 1080p and entry-level 1440p performance with efficiency and style.",
        Price: 66999,
        "Price(Slashed)": 82999,
        Category: "Build",
        ImageURL: "assets/stormcore-king.png"
      }
    ],
    guides: [
      {
        id: "pc-building-guide",
        Name: "PC Building Guide",
        Specs: "Digital Download · 60+ pages",
        Description: "Complete step-by-step guide, component selection tips, assembly instructions, and troubleshooting advice.",
        Price: 500,
        "Price(Slashed)": null,
        Category: "Guide"
      }
    ]
  }
};
