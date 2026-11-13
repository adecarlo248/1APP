(function () {
  var catalog = window.HUB_CATALOG || [];
  var MAX = 12;
  var state = { mode: "", qtys: {}, cadence: "", step: 1 };
  catalog.forEach(function (product) { state.qtys[product.id] = 0; });
  var error = document.getElementById("sub-error");
  var steps = Array.prototype.slice.call(document.querySelectorAll("[data-sub-step]"));
  var productBox = document.getElementById("sub-products");
  var live = document.getElementById("sub-live");

  catalog.forEach(function (product) {
    var row = document.createElement("article");
    row.className = "sauce-pick";
    row.innerHTML =
      "<div><strong>" + product.name + "</strong><p>" + product.blurb + " · $" + product.price.toFixed(2) + " CAD shelf price</p></div>" +
      '<div class="qty">' +
      '<button type="button" data-sub-dec="' + product.id + '" aria-label="Decrease ' + product.name + '">−</button>' +
      '<input class="qty-input" type="number" inputmode="numeric" min="0" max="' + MAX + '" value="0" data-sub-qty="' + product.id + '" aria-label="Quantity for ' + product.name + '">' +
      '<button type="button" data-sub-inc="' + product.id + '" aria-label="Increase ' + product.name + '">+</button>' +
      "</div>";
    productBox.appendChild(row);
  });

  function showError(message) {
    error.textContent = message || "";
  }

  function clamp(n) {
    n = Math.round(Number(n) || 0);
    return Math.max(0, Math.min(MAX, n));
  }

  function setQty(id, qty) {
    state.qtys[id] = clamp(qty);
    var input = productBox.querySelector('[data-sub-qty="' + id + '"]');
    if (input) input.value = String(state.qtys[id]);
    paintLive();
  }

  function chosen() {
    return catalog.filter(function (product) { return state.qtys[product.id] > 0; });
  }

  function jarCount() {
    return chosen().reduce(function (sum, product) { return sum + state.qtys[product.id]; }, 0);
  }

  function shelfTotal() {
    return chosen().reduce(function (sum, product) { return sum + product.price * state.qtys[product.id]; }, 0);
  }

  function itemsLabel() {
    var items = chosen();
    if (!items.length) return "No sauces selected.";
    return items.map(function (product) {
      return product.name + " × " + state.qtys[product.id];
    }).join(", ");
  }

  function paintLive() {
    if (!live) return;
    var items = chosen();
    live.textContent = items.length
      ? itemsLabel() + ". Shelf subtotal $" + shelfTotal().toFixed(2) + " CAD."
      : "No sauces selected. Shelf subtotal $0.00 CAD.";
  }

  function paint() {
    document.querySelectorAll("[data-mode]").forEach(function (btn) {
      var on = btn.getAttribute("data-mode") === state.mode;
      btn.classList.toggle("selected", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
    document.querySelectorAll("[data-cadence]").forEach(function (btn) {
      var on = btn.getAttribute("data-cadence") === state.cadence;
      btn.classList.toggle("selected", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
    paintLive();
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
    if (step === 4 || step === 5 || step === 6) fill();
  }

  function cadenceLabel() {
    if (state.cadence === "monthly") return "Monthly · illustrative";
    if (state.cadence === "bimonthly") return "Every two months · illustrative";
    return "—";
  }

  function fill() {
    var repeat = state.mode === "repeat";
    ["sum", "done"].forEach(function (prefix) {
      var nodes = {
        mode: repeat ? "Pantry Refill · proposed concept" : "One-time, in the live Square store",
        item: repeat ? itemsLabel() : "Order in the live Square store",
        qty: repeat ? String(jarCount()) : "—",
        cadence: repeat ? cadenceLabel() : "Not a refill",
        shelf: repeat ? "$" + shelfTotal().toFixed(2) + " CAD" : "See the live Square shop",
        recurring: "Price isn’t set on this demo",
        ship: "Price isn’t set on this demo",
        first: "Price isn’t set on this demo"
      };
      Object.keys(nodes).forEach(function (key) {
        var node = document.getElementById(prefix + "-" + key);
        if (node) node.textContent = nodes[key];
      });
    });
  }

  function validate(step) {
    if (step === 1 && !state.mode) return "Choose one-time or Pantry Refill to continue.";
    if (step === 2 && !chosen().length) return "Add at least one sauce. Each quantity starts at zero.";
    if (step === 3 && !state.cadence) return "Choose an illustrative cadence. Neither one is preselected.";
    return "";
  }

  document.getElementById("sub-form").addEventListener("submit", function (event) {
    event.preventDefault();
  });

  document.body.addEventListener("click", function (event) {
    var mode = event.target.closest("[data-mode]");
    if (mode) { state.mode = mode.getAttribute("data-mode"); paint(); showError(""); }
    var cadence = event.target.closest("[data-cadence]");
    if (cadence) { state.cadence = cadence.getAttribute("data-cadence"); paint(); showError(""); }
    var inc = event.target.closest("[data-sub-inc]");
    if (inc) { setQty(inc.getAttribute("data-sub-inc"), state.qtys[inc.getAttribute("data-sub-inc")] + 1); showError(""); }
    var dec = event.target.closest("[data-sub-dec]");
    if (dec) { setQty(dec.getAttribute("data-sub-dec"), state.qtys[dec.getAttribute("data-sub-dec")] - 1); showError(""); }
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

  document.body.addEventListener("change", function (event) {
    var input = event.target.closest("[data-sub-qty]");
    if (!input) return;
    setQty(input.getAttribute("data-sub-qty"), input.value);
    showError("");
  });

  go(1);
  paint();
})();
