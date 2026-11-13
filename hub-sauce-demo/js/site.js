(function () {
  var catalog = window.HUB_BY_ID || {};
  var KEY = "hubSauceDemoCart";

  function money(n) {
    return "$" + n.toFixed(2) + " CAD";
  }

  function readCart() {
    try {
      var raw = JSON.parse(sessionStorage.getItem(KEY) || "[]");
      if (!Array.isArray(raw)) return [];
      return raw.filter(function (line) {
        return line && catalog[line.id] && line.qty > 0;
      });
    } catch (e) {
      return [];
    }
  }

  function writeCart(lines) {
    sessionStorage.setItem(KEY, JSON.stringify(lines));
    renderCart();
  }

  function clampQty(qty, min, max) {
    qty = Math.round(Number(qty) || 0);
    return Math.max(min, Math.min(max, qty));
  }

  function add(id, qty) {
    qty = clampQty(qty || 1, 1, 12);
    var lines = readCart();
    var found = lines.find(function (line) { return line.id === id; });
    if (found) found.qty = Math.min(24, found.qty + qty);
    else lines.push({ id: id, qty: qty });
    writeCart(lines);
    openDrawer();
  }

  function setQty(id, qty) {
    qty = clampQty(qty, 0, 24);
    var lines = readCart().map(function (line) {
      return line.id === id ? { id: id, qty: qty } : line;
    }).filter(function (line) { return line.qty > 0; });
    writeCart(lines);
  }

  var drawer = document.getElementById("drawer");
  var cartList = document.getElementById("cart-lines");
  var cartTotal = document.getElementById("cart-total");
  var cartCount = document.getElementById("cart-count");
  var cartNote = document.getElementById("cart-empty");

  function renderCart() {
    if (!cartList) return;
    var lines = readCart();
    var count = lines.reduce(function (sum, line) { return sum + line.qty; }, 0);
    if (cartCount) cartCount.textContent = String(count);
    cartList.innerHTML = "";
    if (!lines.length) {
      if (cartNote) cartNote.hidden = false;
      if (cartTotal) cartTotal.textContent = money(0);
      return;
    }
    if (cartNote) cartNote.hidden = true;
    var total = 0;
    lines.forEach(function (line) {
      var product = catalog[line.id];
      total += product.price * line.qty;
      var row = document.createElement("div");
      row.className = "cart-line";
      row.innerHTML =
        '<img src="' + product.image + '" alt="">' +
        '<div><strong>' + product.name + '</strong><div>' + money(product.price) + '</div>' +
        '<div class="qty"><button type="button" data-dec="' + product.id + '" aria-label="Decrease ' + product.name + '">−</button>' +
        '<input class="qty-input" type="number" inputmode="numeric" min="0" max="24" value="' + line.qty + '" data-qty-for="' + product.id + '" aria-label="Quantity for ' + product.name + '">' +
        '<button type="button" data-inc="' + product.id + '" aria-label="Increase ' + product.name + '">+</button></div></div>' +
        '<button type="button" class="text-btn" data-remove="' + product.id + '">Remove</button>';
      cartList.appendChild(row);
    });
    if (cartTotal) cartTotal.textContent = money(total);
  }

  function openDrawer() {
    if (!drawer) return;
    drawer.hidden = false;
    var close = drawer.querySelector("[data-close-drawer]");
    if (close) close.focus();
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.hidden = true;
  }

  document.addEventListener("click", function (event) {
    var stepBtn = event.target.closest("[data-step]");
    if (stepBtn) {
      var field = stepBtn.closest(".qty").querySelector(".qty-input");
      if (field && !field.hasAttribute("data-qty-for") && !field.hasAttribute("data-sub-qty")) {
        var next = clampQty(Number(field.value) + Number(stepBtn.getAttribute("data-step")), Number(field.min || 0), Number(field.max || 12));
        field.value = String(next);
      }
      return;
    }
    var addBtn = event.target.closest("[data-add]");
    if (addBtn) {
      var scope = addBtn.closest("#product-actions, #quick") || document;
      var input = scope.querySelector(".qty-input");
      add(addBtn.getAttribute("data-add"), input ? input.value : 1);
      var quickDialog = document.getElementById("quick");
      if (quickDialog && quickDialog.open) quickDialog.close();
      return;
    }
    if (event.target.closest("[data-open-cart]")) openDrawer();
    if (event.target.closest("[data-close-drawer]")) closeDrawer();
    var inc = event.target.closest("[data-inc]");
    var dec = event.target.closest("[data-dec]");
    var remove = event.target.closest("[data-remove]");
    if (inc || dec || remove) {
      var id = (inc || dec || remove).getAttribute(inc ? "data-inc" : dec ? "data-dec" : "data-remove");
      var current = readCart().find(function (line) { return line.id === id; });
      var qty = current ? current.qty : 0;
      if (inc) setQty(id, qty + 1);
      if (dec) setQty(id, qty - 1);
      if (remove) setQty(id, 0);
    }
    var quick = event.target.closest("[data-quick]");
    if (quick) openQuick(quick.getAttribute("data-quick"));
    var menu = event.target.closest("[data-menu]");
    if (menu) {
      var links = document.getElementById("site-nav");
      var open = links.hidden;
      links.hidden = !open;
      menu.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        var close = links.querySelector(".nav-close");
        if (close) close.focus();
      }
    }
    if (event.target.closest("[data-menu-close]")) {
      var panel = document.getElementById("site-nav");
      var opener = document.querySelector("[data-menu]");
      if (panel) panel.hidden = true;
      if (opener) {
        opener.setAttribute("aria-expanded", "false");
        opener.focus();
      }
    }
  });

  if (drawer) {
    drawer.addEventListener("click", function (event) {
      if (event.target === drawer) closeDrawer();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeDrawer();
      var dialog = document.getElementById("quick");
      if (dialog && dialog.open) dialog.close();
      var panel = document.getElementById("site-nav");
      var opener = document.querySelector("[data-menu]");
      if (panel && !panel.hidden && window.matchMedia("(max-width: 1359px)").matches) {
        panel.hidden = true;
        if (opener) opener.setAttribute("aria-expanded", "false");
      }
    }
  });

  var stopped = document.getElementById("preview-stop");
  if (stopped) {
    stopped.addEventListener("click", function () {
      var box = document.getElementById("preview-message");
      if (box) box.hidden = false;
    });
  }

  function openQuick(id) {
    var product = catalog[id];
    var dialog = document.getElementById("quick");
    if (!product || !dialog) {
      if (product) window.location.href = product.href;
      return;
    }
    dialog.querySelector("[data-q-img]").src = product.image;
    dialog.querySelector("[data-q-img]").alt = product.alt;
    dialog.querySelector("[data-q-name]").textContent = product.name;
    dialog.querySelector("[data-q-price]").textContent = money(product.price);
    dialog.querySelector("[data-q-heat]").textContent = product.heatLabel;
    dialog.querySelector("[data-q-blurb]").textContent = product.blurb;
    var sizeNode = dialog.querySelector("[data-q-size]");
    if (sizeNode) sizeNode.textContent = product.size ? product.size : "";
    var live = dialog.querySelector("[data-q-live]");
    if (live && product.live) live.href = product.live;
    dialog.querySelector("[data-q-link]").href = product.href;
    dialog.querySelector("[data-q-add]").setAttribute("data-add", product.id);
    var qtyInput = dialog.querySelector(".qty-input");
    if (qtyInput) qtyInput.value = "1";
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
      var title = dialog.querySelector("#quick-title");
      if (title) title.focus();
    }
    else window.location.href = product.href;
  }

  var shop = document.querySelector("[data-shop]");
  if (shop) {
    var kind = "all";
    var heat = "all";
    var params = new URLSearchParams(window.location.search);
    if (params.get("kind")) kind = params.get("kind");
    if (params.get("heat")) heat = params.get("heat");
    var cards = Array.prototype.slice.call(shop.querySelectorAll("[data-kind]"));
    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var kindOk = kind === "all" || card.getAttribute("data-kind") === kind;
        var cardHeat = card.getAttribute("data-heat");
        var heatOk = heat === "all" || cardHeat === heat;
        var show = kindOk && heatOk;
        card.hidden = !show;
        if (show) visible += 1;
      });
      var empty = document.getElementById("shop-empty");
      if (empty) empty.hidden = visible !== 0;
      document.querySelectorAll("[data-filter-kind]").forEach(function (btn) {
        btn.setAttribute("aria-pressed", btn.getAttribute("data-filter-kind") === kind ? "true" : "false");
      });
      document.querySelectorAll("[data-filter-heat]").forEach(function (btn) {
        btn.setAttribute("aria-pressed", btn.getAttribute("data-filter-heat") === heat ? "true" : "false");
      });
    }
    document.querySelectorAll("[data-filter-kind]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        kind = btn.getAttribute("data-filter-kind");
        apply();
      });
    });
    document.querySelectorAll("[data-filter-heat]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        heat = btn.getAttribute("data-filter-heat");
        apply();
      });
    });
    var sort = document.getElementById("sort");
    if (sort) {
      sort.addEventListener("change", function () {
        var mode = sort.value;
        var ranked = cards.slice().sort(function (a, b) {
          if (mode === "name") return a.getAttribute("data-name").localeCompare(b.getAttribute("data-name"));
          if (mode === "price-asc") return Number(a.getAttribute("data-price")) - Number(b.getAttribute("data-price"));
          if (mode === "price-desc") return Number(b.getAttribute("data-price")) - Number(a.getAttribute("data-price"));
          if (mode === "heat") return Number(a.getAttribute("data-heat") || 99) - Number(b.getAttribute("data-heat") || 99);
          return Number(a.getAttribute("data-order")) - Number(b.getAttribute("data-order"));
        });
        ranked.forEach(function (card) { shop.appendChild(card); });
      });
    }
    apply();
  }

  var narrow = window.matchMedia("(max-width: 719px)");
  function placeBar(bar, past, bodyClass) {
    var on = narrow.matches && past;
    bar.hidden = !on;
    document.body.classList.toggle(bodyClass, on);
    if (!on) return;
    var reserve = Math.ceil(bar.getBoundingClientRect().height + 20);
    document.documentElement.style.setProperty("--sticky-reserve", reserve + "px");
  }
  function bindRevealBar(bar, sentinel, bodyClass) {
    if (!bar || !sentinel) return;
    function sync() {
      placeBar(bar, sentinel.getBoundingClientRect().bottom <= 0, bodyClass);
    }
    if ("IntersectionObserver" in window) {
      var watch = new IntersectionObserver(sync, { threshold: [0, 1] });
      watch.observe(sentinel);
    }
    narrow.addEventListener("change", sync);
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("load", sync);
    bar.hidden = true;
    sync();
  }
  bindRevealBar(document.getElementById("shop-sticky"), document.getElementById("hero"), "show-shop-sticky");
  bindRevealBar(document.querySelector(".sticky-action"), document.getElementById("product-hero"), "show-sticky");

  function mountStepper(box) {
    if (!box || box.querySelector(".qty")) return;
    var add = box.querySelector("[data-add]");
    var name = "quantity";
    if (add) {
      var product = catalog[add.getAttribute("data-add")];
      if (product) name = product.name;
    }
    var el = document.createElement("div");
    el.className = "qty";
    el.innerHTML =
      '<button type="button" data-step="-1" aria-label="Decrease ' + name + '">−</button>' +
      '<input class="qty-input" type="number" inputmode="numeric" min="1" max="12" value="1" aria-label="Quantity for ' + name + '">' +
      '<button type="button" data-step="1" aria-label="Increase ' + name + '">+</button>';
    if (add) box.insertBefore(el, add);
    else box.appendChild(el);
  }
  document.querySelectorAll("#product-actions, #quick .stack-actions").forEach(mountStepper);

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
    var cards = document.querySelectorAll(".sauce-row");
    if (cards.length) {
      var reveal = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          reveal.unobserve(entry.target);
        });
      }, { threshold: 0.18 });
      cards.forEach(function (card) {
        card.classList.add("reveal");
        reveal.observe(card);
      });
    }
  }

  document.addEventListener("change", function (event) {
    var input = event.target.closest(".qty-input");
    if (!input) return;
    var next = clampQty(input.value, Number(input.min || 0), Number(input.max || 24));
    input.value = String(next);
    if (input.hasAttribute("data-qty-for")) setQty(input.getAttribute("data-qty-for"), next);
  });

  renderCart();
})();
