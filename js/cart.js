/* RigStorm Labs — cart (localStorage, no fake data) */
(function () {
  var KEY = "rigstorm_cart";
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
    render();
    updateCount();
  }
  function updateCount() {
    var items = load();
    var n = items.reduce(function (a, it) { return a + (it.qty || 1); }, 0);
    document.querySelectorAll("[data-cart-count]").forEach(function (el) { el.textContent = n > 0 ? "(" + n + ")" : ""; });
  }
  function add(item) {
    var items = load();
    var found = items.find(function (i) { return i.id === item.id && i.kind === item.kind; });
    if (found) found.qty = (found.qty || 1) + 1;
    else items.push({ id: item.id, name: item.name, price: item.price || 0, kind: item.kind || "build", icon: item.icon || "▣", qty: 1 });
    save(items);
    open();
  }
  function total() {
    return load().reduce(function (a, it) { return a + (Number(it.price) || 0) * (it.qty || 1); }, 0);
  }
  function render() {
    var box = document.getElementById("cartItems");
    if (!box) return;
    var items = load();
    var foot = document.getElementById("cartFoot");
    if (!items.length) {
      box.innerHTML = '<p class="empty">Your cart is empty. Add a build, a repair service, or a guide to get started.</p>';
      if (foot) foot.style.display = "none";
      return;
    }
    if (foot) foot.style.display = "";
    box.innerHTML = "";
    items.forEach(function (it, idx) {
      var div = document.createElement("div");
      div.className = "cart-item";
      var price = it.price ? "₹" + Number(it.price).toLocaleString("en-IN") : "Custom quote";
      div.innerHTML = "<div><b></b><div class='m'></div>" +
        "<div class='cart-qty'><button class='qty-btn' data-a='dec'>−</button><span class='m'></span><button class='qty-btn' data-a='inc'>+</button>" +
        "<button class='qty-btn' data-a='rm' aria-label='Remove'>×</button></div></div><div class='m'></div>";
      div.querySelector("b").textContent = (it.icon ? it.icon + " " : "") + it.name;
      div.querySelectorAll(".m")[0].textContent = it.kind + " · " + price;
      div.querySelectorAll(".m")[1].textContent = "× " + (it.qty || 1);
      div.querySelectorAll(".m")[2].textContent = it.price ? "₹" + (Number(it.price) * (it.qty || 1)).toLocaleString("en-IN") : "—";
      div.querySelector("[data-a='inc']").onclick = function () { items[idx].qty++; save(items); };
      div.querySelector("[data-a='dec']").onclick = function () { items[idx].qty = Math.max(1, (items[idx].qty || 1) - 1); save(items); };
      div.querySelector("[data-a='rm']").onclick = function () { items.splice(idx, 1); save(items); };
      box.appendChild(div);
    });
    var t = document.getElementById("cartTotal");
    if (t) t.textContent = "₹" + total().toLocaleString("en-IN");
  }
  function open() { document.getElementById("cartDrawer").classList.add("open"); document.getElementById("cartOverlay").classList.add("open"); render(); }
  function close() { document.getElementById("cartDrawer").classList.remove("open"); document.getElementById("cartOverlay").classList.remove("open"); }
  window.RigCart = { add: add, open: open, close: close, load: load, total: total, render: render, updateCount: updateCount, clear: function () { save([]); } };
  document.addEventListener("DOMContentLoaded", function () {
    render(); updateCount();
    document.querySelectorAll("[data-open-cart]").forEach(function (b) { b.addEventListener("click", open); });
    var ov = document.getElementById("cartOverlay"); if (ov) ov.addEventListener("click", close);
    var x = document.getElementById("cartClose"); if (x) x.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    document.querySelectorAll("[data-add-cart]").forEach(function (b) {
      b.addEventListener("click", function () {
        add({ id: b.getAttribute("data-add-cart"), name: b.getAttribute("data-name") || b.getAttribute("data-add-cart"), price: Number(b.getAttribute("data-price")) || 0, kind: b.getAttribute("data-kind") || "build", icon: b.getAttribute("data-icon") || "▣" });
      });
    });
    var co = document.getElementById("checkoutBtn");
    if (co) co.addEventListener("click", function () {
      var items = load();
      if (!items.length) return;
      var lines = items.map(function (i) { return "- " + i.name + " (" + i.kind + ") x" + (i.qty || 1) + " — ₹" + ((Number(i.price) || 0) * (i.qty || 1)).toLocaleString("en-IN"); });
      var body = "Cart checkout request:\n" + lines.join("\n") + "\nTotal: ₹" + total().toLocaleString("en-IN");
      fetch(window.RIGSTORM.endpoints.buy_now, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify({ cart: items, total: total(), message: body }) })
        .then(function (r) {
          var msg = document.getElementById("cartMsg");
          if (r.ok) { if (msg) { msg.style.display = "block"; msg.textContent = "Request sent. We will reply to confirm payment and delivery."; } window.RigCart.clear(); }
          else if (msg) { msg.style.display = "block"; msg.textContent = "Could not send just now — please try again or use the contact form."; }
        })
        .catch(function () {
          var msg = document.getElementById("cartMsg");
          if (msg) { msg.style.display = "block"; msg.textContent = "Network error — please try again."; }
        });
    });
  });
})();
