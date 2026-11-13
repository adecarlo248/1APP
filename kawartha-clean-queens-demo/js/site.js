(function () {
  var nav = document.getElementById("site-nav");
  var opener = document.querySelector("[data-menu]");
  var scrollY = 0;
  var scrollLocked = false;

  function narrow() {
    return window.matchMedia("(max-width: 959px)").matches;
  }

  function setBackgroundInert(on) {
    var kids = document.body.children;
    for (var i = 0; i < kids.length; i++) {
      var el = kids[i];
      if (el.classList.contains("site-header") || el.tagName === "SCRIPT") continue;
      el.inert = on;
    }
  }

  function setScrollLock(on) {
    if (on === scrollLocked) return;
    var root = document.documentElement;
    if (on) {
      scrollY = window.scrollY || root.scrollTop || 0;
      scrollLocked = true;
      root.classList.add("nav-open");
      document.body.classList.add("nav-open");
      document.body.style.top = "-" + scrollY + "px";
      setBackgroundInert(true);
      return;
    }
    scrollLocked = false;
    setBackgroundInert(false);
    root.classList.remove("nav-open");
    document.body.classList.remove("nav-open");
    document.body.style.top = "";
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, scrollY);
    root.style.scrollBehavior = "";
  }

  document.addEventListener("touchmove", function (event) {
    if (!scrollLocked || !nav || nav.contains(event.target)) return;
    event.preventDefault();
  }, { passive: false });

  if (nav && opener) {
    function setOpen(open, moveFocus) {
      nav.hidden = !open;
      opener.setAttribute("aria-expanded", open ? "true" : "false");
      setScrollLock(open && narrow());
      if (!moveFocus) return;
      if (open) {
        var closeBtn = nav.querySelector("[data-menu-close]");
        if (closeBtn) closeBtn.focus();
      } else {
        opener.focus();
      }
    }

    document.addEventListener("click", function (event) {
      if (event.target.closest("[data-menu]")) {
        var willOpen = nav.hidden;
        setOpen(willOpen, true);
      }
      if (event.target.closest("[data-menu-close]")) setOpen(false, true);
      if (event.target.closest("#site-nav a") && narrow()) setOpen(false, false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !nav.hidden && narrow()) setOpen(false, true);
      if (event.key !== "Tab" || nav.hidden || !narrow()) return;
      var focusable = nav.querySelectorAll("a, button");
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (!narrow() && !nav.hidden) setOpen(false, false);
    });
  }

  var sticky = document.querySelector(".sticky-cta");
  var heroBtn = document.querySelector("[data-sticky-watch]");
  if (sticky && heroBtn && "IntersectionObserver" in window) {
    var watcher = new IntersectionObserver(function (entries) {
      sticky.hidden = entries[0].isIntersecting;
    });
    watcher.observe(heroBtn);
  } else if (sticky && !heroBtn) {
    sticky.hidden = false;
  }

  var filters = document.querySelectorAll("[data-filter]");
  var shots = document.querySelectorAll(".shot");
  var filterStatus = document.getElementById("filter-status");
  if (filters.length && shots.length) {
    filters.forEach(function (button) {
      button.addEventListener("click", function () {
        var name = button.getAttribute("data-filter");
        filters.forEach(function (other) {
          other.setAttribute("aria-pressed", other === button ? "true" : "false");
        });
        var shown = 0;
        shots.forEach(function (shot) {
          var on = name === "all" || shot.getAttribute("data-cat") === name;
          shot.hidden = !on;
          if (on) shown += 1;
        });
        if (filterStatus) {
          filterStatus.textContent = "Showing " + shown + (shown === 1 ? " photograph." : " photographs.");
        }
      });
    });
  }

  var dialog = document.getElementById("lightbox");
  if (!dialog || !shots.length) return;

  var lbImg = document.getElementById("lb-img");
  var lbKicker = document.getElementById("lb-kicker");
  var lbCaption = document.getElementById("lb-caption");
  var lbCount = document.getElementById("lb-count");
  var current = 0;
  var openerBtn = null;

  function visible() {
    return Array.prototype.filter.call(shots, function (shot) { return !shot.hidden; });
  }

  function show(index) {
    var list = visible();
    if (!list.length) return;
    current = (index + list.length) % list.length;
    var shot = list[current];
    var img = shot.querySelector("img");
    lbImg.src = img.currentSrc || img.getAttribute("src");
    lbImg.alt = img.getAttribute("alt") || "";
    lbKicker.textContent = shot.getAttribute("data-kicker") || "";
    lbCaption.textContent = shot.getAttribute("data-caption") || "";
    lbCount.textContent = (current + 1) + " of " + list.length;
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest(".shot-open");
    if (!button || !button.closest(".shot")) return;
    var shot = button.closest(".shot");
    openerBtn = button;
    var list = visible();
    show(list.indexOf(shot));
    if (typeof dialog.showModal === "function") dialog.showModal();
  });

  dialog.addEventListener("click", function (event) {
    var rect = dialog.getBoundingClientRect();
    var inside = rect.top <= event.clientY && event.clientY <= rect.bottom && rect.left <= event.clientX && event.clientX <= rect.right;
    if (!inside) dialog.close();
    if (event.target.closest("[data-lb-close]")) dialog.close();
    if (event.target.closest("[data-lb-next]")) show(current + 1);
    if (event.target.closest("[data-lb-prev]")) show(current - 1);
  });

  dialog.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") { event.preventDefault(); show(current + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); show(current - 1); }
  });

  dialog.addEventListener("close", function () {
    if (openerBtn) openerBtn.focus();
  });
})();
