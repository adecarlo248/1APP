(function () {
  var nav = document.getElementById("site-nav");
  var opener = document.querySelector("[data-menu]");
  if (!nav || !opener) return;

  function narrow() {
    return window.matchMedia("(max-width: 959px)").matches;
  }

  function setOpen(open) {
    nav.hidden = !open;
    opener.setAttribute("aria-expanded", open ? "true" : "false");
  }

  document.addEventListener("click", function (event) {
    if (event.target.closest("[data-menu]")) {
      var open = nav.hidden;
      setOpen(open);
      if (open) {
        var closeBtn = nav.querySelector("[data-menu-close]");
        if (closeBtn) closeBtn.focus();
      }
    }
    if (event.target.closest("[data-menu-close]")) {
      setOpen(false);
      opener.focus();
    }
    if (event.target.closest("#site-nav a") && narrow()) setOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !nav.hidden && narrow()) {
      setOpen(false);
      opener.focus();
    }
  });

  var sticky = document.querySelector(".sticky-cta");
  var heroBtn = document.querySelector(".hero .stack .btn");
  if (sticky && heroBtn && "IntersectionObserver" in window) {
    var watcher = new IntersectionObserver(function (entries) {
      sticky.classList.toggle("is-hidden", entries[0].isIntersecting);
    });
    watcher.observe(heroBtn);
  }
})();
