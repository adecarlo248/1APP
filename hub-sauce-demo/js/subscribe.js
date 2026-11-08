(function () {
  var catalog = window.HUB_CATALOG || [];
  var state = { mode: "", id: "", qty: 1, cadence: "", step: 1 };
  var error = document.getElementById("sub-error");
  var steps = Array.prototype.slice.call(document.querySelectorAll("[data-sub-step]"));
  var productBox = document.getElementById("sub-products");

  catalog.forEach(function (product) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice";
    btn.setAttribute("data-product", product.id);
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", "false");
    btn.innerHTML = "<strong>" + product.name + "</strong><small>" + product.blurb + " · $" + product.price.toFixed(2) + " CAD shelf price</small>";
    productBox.appendChild(btn);
  });

  function showError(message) {
    error.textContent = message || "";
  }

  function paint() {
    document.querySelectorAll("[data-mode]").forEach(function (btn) {
      var on = btn.getAttribute("data-mode") === state.mode;
      btn.classList.toggle("selected", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
    document.querySelectorAll("[data-product]").forEach(function (btn) {
      var on = btn.getAttribute("data-product") === state.id;
      btn.classList.toggle("selected", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
    document.querySelectorAll("[data-cadence]").forEach(function (btn) {
      var on = btn.getAttribute("data-cadence") === state.cadence;
      btn.classList.toggle("selected", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
    var qty = document.getElementById("sub-qty");
    if (qty) qty.textContent = String(state.qty);
  }

  function go(step) {
    state.step = step;
    steps.forEach(function (panel) {
      panel.hidden = Number(panel.getAttribute("data-sub-step")) !== step;
    });
    document.querySelectorAll("[data-sub-goto]").forEach(function (btn) {
      var n = Number(btn.getAttribute("data-sub-goto"));
      btn.setAttribute("aria-current", n === step ? "step" : "false");
      btn.classList.toggle("done", n < step);
    });
    showError("");
    var heading = document.querySelector('[data-sub-step="' + step + '"] h2');
    if (heading) heading.focus();
    if (step === 4 || step === 5) fill();
  }

  function product() {
    return catalog.find(function (item) { return item.id === state.id; });
  }

  function cadenceLabel() {
    if (state.cadence === "monthly") return "Monthly · illustrative";
    if (state.cadence === "bimonthly") return "Every two months · illustrative";
    return "—";
  }

  function fill() {
    var item = product();
    var name = item ? item.name : "—";
    var shelf = item ? "$" + (item.price * state.qty).toFixed(2) + " CAD" : "—";
    ["sum", "done"].forEach(function (prefix) {
      var nodes = {
        mode: state.mode === "repeat" ? "Pantry Refill · proposed concept" : "One-time, in the live Square store",
        item: name,
        qty: String(state.qty),
        cadence: state.mode === "repeat" ? cadenceLabel() : "Not a refill",
        shelf: state.mode === "repeat" ? shelf : "See the live Square shop",
        recurring: "Pricing to be confirmed",
        ship: "Pricing to be confirmed",
        first: "Pricing to be confirmed"
      };
      Object.keys(nodes).forEach(function (key) {
        var node = document.getElementById(prefix + "-" + key);
        if (node) node.textContent = nodes[key];
      });
    });
  }

  function validate(step) {
    if (step === 1 && !state.mode) return "Choose one-time or Pantry Refill to continue.";
    if (step === 2 && !state.id) return "Choose a product. Nothing is selected for you.";
    if (step === 2 && state.qty < 1) return "Quantity needs to be at least 1.";
    if (step === 3 && !state.cadence) return "Choose an illustrative cadence. Neither one is preselected.";
    return "";
  }

  document.getElementById("sub-form").addEventListener("submit", function (event) {
    event.preventDefault();
  });

  document.body.addEventListener("click", function (event) {
    var mode = event.target.closest("[data-mode]");
    if (mode) { state.mode = mode.getAttribute("data-mode"); paint(); showError(""); }
    var picked = event.target.closest("[data-product]");
    if (picked) { state.id = picked.getAttribute("data-product"); paint(); showError(""); }
    var cadence = event.target.closest("[data-cadence]");
    if (cadence) { state.cadence = cadence.getAttribute("data-cadence"); paint(); showError(""); }
    if (event.target.closest("[data-qty-inc]")) { state.qty += 1; paint(); }
    if (event.target.closest("[data-qty-dec]")) { state.qty = Math.max(1, state.qty - 1); paint(); }
    if (event.target.closest("[data-sub-next]")) {
      var problem = validate(state.step);
      if (problem) { showError(problem); return; }
      if (state.step === 1 && state.mode === "once") { fill(); go(5); return; }
      go(state.step + 1);
    }
    if (event.target.closest("[data-sub-back]")) {
      if (state.step === 5 && state.mode === "once") { go(1); return; }
      go(Math.max(1, state.step - 1));
    }
    var edit = event.target.closest("[data-sub-edit]");
    if (edit) go(Number(edit.getAttribute("data-sub-edit")));
    var jump = event.target.closest("[data-sub-goto]");
    if (jump && event.target.closest(".progress")) {
      var target = Number(jump.getAttribute("data-sub-goto"));
      if (target < state.step) go(target);
    }
    if (event.target.closest("[data-sub-finish]")) {
      if (state.mode === "repeat") {
        var problem = validate(2) || validate(3);
        if (problem || !state.mode) { showError(problem || "Go back and complete the concept."); return; }
      }
      fill();
      var copy = document.getElementById("sub-done-copy");
      copy.innerHTML = "<strong>Demo complete — no subscription started.</strong> Nothing was charged, saved, or sent to Square. A Pantry Refill price has not been set.";
      go(6);
      copy.focus();
    }
    if (event.target.closest("[data-sub-restart]")) window.location.reload();
  });

  go(1);
  paint();
})();
