/* RigStorm Labs — Cart (localStorage + drawer) */
(function () {
  const KEY = "rigstorm_cart";
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY)) || []; } catch (_) { cart = []; }

  function save() { localStorage.setItem(KEY, JSON.stringify(cart)); }

  function total() { return cart.reduce((t, i) => t + (i.price || 0) * i.qty, 0); }
  function count() { return cart.reduce((t, i) => t + i.qty, 0); }

  function add({ id, name, price, kind, icon }) {
    const existing = cart.find(i => i.id === id && i.kind === kind);
    if (existing) existing.qty += 1;
    else cart.push({ id, name, price: Number(price) || 0, kind: kind || "build", icon: icon || "🖥️", qty: 1 });
    save(); render(); toast(`Added ${name} to cart`);
  }

  function remove(idx) { cart.splice(idx, 1); save(); render(); }
  function clear() { cart = []; save(); render(); }

  function toast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._tid);
    toast._tid = setTimeout(() => t.classList.remove("show"), 2400);
  }

  function render() {
    const countEl = document.getElementById("cartCount");
    if (countEl) countEl.textContent = count();
    const items = document.getElementById("cartItems");
    const totalEl = document.getElementById("cartTotal");
    const checkoutBtn = document.getElementById("cartCheckout");
    if (!items) return;
    if (!cart.length) {
      items.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
      if (totalEl) totalEl.textContent = "₹0";
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }
    items.innerHTML = cart.map((i, idx) => `
      <div class="cart-item">
        <div class="cart-item-img">${i.icon || "🖥️"}</div>
        <div class="cart-item-info">
          <strong>${i.name}</strong>
          <small>${window.AirtableClient ? AirtableClient.formatPrice(i.price) : "₹" + i.price} × ${i.qty}</small>
        </div>
        <button class="cart-item-remove" data-rm="${idx}" aria-label="Remove">✕</button>
      </div>
    `).join("");
    if (totalEl) totalEl.textContent = window.AirtableClient ? AirtableClient.formatPrice(total()) : "₹" + total();
    if (checkoutBtn) checkoutBtn.disabled = false;
  }

  function openDrawer() {
    document.getElementById("cartDrawer")?.classList.add("show");
    document.getElementById("cartDrawer")?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    document.getElementById("cartDrawer")?.classList.remove("show");
    document.getElementById("cartDrawer")?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function checkout() {
    if (!cart.length) return;
    // Build a combined order via the buy-now form
    const names = cart.map(i => `${i.name} ×${i.qty}`).join(", ");
    const totalPrice = total();
    window.RigStormForms.buyNowForm({
      kind: "cart",
      id: "cart",
      name: `Cart: ${names} (Total ${totalPrice})`,
      price: totalPrice
    });
  }

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-add-cart]")) {
      const b = e.target.closest("[data-add-cart]");
      add({ id: b.dataset.id, name: b.dataset.name, price: b.dataset.price,
            kind: b.dataset.kind || "build", icon: b.dataset.icon });
    }
    if (e.target.closest("[data-rm]")) remove(Number(e.target.closest("[data-rm]").dataset.rm));
    if (e.target.closest("#cartBtn")) openDrawer();
    if (e.target.closest("#cartClose")) closeDrawer();
    if (e.target.closest("#cartCheckout")) checkout();
  });

  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("cartClose")?.addEventListener("click", closeDrawer);
    render();
  });

  window.RigStormCart = { add, remove, clear, total, count, render, openDrawer, closeDrawer };
})();
