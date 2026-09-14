/* RigStorm Labs — nav, reveals, dynamic catalogue rendering */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    // mobile menu
    var burger = document.getElementById("burger");
    var menu = document.getElementById("mobileMenu");
    if (burger && menu) burger.addEventListener("click", function () { menu.classList.toggle("open"); });
    // current page marker
    var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      if (a.getAttribute("href") === page) a.setAttribute("aria-current", "page");
    });
    // reveal on scroll
    var els = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && els.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
      }, { threshold: 0.12 });
      els.forEach(function (el) { io.observe(el); });
    } else els.forEach(function (el) { el.classList.add("in"); });

    renderBuildCards();
    renderRepairRows();
    renderGuideCards();
    renderProductDetail();
    renderEco();
  });

  function money(n) { return window.RIGSTORM.inr(n); }

  // Attempt CMS content first, fall back to config defaults.
  // CMS files are objects like {"products":[...]}, so unwrap the first array found.
  function unwrap(j, fallback) {
    if (Array.isArray(j)) return j.length ? j : fallback;
    if (j && typeof j === "object") {
      for (var k in j) if (Array.isArray(j[k]) && j[k].length) return j[k];
    }
    return fallback;
  }
  function fetchCMS(path, fallback) {
    return fetch(path, { headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { return unwrap(j, fallback); })
      .catch(function () { return fallback; });
  }

  function renderBuildCards() {
    var grids = document.querySelectorAll("[data-builds-grid]");
    if (!grids.length) return;
    fetchCMS("content/products.json", window.RIGSTORM.products).then(function (all) {
      var builds = all.filter(function (p) { return (p.category || "").toLowerCase() === "build"; });
      grids.forEach(function (g) {
        if (!builds.length) { g.innerHTML = "<p class='lede'>New builds are being prepared in the CMS. Check back soon.</p>"; return; }
        g.innerHTML = "";
        builds.forEach(function (p) {
          var a = document.createElement("article");
          a.className = "card reveal in";
          var save = p.priceSlashed && p.price ? "<span class='save'>Save " + money(p.priceSlashed - p.price) + "</span>" : "";
          a.innerHTML = "<span class='mono'></span><h3></h3><p class='mono'></p><p></p>" +
            "<p><strong></strong> <s></s> " + save + "</p>" +
            "<div style='display:flex;gap:10px;flex-wrap:wrap;margin-top:6px'></div>";
          a.querySelector(".mono").textContent = (p.tier || "Build") + " · Build";
          a.querySelector("h3").textContent = p.name;
          a.querySelectorAll("p")[0].textContent = p.specs;
          a.querySelectorAll("p")[1].textContent = p.description;
          a.querySelector("strong").textContent = money(p.price);
          a.querySelector("s").textContent = p.priceSlashed ? money(p.priceSlashed) : "";
          var div = a.querySelector("div");
          var v = document.createElement("a"); v.className = "text-link"; v.href = "product.html?id=" + encodeURIComponent(p.id); v.textContent = "View build ↗";
          var c = document.createElement("button"); c.className = "text-link"; c.style.cursor = "pointer"; c.style.background = "none"; c.style.border = "0"; c.style.borderBottom = "1px solid var(--ink)"; c.textContent = "Add to cart +";
          c.onclick = function () { window.RigCart.add({ id: p.id, name: p.name, price: p.price, kind: "build", icon: "▣" }); };
          div.appendChild(v); div.appendChild(c);
          g.appendChild(a);
        });
      });
    });
  }

  function renderRepairRows() {
    var host = document.querySelector("[data-repairs-rows]");
    if (!host) return;
    fetchCMS("content/repairs.json", window.RIGSTORM.repairs).then(function (repairs) {
    host.innerHTML = "";
    repairs.forEach(function (s, i) {
      var row = document.createElement("div");
      row.className = "row";
      var price = s.price ? money(s.price) + (s.original ? " · was " + money(s.original) : "") : "Custom quote";
      row.innerHTML = "<span class='idx'></span><div><h3></h3><span class='price'></span></div><p></p><button class='go' aria-label='Add'>↗</button>";
      row.querySelector(".idx").textContent = "0" + (i + 1);
      row.querySelector("h3").textContent = s.icon + "  " + s.name;
      row.querySelector(".price").textContent = price;
      row.querySelector("p").textContent = s.description;
      row.querySelector(".go").onclick = function () {
        if (s.price) window.RigCart.add({ id: s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name: s.name, price: s.price, kind: "repair", icon: s.icon });
        else document.getElementById("repairForm").scrollIntoView({ behavior: "smooth" });
      };
      host.appendChild(row);
    });
    });
  }

  function renderGuideCards() {
    var host = document.querySelector("[data-guides-grid]");
    if (!host) return;
    fetchCMS("content/guides.json", window.RIGSTORM.guides).then(function (guides) {
    host.innerHTML = "";
    guides.forEach(function (g) {
      var a = document.createElement("article");
      a.className = "card";
      a.innerHTML = "<span class='mono'></span><h3></h3><p></p><p><strong></strong></p><div style='display:flex;gap:10px;flex-wrap:wrap'></div>";
      a.querySelector(".mono").textContent = g.specs + " · " + g.delivery;
      a.querySelector("h3").textContent = g.name;
      a.querySelectorAll("p")[0].textContent = g.description;
      a.querySelector("strong").textContent = money(g.price);
      var d = a.querySelector("div");
      var b = document.createElement("button"); b.className = "text-link"; b.style.cursor = "pointer"; b.style.background = "none"; b.style.border = "0"; b.style.borderBottom = "1px solid var(--ink)";
      b.textContent = "Add to cart +";
      b.onclick = function () { window.RigCart.add({ id: g.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name: g.name, price: g.price, kind: "guide", icon: "◈" }); };
      d.appendChild(b);
      host.appendChild(a);
    });
    });
  }

  function renderProductDetail() {
    var host = document.getElementById("productDetail");
    if (!host) return;
    var id = new URLSearchParams(location.search).get("id") || "stormcore-king";
    fetchCMS("content/products.json", window.RIGSTORM.products).then(function (all) {
    var p = all.find(function (x) { return x.id === id; }) || all[0];
    document.title = p.name + " — RigStorm Labs";
    host.querySelector("[data-p-tier]").textContent = (p.tier || "") + " · " + p.category;
    host.querySelector("[data-p-name]").textContent = p.name;
    host.querySelector("[data-p-desc]").textContent = p.description;
    host.querySelector("[data-p-specs]").textContent = p.specs;
    host.querySelector("[data-p-price]").textContent = money(p.price);
    var was = host.querySelector("[data-p-was]");
    if (p.priceSlashed) { was.textContent = money(p.priceSlashed); was.style.display = ""; } else was.style.display = "none";
    var img = host.querySelector("[data-p-img]");
    if (img) { img.src = p.image || "assets/logo.png"; img.alt = p.name; }
    var add = host.querySelector("[data-p-add]");
    if (add) add.onclick = function () { window.RigCart.add({ id: p.id, name: p.name, price: p.price, kind: p.category.toLowerCase(), icon: "▣" }); };
    var item = host.querySelector("[data-buy-item]");
    if (item) item.value = p.name + " (" + p.id + ") — " + money(p.price);
    });
  }

  function renderEco() {
    document.querySelectorAll("[data-eco-grid]").forEach(function (g) {
      g.innerHTML = "";
      window.RIGSTORM.ecosystem.forEach(function (e) {
        var a = document.createElement("a");
        a.href = e.url; a.target = "_blank"; a.rel = "noopener";
        a.innerHTML = "<span></span><strong></strong>";
        a.querySelector("span").textContent = e.note + " ↗";
        a.querySelector("strong").textContent = e.name;
        g.appendChild(a);
      });
    });
  }
})();
