(function () {
  var form = document.getElementById("apply-form");
  if (!form) return;

  var error = document.getElementById("apply-error");
  var done = document.getElementById("apply-done");
  var recap = document.getElementById("apply-recap");
  var panel = document.getElementById("apply-panel");

  var params = new URLSearchParams(window.location.search);
  var qrNote = document.getElementById("qr-note");
  if (qrNote && params.get("src") === "qr") qrNote.hidden = false;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var msg = validate();
    error.textContent = msg || "";
    if (msg) {
      error.focus();
      return;
    }
    fillRecap();
    form.reset();
    panel.hidden = true;
    done.hidden = false;
    var title = document.getElementById("apply-done-title");
    if (title) {
      title.setAttribute("tabindex", "-1");
      title.focus();
    }
    window.scrollTo(0, 0);
  });

  var restart = document.getElementById("apply-restart");
  if (restart) {
    restart.addEventListener("click", function () {
      done.hidden = true;
      panel.hidden = false;
      error.textContent = "";
      var heading = document.getElementById("apply-heading");
      if (heading) heading.focus();
    });
  }

  function text(name) {
    var el = form.elements[name];
    return el ? String(el.value || "").trim() : "";
  }

  function validate() {
    if (text("aname").length < 2) return "Add your name.";
    var digits = text("aphone").replace(/\D/g, "");
    if (digits.length < 10) return "Add a phone number, with the area code.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text("aemail"))) return "Add an email address.";
    var days = form.querySelectorAll('input[name="days"]:checked');
    if (!days.length && text("daynote").length < 2) return "Add your availability: pick the times that work, or write a short note.";
    if (!text("load")) return "Choose full-time, part-time, or either.";
    if (text("experience").length < 2) return "Add a line about your cleaning experience. “New to professional cleaning” is enough.";
    return "";
  }

  function fillRecap() {
    recap.replaceChildren();
    function add(term, value) {
      if (!value) return;
      var dt = document.createElement("dt");
      dt.textContent = term;
      var dd = document.createElement("dd");
      dd.textContent = value;
      recap.appendChild(dt);
      recap.appendChild(dd);
    }
    var days = [];
    form.querySelectorAll('input[name="days"]:checked').forEach(function (box) {
      days.push(box.value);
    });
    var loads = { part: "Part-time", full: "Full-time", either: "Either" };
    add("Name", text("aname"));
    add("Phone", text("aphone"));
    add("Email", text("aemail"));
    add("Availability", days.join(", "));
    add("Availability note", text("daynote"));
    add("Looking for", loads[text("load")] || text("load"));
    add("Cleaning experience", text("experience"));
    add("Note", text("anote"));
  }
})();
