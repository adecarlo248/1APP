(function () {
  var form = document.getElementById("wizard");
  if (!form) return;

  var STEP_NAMES = ["Service", "Property", "Frequency", "Add-ons", "Timing", "Place", "Notes", "Contact", "Review"];
  var step = 1;

  var SERVICES = {
    residential: "Residential cleaning",
    deep: "Deep cleaning",
    move: "Move in / move out",
    commercial: "Office and commercial",
    airbnb: "Airbnb / post-rental turnover",
    reno: "Post-renovation / construction",
    windows: "Window cleaning",
    custom: "Customized plan",
    gift: "Gift certificate"
  };

  var PROPERTIES = {
    house: "House",
    condo: "Condo or apartment",
    cottage: "Cottage",
    office: "Office or commercial space",
    rental: "Rental or Airbnb",
    other: "Other"
  };

  var FREQUENCIES = {
    once: "One-time",
    weekly: "Weekly",
    biweekly: "Every two weeks",
    monthly: "Monthly"
  };

  var ADDONS = {
    oven: "Inside the oven",
    fridge: "Inside the fridge",
    windows: "Interior windows",
    cabinets: "Inside cabinets",
    laundry: "Laundry",
    baseboards: "Baseboards by hand",
    appliances: "Appliance exteriors"
  };

  var DAYPARTS = {
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    either: "No preference"
  };

  var TOWNS = {
    bobcaygeon: "Bobcaygeon",
    lindsay: "Lindsay",
    lakefield: "Lakefield",
    buckhorn: "Buckhorn",
    omemee: "Omemee",
    kawartha: "Kawartha Lakes",
    surrounding: "A surrounding area",
    other: "A town not on this list"
  };

  var ENTRIES = {
    home: "I will be home",
    arrange: "Please arrange entry with me",
    other: "Other — see the note"
  };

  var error = document.getElementById("book-error");
  var progressLabel = document.getElementById("progress-label");
  var progressFill = document.getElementById("progress-fill");
  var progressWrap = document.getElementById("progress-wrap");
  var backBtn = document.getElementById("back-btn");
  var nextBtn = document.getElementById("next-btn");
  var recap = document.getElementById("recap");
  var doneRecap = document.getElementById("done-recap");
  var wizardUi = document.getElementById("wizard-ui");
  var done = document.getElementById("done");
  var photoInput = document.getElementById("photos");
  var photoPreview = document.getElementById("photo-preview");
  var photoNote = document.getElementById("photo-note");
  var urls = [];

  var params = new URLSearchParams(window.location.search);
  var qrNote = document.getElementById("qr-note");
  if (qrNote && params.get("src") === "qr") qrNote.hidden = false;

  var preset = params.get("service");
  if (preset && SERVICES[preset]) {
    var presetInput = form.querySelector('input[name="service"][value="' + preset + '"]');
    if (presetInput) presetInput.checked = true;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    onNext();
  });

  backBtn.addEventListener("click", function () {
    onBack();
  });

  var restart = document.getElementById("restart");
  if (restart) {
    restart.addEventListener("click", function () {
      form.reset();
      clearPhotos();
      if (otherWrap) otherWrap.hidden = true;
      done.hidden = true;
      wizardUi.hidden = false;
      document.body.classList.remove("is-done");
      go(1, true);
    });
  }

  if (photoInput) {
    photoInput.addEventListener("change", function () {
      renderPhotos();
    });
  }

  var otherAddon = form.querySelector('input[name="addons"][value="other"]');
  var otherWrap = document.getElementById("addon-other-wrap");
  if (otherAddon && otherWrap) {
    otherAddon.addEventListener("change", function () {
      otherWrap.hidden = !otherAddon.checked;
    });
  }

  function checked(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }

  function text(name) {
    var el = form.elements[name];
    if (!el || el.length && !el.tagName) return "";
    return String(el.value || "").trim();
  }

  function gift() {
    return checked("service") === "gift";
  }

  function todayStamp() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function dateBad(value) {
    if (!value) return false;
    return value < todayStamp();
  }

  function secretish(value) {
    return /code|pin\b|alarm|lock\s?box|gate code|password/i.test(value);
  }

  function validate(n) {
    if (n === 1 && !checked("service")) return "Choose a service to continue.";
    if (gift()) {
      if (n === 8) return contactError();
      return "";
    }
    if (n === 2) {
      if (!checked("property")) return "Choose a property type.";
      if (!text("beds")) return "Choose the number of bedrooms, or Not applicable.";
      if (!text("baths")) return "Choose the number of bathrooms, or Not applicable.";
      if (!text("sqft")) return "Choose an approximate size, or Not sure.";
    }
    if (n === 3 && !checked("frequency")) return "Choose how often you would like the clean.";
    if (n === 5) {
      var flex = form.elements.dateflex && form.elements.dateflex.checked;
      var date1 = text("date1");
      var date2 = text("date2");
      if (!date1 && !flex) return "Add a preferred date, or mark the date as flexible.";
      if (dateBad(date1) || dateBad(date2)) return "Choose today or a later date.";
      if (!checked("daypart")) return "Choose a time of day, or No preference.";
    }
    if (n === 6) {
      if (!text("town")) return "Choose a town.";
      if (text("town") === "other" && text("townother").length < 2) return "Type the town so she can confirm it.";
      if (text("address").length < 5) return "Add the street address for the clean.";
    }
    if (n === 7) {
      if (!checked("pets")) return "Let her know whether there are pets.";
      if (!checked("entry")) return "Choose how the team should get in.";
      var notes = text("entrynote") + " " + text("petnote");
      if (secretish(notes)) return "Please take alarm codes, lockbox codes, and passwords out of the note. This preview does not send them, and they do not belong on this form.";
    }
    if (n === 8) return contactError();
    return "";
  }

  function contactError() {
    if (text("cname").length < 2) return "Add your name.";
    var digits = text("phone").replace(/\D/g, "");
    if (digits.length < 10) return "Add a phone number, with the area code.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text("email"))) return "Add an email address.";
    if (secretish(text("exnote"))) return "Please take codes and passwords out of the note.";
    return "";
  }

  function showError(msg) {
    error.textContent = msg || "";
    if (msg) {
      error.focus();
    }
  }

  function nextIndex(from) {
    if (gift() && from === 1) return 8;
    if (gift() && from === 8) return 9;
    return from + 1;
  }

  function prevIndex(from) {
    if (gift() && from === 8) return 1;
    if (gift() && from === 9) return 8;
    return from - 1;
  }

  function onNext() {
    var msg = validate(step);
    showError(msg);
    if (msg) return;
    if (step === 9) {
      finish();
      return;
    }
    go(nextIndex(step));
  }

  function onBack() {
    if (step === 1) return;
    showError("");
    go(prevIndex(step));
  }

  function go(n, silent) {
    step = n;
    var panels = form.querySelectorAll("[data-step]");
    panels.forEach(function (panel) {
      panel.hidden = Number(panel.getAttribute("data-step")) !== n;
    });
    if (n === 9) fillRecap(recap);
    updateChrome();
    if (silent) return;
    var heading = form.querySelector('[data-step="' + n + '"] h2');
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus();
    }
  }

  function updateChrome() {
    var name = STEP_NAMES[step - 1];
    progressLabel.textContent = "Step " + step + " of " + STEP_NAMES.length + ". " + name;
    progressWrap.setAttribute("aria-valuenow", String(step));
    progressWrap.setAttribute("aria-valuetext", progressLabel.textContent);
    progressFill.style.width = (step / STEP_NAMES.length * 100) + "%";
    backBtn.hidden = step === 1;
    nextBtn.textContent = step === 9 ? "Send quote request" : "Continue";
  }

  function labelMap(map, key) {
    return map[key] || key;
  }

  function bedsLabel(value) {
    if (value === "na") return "Not applicable";
    if (value === "0") return "Studio / no separate bedroom";
    if (value === "6") return "6 or more bedrooms";
    return value + (value === "1" ? " bedroom" : " bedrooms");
  }

  function bathsLabel(value) {
    if (value === "na") return "Not applicable";
    if (value === "5") return "5 or more bathrooms";
    return value + (value === "1" ? " bathroom" : " bathrooms");
  }

  function sqftLabel(value) {
    var map = {
      unsure: "Not sure",
      lt1000: "Under 1,000 sq ft",
      s1000: "1,000 to 1,500 sq ft",
      s1500: "1,500 to 2,500 sq ft",
      s2500: "2,500 to 4,000 sq ft",
      s4000: "Over 4,000 sq ft"
    };
    return map[value] || value;
  }

  function addonList() {
    var boxes = form.querySelectorAll('input[name="addons"]:checked');
    var names = [];
    boxes.forEach(function (box) {
      if (box.value === "other") {
        var extra = text("addonother");
        names.push(extra ? "Other: " + extra : "Other");
      } else {
        names.push(ADDONS[box.value] || box.value);
      }
    });
    return names.join(", ");
  }

  function photoCount() {
    if (!photoInput || !photoInput.files) return 0;
    return Math.min(photoInput.files.length, 4);
  }

  function fillRecap(target) {
    target.replaceChildren();
    function add(term, value) {
      if (!value) return;
      var dt = document.createElement("dt");
      dt.textContent = term;
      var dd = document.createElement("dd");
      dd.textContent = value;
      target.appendChild(dt);
      target.appendChild(dd);
    }

    add("Service", labelMap(SERVICES, checked("service")));
    if (!gift()) {
      add("Property", labelMap(PROPERTIES, checked("property")));
      add("Bedrooms", bedsLabel(text("beds")));
      add("Bathrooms", bathsLabel(text("baths")));
      add("Approximate size", sqftLabel(text("sqft")));
      add("How often", labelMap(FREQUENCIES, checked("frequency")));
      add("Add-ons to discuss", addonList() || "None selected");
      var when = "";
      if (form.elements.dateflex && form.elements.dateflex.checked && !text("date1")) when = "Flexible on the date";
      else if (text("date1")) when = text("date1");
      if (text("date2")) when += (when ? ". Second choice " : "") + text("date2");
      add("Preferred date", when);
      add("Time of day", labelMap(DAYPARTS, checked("daypart")));
      if (text("timenote")) add("Timing note", text("timenote"));
      var town = labelMap(TOWNS, text("town"));
      if (text("town") === "other") town = text("townother");
      add("Town", town);
      add("Address", text("address"));
      add("Pets", checked("pets") === "yes" ? "Yes" : "No pets");
      if (text("petnote")) add("Pet note", text("petnote"));
      add("Entry", labelMap(ENTRIES, checked("entry")));
      if (text("entrynote")) add("Entry note", text("entrynote"));
      var count = photoCount();
      add("Photos", count ? count + " selected on this phone. Not uploaded." : "None");
    } else {
      add("Gift certificate", "Amount of their choice. Nothing is priced on this preview.");
    }
    add("Name", text("cname"));
    add("Phone", text("phone"));
    add("Email", text("email"));
    if (text("exnote")) add("Note", text("exnote"));
  }

  function renderPhotos() {
    clearUrls();
    photoPreview.replaceChildren();
    if (!photoInput || !photoInput.files) return;
    var files = Array.prototype.slice.call(photoInput.files, 0, 4);
    if (photoInput.files.length > 4 && photoNote) {
      photoNote.textContent = "This preview shows the first 4 photos only. Nothing is uploaded.";
    } else if (photoNote) {
      photoNote.textContent = "Photos stay on this phone. Nothing is uploaded in this preview.";
    }
    files.forEach(function (file) {
      var url = URL.createObjectURL(file);
      urls.push(url);
      var img = document.createElement("img");
      img.src = url;
      img.alt = "";
      photoPreview.appendChild(img);
    });
  }

  function clearUrls() {
    urls.forEach(function (url) { URL.revokeObjectURL(url); });
    urls = [];
  }

  function clearPhotos() {
    clearUrls();
    if (photoInput) photoInput.value = "";
    if (photoPreview) photoPreview.replaceChildren();
    if (photoNote) photoNote.textContent = "Photos stay on this phone. Nothing is uploaded in this preview.";
  }

  function finish() {
    fillRecap(doneRecap);
    clearPhotos();
    wizardUi.hidden = true;
    done.hidden = false;
    document.body.classList.add("is-done");
    var title = document.getElementById("done-title");
    if (title) {
      title.setAttribute("tabindex", "-1");
      title.focus();
    }
    window.scrollTo(0, 0);
  }

  go(1, true);
})();
