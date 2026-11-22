(function () {
  var nav = document.getElementById("site-nav");
  var opener = document.querySelector("[data-menu]");
  if (!nav || !opener) return;

  function narrow() {
    return window.matchMedia("(max-width: 859px)").matches;
  }

  function setOpen(open, moveFocus) {
    nav.hidden = !open;
    opener.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("nav-open", open && narrow());
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
      setOpen(nav.hidden, true);
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
})();
