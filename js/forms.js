/* RigStorm Labs — Modal forms (Formspree with inline success) */
(function () {
  const endpoints = window.RigStormConfig.forms;
  const modalBackdrop = () => document.getElementById("modalBackdrop");
  const modalBody = () => document.getElementById("modalBody");

  function open(html) {
    modalBody().innerHTML = html;
    modalBackdrop().classList.add("show");
    modalBackdrop().setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function close() {
    modalBackdrop().classList.remove("show");
    modalBackdrop().setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function paymentBlock(selectedValue) {
    const opts = [
      { id: "prepaid", label: "Pre-Paid Cash", active: true },
      { id: "cod",     label: "Cash on Delivery", dev: true },
      { id: "upi",     label: "UPI", dev: true },
      { id: "card",    label: "Credit Card", dev: true }
    ];
    return `
      <label>Payment Method</label>
      <div class="payment-grid">
        ${opts.map(o => `
          <div class="payment-opt ${o.dev ? "disabled" : ""} ${o.id === "prepaid" ? "selected" : ""}" data-payment="${o.id}">
            <input type="radio" name="payment" value="${o.label}" ${o.id === "prepaid" ? "checked" : ""} ${o.dev ? "disabled" : ""}>
            <span>${o.label}</span>
            ${o.dev ? '<span class="dev-tag">In Development</span>' : ""}
          </div>
        `).join("")}
      </div>
      <input type="hidden" name="payment_method" id="paymentMethod" value="${selectedValue || "Pre-Paid Cash"}">
      <div class="hint">Only Pre-Paid Cash is currently active. Other methods are in development.</div>`;
  }

  function contactField(label, hint) {
    return `
      <div class="field">
        <label>${label} <span class="req">*</span></label>
        <input type="text" name="email_or_phone" data-contact required placeholder="you@email.com or +91...">
        <div class="hint">${hint}</div>
        <div class="form-error" data-contact-err></div>
      </div>`;
  }

  function validateContact(form) {
    const f = form.querySelector("[data-contact]");
    const err = form.querySelector("[data-contact-err]");
    const val = (f.value || "").trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    const phoneOk = /^[+]?[\d\s()-]{8,15}$/.test(val);
    if (!emailOk && !phoneOk) {
      err.textContent = "Enter a valid email or phone number.";
      f.focus();
      return false;
    }
    err.textContent = "";
    f.value = val;
    return true;
  }

  function successHtml(title, message, extra) {
    return `
      <div class="form-success">
        <div class="ic">✅</div>
        <h3>${title}</h3>
        <p>${message}</p>
        ${extra ? `<p style="margin-top:14px;font-size:.9rem;color:var(--accent-2)">${extra}</p>` : ""}
      </div>`;
  }

  async function submit(form, endpoint, onOk) {
    const errorEl = form.querySelector("[data-form-err]");
    const submitBtn = form.querySelector("[type=submit]");
    const original = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";
    try {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        if (typeof onOk === "function") onOk(data);
        return true;
      }
      let msg = "Something went wrong. Please try again.";
      try { const j = await res.json(); if (j.errors) msg = j.errors.map(e => e.message).join(" "); } catch (_) {}
      errorEl.textContent = msg;
    } catch (e) {
      errorEl.textContent = "Network error. Please check your connection.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = original;
    }
    return false;
  }

  function bindDelegates() {
    document.addEventListener("click", async (e) => {
      const t = e.target.closest(`
          [data-open-form="custom-build"],
          [data-open-form="buy-now"],
          [data-open-form="repair"],
          [data-open-form="upgrade"],
          [data-buy-guide],
          [data-repair]
      `);
      if (!t) return;

      // Determine intent
      if (t.dataset.openForm === "custom-build") return customBuildForm();
      if (t.dataset.openForm === "upgrade") return upgradeForm();
      if (t.dataset.openForm === "repair") return repairForm();
      if (t.dataset.buyGuide) return buyNowForm({ kind: "guide", name: t.dataset.buyGuide, price: t.dataset.price });
      if (t.dataset.repair) {
        if (t.dataset.repairForm) return repairForm(t.dataset.repair);
        return buyNowForm({ kind: "repair", name: t.dataset.repair, price: t.dataset.price });
      }
    });

    document.addEventListener("click", (e) => {
      const popt = e.target.closest(".payment-opt");
      if (!popt || popt.classList.contains("disabled")) return;
      document.querySelectorAll(".payment-opt").forEach(o => {
        o.classList.toggle("selected", o === popt);
        const r = o.querySelector("input");
        if (r) r.checked = (o === popt);
      });
      const hidden = document.querySelector("#paymentMethod");
      if (hidden) hidden.value = popt.textContent.replace("In Development", "").trim();
    });

    document.querySelectorAll("[data-close-modal]").forEach(b =>
      b.addEventListener("click", close));
    modalBackdrop()?.addEventListener("click", (e) => { if (e.target === modalBackdrop()) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

    // Buy Now buttons (Airtable products)
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-buy-now]");
      if (!b) return;
      buyNowForm({
        kind: "build",
        id: b.dataset.id,
        name: decodeURIComponent(b.dataset.name || ""),
        price: b.dataset.price
      });
    });
  }

  /* ========== Form builders ========== */
  function customBuildForm() {
    open(`
      <h3 class="modal-title">Build Your Custom PC 🛠️</h3>
      <p class="modal-sub">Tell us your requirements — RigStorm engineers will craft the perfect rig.</p>
      <form class="form" id="rsf">
        <div class="field"><label>Name <span class="req">*</span></label><input name="name" required></div>
        ${contactField("Email OR Phone", "At least one is mandatory so we can reach you.")}
        <div class="field"><label>Address</label><textarea name="address" rows="2"></textarea></div>
        <div class="field"><label>Requirements <span class="req">*</span></label>
          <textarea name="requirements" rows="4" required placeholder="Budget, use case, games/apps, performance targets, aesthetic…"></textarea>
        </div>
        <div class="form-error" data-form-err></div>
        <button type="submit" class="btn btn-primary btn-glow">Submit Build Request</button>
      </form>
    `);
    const form = document.getElementById("rsf");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateContact(form)) return;
      submit(form, endpoints.customBuild, () => {
        open(successHtml(
          "Build Request Received!",
          "Our engineers will review your requirements and reply shortly.",
          "Check your email/phone for the next step."
        ));
      });
    });
  }

  function buyNowForm({ kind, id, name, price }) {
    const ctxLabel = kind === "guide" ? "Digital Guide" : kind === "repair" ? "Service" : "Pre-Built PC";
    open(`
      <h3 class="modal-title">Buy Now — ${name || "Item"} 🛒</h3>
      <p class="modal-sub">${ctxLabel}${price && price !== "0" ? " · " + window.AirtableClient.formatPrice(price) : ""}</p>
      <form class="form" id="rsf">
        <input type="hidden" name="item_kind" value="${kind}">
        <input type="hidden" name="item_id" value="${id || ""}">
        <input type="hidden" name="item_name" value="${name || ""}">
        <input type="hidden" name="item_price" value="${price || ""}">
        <div class="field"><label>Name <span class="req">*</span></label><input name="name" required></div>
        ${contactField("Email OR Phone", "At least one is mandatory — the guide is sent via email reply.")}
        <div class="field"><label>Address</label><textarea name="address" rows="2"></textarea></div>
        <div class="field">${paymentBlock("Pre-Paid Cash")}</div>
        <div class="form-error" data-form-err></div>
        <button type="submit" class="btn btn-primary btn-glow">Place Order</button>
      </form>
    `);
    const form = document.getElementById("rsf");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateContact(form)) return;
      submit(form, endpoints.buyNow, () => {
        const extra = kind === "guide" ? "Receive the Guide in Email reply." : null;
        open(successHtml(
          "Order Confirmed — Thank You!",
          `We've received your order${name ? " for " + name : ""}. Our team will contact you shortly to complete payment and delivery.`,
          extra
        ));
      });
    });
  }

  function repairForm(prefilled) {
    open(`
      <h3 class="modal-title">Repair Request 🔧</h3>
      <p class="modal-sub">Describe what's up with your rig — we'll get it back in fighting shape.</p>
      <form class="form" id="rsf">
        <input type="hidden" name="service" value="${prefilled || "Diagnosis/Other"}">
        <div class="field"><label>Name <span class="req">*</span></label><input name="name" required></div>
        ${contactField("Email OR Phone", "At least one is mandatory.")}
        <div class="field"><label>Address</label><textarea name="address" rows="2"></textarea></div>
        <div class="field"><label>Repair Details / Issue <span class="req">*</span></label>
          <textarea name="repair_details" rows="4" required placeholder="What's wrong, when did it start, any error messages…"></textarea>
        </div>
        <div class="field">${paymentBlock("Pre-Paid Cash")}</div>
        <div class="form-error" data-form-err></div>
        <button type="submit" class="btn btn-primary btn-glow">Submit Repair Request</button>
      </form>
    `);
    const form = document.getElementById("rsf");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateContact(form)) return;
      submit(form, endpoints.repair, () => {
        open(successHtml(
          "Repair Request Received!",
          "We'll review the issue and reply with a quote / next steps shortly."
        ));
      });
    });
  }

  function upgradeForm() {
    open(`
      <h3 class="modal-title">Upgrade Your PC ⚡</h3>
      <p class="modal-sub">Share your current specs and goals — get a tailored upgrade path.</p>
      <form class="form" id="rsf">
        <div class="field"><label>Name <span class="req">*</span></label><input name="name" required></div>
        ${contactField("Email OR Phone", "At least one is mandatory.")}
        <div class="field"><label>Address</label><textarea name="address" rows="2"></textarea></div>
        <div class="field"><label>Current PC Specs <span class="req">*</span></label>
          <textarea name="current_specs" rows="3" required placeholder="CPU / GPU / RAM / Storage / Motherboard / PSU…"></textarea>
        </div>
        <div class="field"><label>Upgrade Requirements <span class="req">*</span></label>
          <textarea name="upgrade_requirements" rows="3" required placeholder="Goals (fps, resolution, render, longevity) and budget…"></textarea>
        </div>
        <div class="form-error" data-form-err></div>
        <button type="submit" class="btn btn-primary btn-glow">Request Upgrades</button>
      </form>
    `);
    const form = document.getElementById("rsf");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateContact(form)) return;
      submit(form, endpoints.upgrade, () => {
        open(successHtml(
          "Upgrade Request Received!",
          "We'll analyze your rig and reply with the best upgrade path shortly."
        ));
      });
    });
  }

  window.RigStormForms = {
    open, close, customBuildForm, buyNowForm, repairForm, upgradeForm,
    customBuild: customBuildForm, openCustomBuild: customBuildForm, openUpgrade: upgradeForm
  };

  document.addEventListener("DOMContentLoaded", bindDelegates);
})();
