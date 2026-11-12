(function () {
  var form = document.getElementById("wizard");
  if (!form) return;

  var SETUP = 15;
  var FEATURED = 75;
  var PER = 45;
  var PARTY_MAX = 12;
  var MOTHER_MAX = 4;

  var SERVICES = {
    bridal: {
      label: "Bridal",
      line: "Bridal makeup",
      extra: "Bridal party",
      door: "weddings",
      featured: "Bride",
      extras: "Bridal party",
      help: "Everyone besides the bride who wants makeup.",
      mothers: true
    },
    preview: {
      label: "Bridal preview / trial",
      line: "Bridal preview / trial",
      extra: "People joining the preview",
      door: "weddings",
      featured: "Preview client",
      extras: "People joining the preview",
      help: "Optional. Anyone else in the chair that day.",
      mothers: true
    },
    prom: {
      label: "Prom",
      line: "Prom makeup",
      extra: "Friends",
      door: "events",
      featured: "You",
      extras: "Friends getting ready too",
      help: "Anyone else who wants makeup.",
      mothers: false
    },
    shoot: {
      label: "Photo shoot",
      line: "Photo shoot makeup",
      extra: "Others on the shoot",
      door: "events",
      featured: "You",
      extras: "Others on the shoot",
      help: "Anyone else who wants makeup.",
      mothers: false
    },
    event: {
      label: "Special event",
      line: "Special event makeup",
      extra: "Others",
      door: "events",
      featured: "Guest of honour",
      extras: "Others",
      help: "Anyone else who wants makeup.",
      mothers: true
    }
  };

  var TOWNS = {
    peterborough: "Peterborough",
    kawarthas: "The Kawarthas",
    lindsay: "Lindsay",
    littlebritain: "Little Britain",
    other: "Somewhere else"
  };

  var WINDOWS = {
    soon: "In the next few months",
    later: "Later this year",
    next: "Next year",
    unsure: "Not sure yet"
  };

  var STEP_NAMES = ["Service", "Date", "Party", "Place", "Ready by", "Brief", "Estimate"];

  var ASIDES = [
    "Weddings, or events and prom. This preview asks for makeup only.",
    "An inquiry is not a hold. The calendar on this page is a demonstration.",
    "Party mix changes the sample timeline. Prices stay blank.",
    "Peterborough, the Kawarthas, Lindsay, and Little Britain are the places her posts name.",
    "Ready-by is when makeup should be finished. The start time works backward from it.",
    "What you type stays in this browser until the preview clears it.",
    "Every dollar is a placeholder. The deposit step does not charge a card."
  ];

  function blank() {
    return {
      step: 1,
      stage: "estimate",
      finished: false,
      service: "",
      dateMode: "",
      date: "",
      window: "",
      dateChecked: false,
      dateResult: null,
      checking: false,
      party: 0,
      mothers: 0,
      town: "",
      townOther: "",
      address: "",
      place: "",
      timeMode: "",
      readyBy: "",
      name: "",
      email: "",
      phone: "",
      notes: "",
      styles: [],
      heard: "",
      consent: false
    };
  }

  var state = blank();
  var summary = [];
  var error = document.getElementById("book-error");
  var bar = document.getElementById("book-bar");
  var nextBtn = document.getElementById("next-btn");
  var backBtn = document.getElementById("back-btn");
  var title = document.getElementById("book-title");
  var intro = document.getElementById("book-intro");
  var progressLabel = document.getElementById("progress-label");
  var progressFill = document.getElementById("progress-fill");
  var progressWrap = document.getElementById("progress-wrap");
  var asideNote = document.getElementById("aside-note");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    onContinue();
  });

  function serviceMeta() {
    return SERVICES[state.service] || SERVICES.bridal;
  }

  function mothersOn() {
    return !!(state.service && SERVICES[state.service].mothers);
  }

  function extrasCount() {
    return state.party + (mothersOn() ? state.mothers : 0);
  }

  function totalMinutes() {
    return SETUP + FEATURED + PER * extrasCount();
  }

  function read() {
    var date = document.getElementById("event-date");
    var windowSel = document.getElementById("date-window");
    var town = document.getElementById("town");
    var townOther = document.getElementById("town-other");
    var address = document.getElementById("address");
    var place = document.getElementById("place");
    var ready = document.getElementById("ready-by");
    state.date = date.value;
    state.window = windowSel.value;
    state.town = town.value;
    state.townOther = townOther.value;
    state.address = address.value;
    state.place = place.value;
    state.readyBy = ready.value;
    state.name = document.getElementById("given-name").value;
    state.email = document.getElementById("email").value;
    state.phone = document.getElementById("phone").value;
    state.notes = document.getElementById("notes").value;
    state.heard = document.getElementById("heard").value;
    state.consent = document.getElementById("consent").checked;
    state.styles = [];
    document.querySelectorAll("[data-style]").forEach(function (chip) {
      if (chip.getAttribute("aria-pressed") === "true") state.styles.push(chip.getAttribute("data-style"));
    });
  }

  function digits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  }

  function formatDate(iso) {
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }

  function formatClock(total) {
    var day = "";
    var m = total;
    if (m < 0) {
      day = " the day before";
      m = ((m % 1440) + 1440) % 1440;
    } else if (m >= 1440) {
      day = " the next day";
      m = m % 1440;
    }
    var h = Math.floor(m / 60);
    var min = m % 60;
    var ap = h >= 12 ? "p.m." : "a.m.";
    var h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return h12 + ":" + String(min).padStart(2, "0") + " " + ap + day;
  }

  function clockToMinutes(value) {
    var parts = String(value || "").split(":");
    if (parts.length < 2) return null;
    var h = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  }

  function townLabel() {
    if (state.town === "other") return state.townOther.trim() || "Somewhere else";
    return TOWNS[state.town] || "";
  }

  function whenLabel() {
    if (state.dateMode === "known" && state.date) return formatDate(state.date);
    if (state.dateMode === "open") return WINDOWS[state.window] || "Date not set";
    return "";
  }

  function judge(iso) {
    var picked = new Date(iso + "T00:00:00");
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(picked.getTime())) {
      return { ok: false, title: "That date could not be read.", body: "Choose another day." };
    }
    if (picked < today) {
      return {
        ok: false,
        title: "That date has already passed.",
        body: "Choose another day, or say the date is not set yet."
      };
    }
    var same = picked.getTime() === today.getTime();
    return {
      ok: true,
      title: "Shown as open in this preview.",
      body: same
        ? "It is today. Whether a same-day booking is possible is to be confirmed with Desiree. This is not her calendar, and it does not hold the date."
        : "This is not Desiree’s calendar. She confirms the date herself. Checking it here does not hold the date."
    };
  }

  function showError(message) {
    error.textContent = message || "";
  }

  function clearInvalid() {
    form.querySelectorAll("[aria-invalid='true']").forEach(function (el) {
      el.removeAttribute("aria-invalid");
    });
  }

  function mark(id) {
    var el = document.getElementById(id);
    if (el) {
      el.setAttribute("aria-invalid", "true");
      el.focus();
    }
  }

  function validate() {
    clearInvalid();
    if (state.step === 1 && !state.service) {
      var first = document.querySelector("[data-service]");
      if (first) first.focus();
      return "Choose a service to continue.";
    }
    if (state.step === 2) {
      if (!state.dateMode) {
        var mode = document.querySelector("[data-date-mode]");
        if (mode) mode.focus();
        return "Say whether you have a date.";
      }
      if (state.dateMode === "known") {
        if (!state.date) {
          mark("event-date");
          return "Add the date, or choose “not set yet.”";
        }
        if (state.dateChecked && state.dateResult && !state.dateResult.ok) {
          mark("event-date");
          return "That date has already passed. Choose another day.";
        }
      }
      if (state.dateMode === "open" && !state.window) {
        mark("date-window");
        return "Choose a rough window.";
      }
    }
    if (state.step === 4) {
      if (!state.town) {
        mark("town");
        return "Choose a town.";
      }
      if (state.town === "other" && state.townOther.trim().length < 2) {
        mark("town-other");
        return "Add the town.";
      }
    }
    if (state.step === 5) {
      if (!state.timeMode) {
        var timeMode = document.querySelector("[data-time-mode]");
        if (timeMode) timeMode.focus();
        return "Say whether you know the ready-by time.";
      }
      if (state.timeMode === "known" && !state.readyBy) {
        mark("ready-by");
        return "Add the ready-by time, or choose not sure yet.";
      }
    }
    if (state.step === 6) {
      if (state.name.trim().length < 2) {
        mark("given-name");
        return "Add a first name. It stays on this page only.";
      }
      if (!validEmail(state.email.trim())) {
        mark("email");
        return "Add an email address. It is not sent.";
      }
      var phoneDigits = digits(state.phone);
      if (state.phone.trim() && (phoneDigits.length < 10 || phoneDigits.length > 15)) {
        mark("phone");
        return "Check the phone number, or leave it blank.";
      }
      if (!state.consent) {
        mark("consent");
        return "Confirm that you understand this is a preview.";
      }
    }
    return "";
  }

  function setChecked(selector, attr, value) {
    var buttons = document.querySelectorAll(selector);
    var found = false;
    buttons.forEach(function (button) {
      var on = value !== "" && button.getAttribute(attr) === value;
      button.setAttribute("aria-checked", on ? "true" : "false");
      if (on) found = true;
    });
    buttons.forEach(function (button, index) {
      var on = button.getAttribute("aria-checked") === "true";
      button.tabIndex = on || (!found && index === 0) ? 0 : -1;
    });
  }

  function paintChoices() {
    setChecked("[data-service]", "data-service", state.service);
    setChecked("[data-date-mode]", "data-date-mode", state.dateMode);
    setChecked("[data-time-mode]", "data-time-mode", state.timeMode);
    document.querySelectorAll("[data-style]").forEach(function (chip) {
      var on = state.styles.indexOf(chip.getAttribute("data-style")) !== -1;
      chip.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function paintPeople() {
    var meta = serviceMeta();
    document.getElementById("featured-label").textContent = state.service ? meta.featured : "Featured person";
    document.getElementById("extras-label").textContent = state.service ? meta.extras : "Additional people";
    document.getElementById("extras-help").textContent = state.service ? meta.help : "Anyone else who wants makeup.";
    document.getElementById("mothers-row").hidden = !mothersOn();
    document.getElementById("party-value").textContent = String(state.party);
    document.getElementById("mothers-value").textContent = String(state.mothers);
    document.querySelector("[data-stepper='party'][data-dir='-1']").disabled = state.party <= 0;
    document.querySelector("[data-stepper='party'][data-dir='1']").disabled = state.party >= PARTY_MAX;
    document.querySelector("[data-stepper='mothers'][data-dir='-1']").disabled = state.mothers <= 0;
    document.querySelector("[data-stepper='mothers'][data-dir='1']").disabled = state.mothers >= MOTHER_MAX;
    var total = 1 + extrasCount();
    var noun = total === 1 ? "person" : "people";
    document.getElementById("headcount").textContent = "Makeup for " + total + " " + noun + " in this preview.";
    var cap = document.getElementById("party-cap");
    cap.hidden = state.party < PARTY_MAX;
  }

  function paintDate() {
    document.getElementById("date-known").hidden = state.dateMode !== "known";
    document.getElementById("date-open").hidden = state.dateMode !== "open";
    document.getElementById("town-other-wrap").hidden = state.town !== "other";
    document.getElementById("time-known").hidden = state.timeMode !== "known";
    var box = document.getElementById("date-result");
    box.className = "result";
    box.replaceChildren();
    box.hidden = true;
    if (state.dateMode === "open") {
      box.hidden = false;
      addText(box, "p", "result-title", "No date to check yet.");
      addText(box, "p", "note", "Desiree can talk through timing once a day is chosen. This preview does not hold a date.");
      tag(box);
      return;
    }
    if (state.checking) {
      box.hidden = false;
      addText(box, "p", "result-title", "Checking this preview…");
      tag(box);
      return;
    }
    if (state.dateResult) {
      box.hidden = false;
      if (!state.dateResult.ok) box.classList.add("is-bad");
      addText(box, "p", "result-title", state.dateResult.title);
      addText(box, "p", "note", state.dateResult.body);
      tag(box);
    }
  }

  function addText(parent, tagName, className, text) {
    var node = document.createElement(tagName);
    if (className) node.className = className;
    node.textContent = text;
    parent.appendChild(node);
    return node;
  }

  function tag(parent) {
    var span = document.createElement("span");
    span.className = "ph";
    span.textContent = "Demo calendar";
    span.style.marginTop = "8px";
    parent.appendChild(span);
  }

  function paintTiming() {
    var box = document.getElementById("timing-result");
    box.replaceChildren();
    if (state.timeMode !== "known" || !state.readyBy) {
      if (state.timeMode === "unsure") {
        addText(box, "p", "note", "Start time — to be planned once a ready-by time is known.");
      }
      return;
    }
    var ready = clockToMinutes(state.readyBy);
    if (ready === null) return;
    var total = totalMinutes();
    var start = ready - total;
    var startLabel = formatClock(start);
    addText(box, "p", "shot-kicker", "Suggested start · placeholder");
    addText(box, "p", "timing-time", startLabel);
    addText(box, "p", "note", "Ready by " + formatClock(ready) + " Sample math: " + SETUP + " min to set up + " + FEATURED + " min for the featured look + " + PER + " min × " + extrasCount() + " = " + total + " min. Not Desiree’s timing.");
    var startOfDay = ((start % 1440) + 1440) % 1440;
    if (start < 0) {
      addText(box, "p", "note", "Those sample minutes do not fit before that ready-by time. Desiree would rework the plan.");
    } else if (startOfDay < 8 * 60) {
      var early = document.createElement("p");
      early.className = "note";
      early.appendChild(document.createTextNode("The sample start is before 8:00 a.m. Any early-morning fee — to be confirmed with Desiree. "));
      var ph = document.createElement("span");
      ph.className = "ph";
      ph.textContent = "Placeholder";
      early.appendChild(ph);
      box.appendChild(early);
    }
  }

  function line(name, amount) {
    var li = document.createElement("li");
    var left = document.createElement("span");
    left.textContent = name;
    var right = document.createElement("span");
    right.textContent = amount;
    li.appendChild(left);
    li.appendChild(right);
    return li;
  }

  function paintEstimate() {
    var list = document.getElementById("estimate-lines");
    var recap = document.getElementById("recap");
    list.replaceChildren();
    recap.replaceChildren();
    if (!state.service) return;
    var meta = SERVICES[state.service];
    list.appendChild(line(meta.line, "$___"));
    if (state.party > 0) list.appendChild(line(meta.extra + " × " + state.party, "$___"));
    if (mothersOn() && state.mothers > 0) list.appendChild(line("Mother of the bride × " + state.mothers, "$___"));
    list.appendChild(line("Travel · " + (townLabel() || "Town to be confirmed"), "$___"));
    list.appendChild(line("Tax", "$___"));

    function row(kicker, value) {
      var wrap = document.createElement("div");
      var k = document.createElement("p");
      k.className = "shot-kicker";
      k.textContent = kicker;
      var v = document.createElement("p");
      v.textContent = value;
      wrap.appendChild(k);
      wrap.appendChild(v);
      recap.appendChild(wrap);
    }

    row("Service", meta.label);
    row("When", whenLabel());
    if (state.dateMode === "known" && state.dateResult) row("Preview calendar", state.dateResult.title);
    row("People", "1 featured + " + extrasCount() + " more");
    row("Getting ready", [townLabel(), state.place.trim(), state.address.trim()].filter(Boolean).join(" · ") || "—");
    if (state.timeMode === "known" && state.readyBy) {
      var ready = clockToMinutes(state.readyBy);
      var start = ready === null ? "" : formatClock(ready - totalMinutes());
      row("Ready by", formatClock(ready) + (start ? " · sample start " + start : ""));
    } else {
      row("Ready by", "Not sure yet");
    }
    row("Name", state.name.trim());
    row("Email", state.email.trim());
    if (state.phone.trim()) row("Phone", state.phone.trim());
    if (state.styles.length) row("Words from her posts", state.styles.join(", "));
    if (state.notes.trim()) row("Notes", state.notes.trim());
    if (state.heard) row("Found her", state.heard);

    document.getElementById("deposit").hidden = state.stage !== "deposit";
  }

  function paintNav() {
    var done = state.finished;
    progressWrap.hidden = done;
    bar.hidden = done;
    title.classList.toggle("is-done", done);
    title.textContent = done ? "Demo only — no booking or payment was made." : "Check your date";
    intro.hidden = done;
    document.querySelectorAll(".step").forEach(function (step) {
      step.hidden = done || Number(step.getAttribute("data-step")) !== state.step;
    });
    document.getElementById("confirm").hidden = !done;
    if (!done) {
      var label = "Step " + state.step + " of 7 · " + (state.step === 7 && state.stage === "deposit" ? "Demo deposit" : STEP_NAMES[state.step - 1]);
      if (progressLabel.textContent !== label) progressLabel.textContent = label;
      progressFill.style.width = ((state.step / 7) * 100) + "%";
      document.querySelectorAll("[data-goto]").forEach(function (button) {
        var n = Number(button.getAttribute("data-goto"));
        button.disabled = n > state.step;
        if (n === state.step) button.setAttribute("aria-current", "step");
        else button.removeAttribute("aria-current");
      });
      backBtn.hidden = state.step === 1 && state.stage !== "deposit";
      backBtn.textContent = state.step === 7 && state.stage === "deposit" ? "Back to the estimate" : "Back";
      var next = "Continue";
      if (state.step === 2 && state.dateMode === "known" && !state.dateChecked) next = state.checking ? "Checking…" : "Check this date";
      if (state.step === 6) next = "Review the preview";
      if (state.step === 7 && state.stage === "estimate") next = "Continue to the demo deposit";
      if (state.step === 7 && state.stage === "deposit") next = "Finish the demo";
      nextBtn.textContent = next;
      nextBtn.disabled = state.checking;
    }
    if (asideNote) {
      asideNote.textContent = done
        ? "Nothing was sent. The portrait is a client’s makeup, not a photograph of Desiree."
        : (ASIDES[Math.min(state.step, 7) - 1] || ASIDES[0]);
    }
  }

  function paintSummary() {
    var list = document.getElementById("confirm-list");
    list.replaceChildren();
    summary.forEach(function (item) {
      var li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
  }

  function paint() {
    paintChoices();
    paintPeople();
    paintDate();
    paintTiming();
    paintEstimate();
    paintNav();
    paintSummary();
  }

  function focusHeading(heading) {
    if (!heading) return;
    if (heading.focus) heading.focus({ preventScroll: true });
    var target = heading.id === "book-title" ? heading.closest(".book-intro") : heading;
    (target || heading).scrollIntoView({ block: "start", inline: "nearest" });
  }

  function focusStep() {
    focusHeading(document.querySelector(".step:not([hidden]) h2"));
  }

  function startCheck() {
    state.checking = true;
    state.dateChecked = false;
    state.dateResult = null;
    paint();
    var date = state.date;
    window.setTimeout(function () {
      if (state.step !== 2 || state.date !== date || state.dateMode !== "known") return;
      state.checking = false;
      state.dateChecked = true;
      state.dateResult = judge(date);
      showError("");
      paint();
    }, reduce ? 0 : 650);
  }

  function onContinue() {
    if (state.finished) return;
    read();
    if (state.step === 2 && state.dateMode === "known" && state.date && !state.dateChecked && !state.checking) {
      showError("");
      startCheck();
      return;
    }
    var message = validate();
    if (message) {
      showError(message);
      return;
    }
    showError("");
    if (state.step === 7 && state.stage === "estimate") {
      state.stage = "deposit";
      paint();
      focusHeading(document.getElementById("deposit-title"));
      return;
    }
    if (state.step === 7 && state.stage === "deposit") {
      finish();
      return;
    }
    if (state.step < 7) {
      state.step += 1;
      paint();
      focusStep();
    }
  }

  function onBack() {
    read();
    showError("");
    clearInvalid();
    if (state.step === 7 && state.stage === "deposit") {
      state.stage = "estimate";
      paint();
      document.getElementById("step-7-title").focus();
      return;
    }
    if (state.step > 1) {
      state.step -= 1;
      paint();
      focusStep();
    }
  }

  function finish() {
    var meta = SERVICES[state.service];
    summary = [
      meta.label,
      whenLabel(),
      "Makeup for " + (1 + extrasCount()) + " " + (1 + extrasCount() === 1 ? "person" : "people"),
      "Getting ready: " + townLabel()
    ];
    if (state.timeMode === "known" && state.readyBy) summary.push("Ready by " + formatClock(clockToMinutes(state.readyBy)));
    form.reset();
    state = blank();
    state.finished = true;
    state.step = 8;
    paint();
    focusHeading(title);
  }

  function restart() {
    form.reset();
    summary = [];
    state = blank();
    applyQuery();
    showError("");
    paint();
    focusStep();
  }

  function selectRadio(button) {
    if (button.hasAttribute("data-service")) {
      var next = button.getAttribute("data-service");
      if (state.service !== next && SERVICES[next] && !SERVICES[next].mothers) state.mothers = 0;
      state.service = next;
    }
    if (button.hasAttribute("data-date-mode")) {
      state.dateMode = button.getAttribute("data-date-mode");
      state.dateChecked = false;
      state.dateResult = null;
      state.checking = false;
    }
    if (button.hasAttribute("data-time-mode")) {
      state.timeMode = button.getAttribute("data-time-mode");
    }
    paint();
  }

  document.addEventListener("click", function (event) {
    var radio = event.target.closest("[role='radio']");
    if (radio && form.contains(radio)) selectRadio(radio);

    var stepper = event.target.closest("[data-stepper]");
    if (stepper) {
      var key = stepper.getAttribute("data-stepper");
      var dir = Number(stepper.getAttribute("data-dir"));
      var max = key === "party" ? PARTY_MAX : MOTHER_MAX;
      state[key] = Math.max(0, Math.min(max, state[key] + dir));
      paint();
    }

    var chip = event.target.closest("[data-style]");
    if (chip) {
      var name = chip.getAttribute("data-style");
      var index = state.styles.indexOf(name);
      if (index === -1) state.styles.push(name);
      else state.styles.splice(index, 1);
      paint();
    }

    var goto = event.target.closest("[data-goto]");
    if (goto && !goto.disabled) {
      var n = Number(goto.getAttribute("data-goto"));
      if (n < state.step) {
        read();
        state.step = n;
        state.stage = "estimate";
        showError("");
        paint();
        focusStep();
      }
    }

    if (event.target.closest("#back-btn")) onBack();
    if (event.target.closest("#restart")) restart();
  });

  document.addEventListener("keydown", function (event) {
    var group = event.target.closest("[role='radiogroup']");
    if (!group || !form.contains(group)) return;
    var keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
    if (keys.indexOf(event.key) === -1) return;
    var radios = Array.prototype.slice.call(group.querySelectorAll("[role='radio']"));
    if (!radios.length) return;
    event.preventDefault();
    var index = radios.indexOf(document.activeElement);
    if (index < 0) index = 0;
    var dir = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    var next = radios[(index + dir + radios.length) % radios.length];
    next.focus();
    selectRadio(next);
  });

  document.getElementById("event-date").addEventListener("input", function () {
    state.date = this.value;
    state.dateChecked = false;
    state.dateResult = null;
    state.checking = false;
    paint();
  });

  ["date-window", "town", "town-other", "address", "place", "given-name", "email", "phone", "notes", "heard"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
      read();
      paint();
    });
  });

  document.getElementById("ready-by").addEventListener("input", function () {
    state.readyBy = this.value;
    paintTiming();
  });

  document.getElementById("consent").addEventListener("change", function () {
    state.consent = this.checked;
  });

  function applyQuery() {
    var params = new URLSearchParams(window.location.search);
    var service = params.get("service");
    var door = params.get("door");
    if (service && SERVICES[service]) state.service = service;
    var party = parseInt(params.get("party") || "", 10);
    var mothers = parseInt(params.get("mothers") || "", 10);
    if (!isNaN(party) && party >= 0 && party <= PARTY_MAX) state.party = party;
    if (!isNaN(mothers) && mothers >= 0 && mothers <= MOTHER_MAX && (!state.service || SERVICES[state.service].mothers)) {
      state.mothers = mothers;
    }
    var note = document.getElementById("door-note");
    if (door === "weddings" || (service && SERVICES[service] && SERVICES[service].door === "weddings" && !door)) {
      note.hidden = false;
      note.textContent = "Weddings — bridal, a preview, the party, and mother of the bride. Any service below can still be chosen.";
    } else if (door === "events" || (service && SERVICES[service] && SERVICES[service].door === "events")) {
      note.hidden = false;
      note.textContent = "Events and prom. Any service below can still be chosen.";
    }
    var order = door === "events" || (service && SERVICES[service] && SERVICES[service].door === "events")
      ? ["prom", "shoot", "event", "bridal", "preview"]
      : ["bridal", "preview", "prom", "shoot", "event"];
    order.forEach(function (name, index) {
      var button = document.querySelector("[data-service='" + name + "']");
      if (button) button.style.order = String(index);
    });
  }

  var today = new Date();
  var max = new Date(today.getFullYear() + 3, today.getMonth(), today.getDate());
  document.getElementById("event-date").max = max.getFullYear() + "-" + String(max.getMonth() + 1).padStart(2, "0") + "-" + String(max.getDate()).padStart(2, "0");

  applyQuery();
  paint();
})();
