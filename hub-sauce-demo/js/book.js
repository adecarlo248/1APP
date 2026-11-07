(function () {
  var state = { step: 1, type: "", date: "", time: "", name: "", email: "", phone: "", note: "" };
  var types = {
    sauce: {
      title: "A question about a sauce on the shop",
      detail: "Sample only. Canadian Cue, Da Kine, Twister Sister, Gold Metal Mustard, or Pixie Dust."
    },
    set: {
      title: "A question about the Starter Set",
      detail: "Sample only. The set lists Gold Metal Mustard, Twister Sister, Canadian Cue, Pixie Dust, and SPG+."
    },
    lineup: {
      title: "Another question about the lineup",
      detail: "Sample only. Not a tasting, catering visit, or pickup."
    }
  };
  var times = ["9:30", "11:00", "13:30", "15:30", "16:30"];

  function weekdayDates() {
    var dates = [];
    var cursor = new Date();
    cursor.setDate(cursor.getDate() + 1);
    cursor.setHours(12, 0, 0, 0);
    while (dates.length < 6) {
      var day = cursor.getDay();
      if (day !== 0 && day !== 6) dates.push(new Date(cursor));
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
  var timesBox = document.getElementById("time-choices");
  var dates = weekdayDates();

  dates.forEach(function (date) {
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

  times.forEach(function (time) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice";
    btn.setAttribute("data-time", time);
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", "false");
    btn.textContent = time;
    timesBox.appendChild(btn);
  });

  function showError(message) {
    error.textContent = message || "";
  }

  function paintChoices() {
    document.querySelectorAll("[data-type]").forEach(function (btn) {
      var on = btn.getAttribute("data-type") === state.type;
      btn.classList.toggle("selected", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
    document.querySelectorAll("[data-date]").forEach(function (btn) {
      var on = btn.getAttribute("data-date") === state.date;
      btn.classList.toggle("selected", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
    document.querySelectorAll("[data-time]").forEach(function (btn) {
      var on = btn.getAttribute("data-time") === state.time;
      btn.classList.toggle("selected", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
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
    if (step === 1 && !state.type) return "Choose a sample reason to continue.";
    if (step === 2 && !state.date) return "Choose an illustrative date to continue.";
    if (step === 3 && !state.time) return "Choose an illustrative time to continue.";
    if (step === 4) {
      readContact();
      if (!emailOk(state.email)) return "That email does not look complete. Clear it, or use the example.";
    }
    return "";
  }

  function fillSummary() {
    var type = types[state.type];
    var dateBtn = document.querySelector('[data-date="' + state.date + '"]');
    var fields = {
      type: type ? type.title : "—",
      date: dateBtn ? dateBtn.textContent : "—",
      time: state.time || "—",
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
    if (step === 5) fillSummary();
  }

  document.getElementById("book-form").addEventListener("submit", function (event) {
    event.preventDefault();
  });

  document.body.addEventListener("click", function (event) {
    var typeBtn = event.target.closest("[data-type]");
    if (typeBtn) {
      state.type = typeBtn.getAttribute("data-type");
      paintChoices();
      showError("");
    }
    var dateBtn = event.target.closest("[data-date]");
    if (dateBtn) {
      state.date = dateBtn.getAttribute("data-date");
      paintChoices();
      showError("");
    }
    var timeBtn = event.target.closest("[data-time]");
    if (timeBtn) {
      state.time = timeBtn.getAttribute("data-time");
      paintChoices();
      showError("");
    }
    var next = event.target.closest("[data-next]");
    if (next) {
      var problem = validate(state.step);
      if (problem) {
        showError(problem);
        return;
      }
      go(state.step + 1);
    }
    var back = event.target.closest("[data-back]");
    if (back) go(Math.max(1, state.step - 1));
    var edit = event.target.closest("[data-edit]");
    if (edit) go(Number(edit.getAttribute("data-edit")));
    var goto = event.target.closest("[data-goto]");
    if (goto && event.target.closest(".progress")) {
      var target = Number(goto.getAttribute("data-goto"));
      if (target < state.step) go(target);
    }
    if (event.target.closest("[data-example]")) {
      document.getElementById("guest-name").value = "Alex Example";
      document.getElementById("guest-email").value = "alex@example.com";
      document.getElementById("guest-phone").value = "555-0100";
      document.getElementById("guest-note").value = "Example question: which sauce is the maple one?";
      showError("");
    }
    if (event.target.closest("[data-clear-contact]")) {
      ["guest-name", "guest-email", "guest-phone", "guest-note"].forEach(function (id) {
        document.getElementById(id).value = "";
      });
      showError("");
    }
    if (event.target.closest("[data-finish]")) {
      var problem = validate(4);
      if (problem || !state.type || !state.date || !state.time) {
        showError(problem || "Go back and complete the sample choices.");
        return;
      }
      fillSummary();
      document.getElementById("done-copy").innerHTML =
        "<strong>Demo complete — no booking made.</strong> Nothing was emailed, saved, or written to a calendar.";
      ["guest-name", "guest-email", "guest-phone", "guest-note"].forEach(function (id) {
        document.getElementById(id).value = "";
      });
      go(6);
      document.getElementById("done-copy").focus();
    }
    if (event.target.closest("[data-restart]")) {
      window.location.reload();
    }
  });

  go(1);
})();
