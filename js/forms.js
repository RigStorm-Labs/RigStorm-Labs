/* RigStorm Labs — forms: validation + Formspree submit */
(function () {
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE = /^[+]?[\d\s()-]{8,15}$/;
  function validContact(v) { return EMAIL.test(v.trim()) || PHONE.test(v.trim()); }
  function bind(formId, okText) {
    var form = document.getElementById(formId);
    if (!form) return;
    var ok = form.querySelector(".form-ok");
    var err = form.querySelector(".form-err");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (err) err.style.display = "none";
      var contact = form.querySelector("[data-contact]");
      if (contact && !validContact(contact.value)) {
        if (err) { err.style.display = "block"; err.textContent = "Please enter a valid email address or phone number."; }
        contact.focus();
        return;
      }
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = form.querySelector("[type=submit]");
      var orig = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      fetch(form.action, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data) })
        .then(function (r) {
          if (r.ok) {
            form.reset();
            if (ok) { ok.style.display = "block"; ok.textContent = okText || "Received. We will reply within two business days."; }
          } else if (err) { err.style.display = "block"; err.textContent = "Something went wrong sending the form. Please try again."; }
        })
        .catch(function () { if (err) { err.style.display = "block"; err.textContent = "Network error. Please check your connection and try again."; } })
        .finally(function () { if (btn) { btn.disabled = false; btn.textContent = orig; } });
    });
  }
  document.addEventListener("DOMContentLoaded", function () {
    bind("customBuildForm", "Build brief received. We will reply with a starting point.");
    bind("buyForm", "Order request received. We will reply to confirm payment and delivery.");
    bind("repairForm", "Repair request received. We will reply with confirmation and quote.");
    bind("upgradeForm", "Upgrade request received. We will reply with a tailored upgrade path.");
    bind("contactForm", "Message received. We will get back to you shortly.");
  });
  window.RigForms = { validContact: validContact };
})();
