(function () {
  var state = { step: 1, type: "", when: "", date: "", deposit: "", name: "", email: "", phone: "", note: "" };
  var types = {
    christmas: "Christmas party catering",
    trays: "Sandwich trays",
    boards: "Charcuterie boards",
    events: "Wedding, corporate, festival, or private event",
    menu: "A question about the truck menu"
  };
  var whens = { day: "Day", night: "Night" };
  var deposits = {
    none: "No deposit in this sample",
    hold: "A deposit to hold a date — amount not set",
    later: "Balance later — terms not set"
  };

  function upcomingDates() {
    var dates = [];
    var cursor = new Date();
    cursor.setDate(cursor.getDate() + 1);
    cursor.setHours(12, 0, 0, 0);
    while (dates.length < 6) {
      dates.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  }

  function formatDate(date) {
    return date.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
  }

  var steps = Array.prototype.slice.call(document.querySelectorAll("[data-step]"));
  var progress = Array.prototype.slice.call(document.querySelectorAll("[data-goto]"));
  var error = document.getElementById("book-error");
  var datesBox = document.getElementById("date-choices");

  upcomingDates().forEach(function (date) {
    var key = date.toISOString().slice(0, 10);
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice";
    btn.setAttribute("data-date", key);
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", "false");
    btn.textContent = formatDate(date);
    datesBox.appendChild(btn);
  });

  function showError(message) {
    error.textContent = message || "";
  }

  function paint(attr, value) {
    document.querySelectorAll("[" + attr + "]").forEach(function (btn) {
      var on = btn.getAttribute(attr) === value;
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
  }

  function paintAll() {
    paint("data-type", state.type);
    paint("data-when", state.when);
    paint("data-date", state.date);
    paint("data-deposit", state.deposit);
  }

  function readContact() {
    state.name = document.getElementById("guest-name").value.trim();
    state.email = document.getElementById("guest-email").value.trim();
    state.phone = document.getElementById("guest-phone").value.trim();
    state.note = document.getElementById("guest-note").value.trim();
  }

  function emailOk(value) {
    if (!value) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validate(step) {
    if (step === 1 && !state.type) return "Choose what the sample is about.";
    if (step === 2 && !state.when) return "Choose day or night. This is a sample, not an opening.";
    if (step === 2 && !state.date) return "Choose a sample date. Nothing is held.";
    if (step === 3 && !state.deposit) return "Choose an illustrative deposit option. Nothing is charged.";
    if (step === 4) {
      readContact();
      if (!emailOk(state.email)) return "That email does not look complete. Clear it, or use the example.";
    }
    return "";
  }

  function fillSummary() {
    var dateBtn = document.querySelector('[data-date="' + state.date + '"]');
    var fields = {
      type: types[state.type] || "—",
      when: whens[state.when] || "—",
      date: dateBtn ? dateBtn.textContent : "—",
      deposit: deposits[state.deposit] || "—",
      name: state.name || "Left blank",
      email: state.email || "Left blank",
      phone: state.phone || "Left blank",
      note: state.note || "Left blank"
    };
    Object.keys(fields).forEach(function (key) {
      ["sum-", "done-"].forEach(function (prefix) {
        var node = document.getElementById(prefix + key);
        if (node) node.textContent = fields[key];
      });
    });
  }

  function go(step) {
    state.step = step;
    steps.forEach(function (panel) {
      panel.hidden = Number(panel.getAttribute("data-step")) !== step;
    });
    progress.forEach(function (btn) {
      var n = Number(btn.getAttribute("data-goto"));
      btn.setAttribute("aria-current", n === step ? "step" : "false");
      btn.classList.toggle("done", n < step);
    });
    showError("");
    var heading = document.querySelector('[data-step="' + step + '"] h2');
    if (heading) heading.focus();
  }

  document.body.addEventListener("click", function (event) {
    var typeBtn = event.target.closest("[data-type]");
    if (typeBtn) { state.type = typeBtn.getAttribute("data-type"); paintAll(); showError(""); }
    var whenBtn = event.target.closest("[data-when]");
    if (whenBtn) { state.when = whenBtn.getAttribute("data-when"); paintAll(); showError(""); }
    var dateBtn = event.target.closest("[data-date]");
    if (dateBtn) { state.date = dateBtn.getAttribute("data-date"); paintAll(); showError(""); }
    var depositBtn = event.target.closest("[data-deposit]");
    if (depositBtn) { state.deposit = depositBtn.getAttribute("data-deposit"); paintAll(); showError(""); }

    if (event.target.closest("[data-next]")) {
      var problem = validate(state.step);
      if (problem) { showError(problem); return; }
      if (state.step === 4) readContact();
      if (state.step + 1 === 5) fillSummary();
      go(state.step + 1);
    }
    if (event.target.closest("[data-back]")) go(Math.max(1, state.step - 1));
    var edit = event.target.closest("[data-edit]");
    if (edit) go(Number(edit.getAttribute("data-edit")));
    var goto = event.target.closest(".progress [data-goto]");
    if (goto) {
      var target = Number(goto.getAttribute("data-goto"));
      if (target < state.step && state.step < 6) go(target);
    }
    if (event.target.closest("[data-example]")) {
      document.getElementById("guest-name").value = "Alex Example";
      document.getElementById("guest-email").value = "alex@example.com";
      document.getElementById("guest-phone").value = "555-0100";
      document.getElementById("guest-note").value = "Example note only. Not a real request.";
      showError("");
    }
    if (event.target.closest("[data-clear-contact]")) {
      ["guest-name", "guest-email", "guest-phone", "guest-note"].forEach(function (id) {
        document.getElementById(id).value = "";
      });
      showError("");
    }
    if (event.target.closest("[data-finish]")) {
      readContact();
      var finishProblem = validate(4);
      if (finishProblem || !state.type || !state.when || !state.date || !state.deposit) {
        showError(finishProblem || "Go back and complete the sample choices.");
        return;
      }
      fillSummary();
      ["guest-name", "guest-email", "guest-phone", "guest-note"].forEach(function (id) {
        document.getElementById(id).value = "";
      });
      go(6);
    }
    if (event.target.closest("[data-restart]")) window.location.reload();
  });

  go(1);
})();
