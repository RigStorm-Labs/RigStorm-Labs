# RigStorm Labs — Static E-Commerce Website

Dark-futuristic glassmorphism storefront for **RigStorm Labs** — Custom Gaming PCs, Repairs, Upgrades & Digital Guides. Deployable on GitHub Pages with live Airtable product data and Formspree form submissions.

## Features
- Dark-futuristic UI, glassmorphism, glossy glow, scroll reveal animations
- Airtable API integration for dynamic products, repairs & guides
- Formspree forms (custom build, buy now, repair, upgrade) with **inline success** (no redirect)
- Cart drawer with localStorage persistence
- Pre-Paid Cash active; COD / UPI / Credit Card shown as "In Development"
- StormCore King pre-built product page with full benchmarks & game performance
- Full mobile responsiveness + reduced-motion support
- No build step — pure static HTML/CSS/JS

## Project Structure
```
index.html         # Home — hero, featured builds, repairs, guides, upgrade CTA
builds.html        # All pre-built builds (Airtable-powered)
repairs.html       # Repair services
guides.html        # Digital guides
product.html       # Product detail (StormCore King default)
upgrade.html       # Upgrade services page
contact.html       # Contact + ecosystem links
css/               # style.css + animations.css
js/                # config, airtable, forms, cart, app
assets/            # logo.png + product images
```

## Configuration
Edit credentials/endpoints in `js/config.js`:
- Airtable Base ID, PAT, table name
- Formspree form endpoints (custom build, buy now, repair, upgrade)
- Fallback products if Airtable fetch fails

## Local Development
Just open in any browser, or run a tiny dev server:
```bash
npx serve .
# or
python -m http.server 8080
```

## Deploy to GitHub Pages
1. Push the repo to GitHub.
2. Settings → Pages → Source → `main` branch → `/` root.
3. Site goes live at `https://<user>.github.io/<repo>/`.

## Airtable Schema (Products table)
| Field          | Type       |
|----------------|------------|
| Name           | Single line|
| Specs          | Long text  |
| Description    | Long text  |
| Price          | Number     |
| Price(Slashed) | Number (optional) |
| Image          | Attachment (auto-hosted URL) |
| Category       | Single select: `Build` / `Guide` |
| Tier           | Single line (optional) |

> **Note on credentials.** The Airtable PAT lives client-side in `config.js` because the site is static-only. For production, proxy requests through a serverless function (Vercel/Netlify/Cloudflare Workers) and restrict the token scope to read-only on the Products table.

## Formspree Endpoints (provided)
- Custom Build → `https://formspree.io/f/xjgjjnqq`
- Buy Now (builds + guides) → `https://formspree.io/f/mdayvbwo`
- Repair → `https://formspree.io/f/xkoddyza`
- Upgrade → `https://formspree.io/f/mkjwglgp`

## Ecosystem Links
- RigStorm SiteMarket → www.rigstormsitemarket.linkpc.net
- RigStorm LandAura → www.landaura.run.place
- RigStorm Zeyora → www.zeyora.run.place
- AdStorm → www.adstorm.run.place
- SkyED → www.skyed.run.place

## Social
- Instagram → instagram.com/rigstorm_labs
- YouTube → youtube.com/@RigStormLabs

© RigStorm Labs. Built for the dark side of performance.
