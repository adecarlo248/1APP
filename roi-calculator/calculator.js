(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.OneAppRoi = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var BOOKING = 'https://use1app.com/book-demo';
  var CLICK_IDS = {
    fbclid: true,
    gclid: true,
    gbraid: true,
    wbraid: true,
    gclsrc: true,
    dclid: true,
    msclkid: true,
    ttclid: true,
    twclid: true,
    li_fat_id: true,
    yclid: true,
    irclickid: true,
    epik: true,
    sccid: true,
    gad_source: true,
    gad_campaignid: true,
    gacid: true,
    mc_cid: true,
    mc_eid: true,
    igshid: true
  };

  function roundCents(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  function formatMoney(n) {
    var cents = roundCents(n);
    var negative = cents < 0;
    var parts = Math.abs(cents).toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (negative ? '-$' : '$') + parts[0] + '.' + parts[1];
  }

  function formatCount(n) {
    var rounded = Math.round(n * 100) / 100;
    var parts = rounded.toFixed(2).replace(/\.?0+$/, '').split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  function parseNumber(raw) {
    if (raw == null) return { empty: true };
    var text = String(raw).trim();
    if (text === '') return { empty: true };
    var cleaned = text.replace(/\$/g, '').replace(/%/g, '').replace(/\s/g, '').replace(/,/g, '');
    if (!/^(\d+(\.\d+)?|\.\d+)$/.test(cleaned)) return { invalid: true };
    var value = Number(cleaned);
    if (!Number.isFinite(value)) return { invalid: true };
    return { value: value };
  }

  function bookingUrl(search, base) {
    var origin = base || BOOKING;
    var query = search == null ? '' : String(search);
    if (query.charAt(0) === '?') query = query.slice(1);
    var incoming = new URLSearchParams(query);
    var outgoing = new URLSearchParams();
    incoming.forEach(function (value, key) {
      var lower = String(key).toLowerCase();
      if (lower.indexOf('utm_') === 0 || CLICK_IDS[lower] || /clid$/i.test(key)) {
        outgoing.append(key, value);
      }
    });
    var qs = outgoing.toString();
    return qs ? origin + '?' + qs : origin;
  }

  function cleanDisplay(raw) {
    var text = String(raw == null ? '' : raw).trim().replace(/\$/g, '').replace(/%/g, '').replace(/\s/g, '').replace(/,/g, '');
    if (text.charAt(0) === '.') text = '0' + text;
    text = text.replace(/^0+(?=\d)/, '');
    text = text.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
    return text;
  }

  function formatInputNumber(raw) {
    var cleaned = cleanDisplay(raw);
    var parts = cleaned.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  function missedExplanation(callsText, rateText, job, weeklyMoney, yearlyMoney, monthlyMoney) {
    var yearLine = roundCents(weeklyMoney * 52) === yearlyMoney
      ? formatMoney(weeklyMoney) + ' per week × 52 weeks = ' + formatMoney(yearlyMoney) + ' per year.'
      : 'Per year is 52 × that weekly amount, then rounded to the nearest cent: ' + formatMoney(yearlyMoney) + '.';
    var monthLine = roundCents(yearlyMoney / 12) === monthlyMoney
      ? formatMoney(yearlyMoney) + ' per year ÷ 12 = ' + formatMoney(monthlyMoney) + ' per month.'
      : 'Per month is that yearly amount ÷ 12, rounded to the nearest cent: ' + formatMoney(monthlyMoney) + '.';
    return 'You entered ' + callsText + ' missed calls or inbound leads per week, a ' + rateText + '% call-to-customer rate, and an average job value of ' + formatMoney(job) + '. ' + callsText + ' × ' + rateText + '% × ' + formatMoney(job) + ' = ' + formatMoney(weeklyMoney) + ' per week. ' + yearLine + ' ' + monthLine + ' Dollar amounts are rounded to the nearest cent.';
  }

  function dormantExplanation(customersText, rateText, job, total, usedDefaultJob, mainJob) {
    var base = 'You entered ' + customersText + ' past customers and a ' + rateText + '% reactivation rate. ' + customersText + ' × ' + rateText + '% × ' + formatMoney(job) + ' = ' + formatMoney(total) + ' if that share booked one job.';
    if (usedDefaultJob) {
      base += ' The job value for this line was left blank, so it uses the ' + formatMoney(mainJob) + ' average job value from the missed-call section.';
    }
    base += ' This line is separate from the missed-call estimate. It is not a monthly or yearly figure. Dollar amounts are rounded to the nearest cent.';
    return base;
  }

  function calculate(input) {
    var errors = {};
    var name = String(input.name == null ? '' : input.name).trim();
    var email = String(input.email == null ? '' : input.email).trim();
    var phone = String(input.phone == null ? '' : input.phone).trim();

    if (!name) errors.name = 'Enter your name.';
    else if (name.length > 100) errors.name = 'Enter a name under 100 characters.';

    if (!email) errors.email = 'Enter your email.';
    else if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter an email address like name@example.com.';

    if (phone) {
      var digits = phone.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) errors.phone = 'Enter a phone number with 7 to 15 digits, or leave it blank.';
    }

    var missed = parseNumber(input.missedPerWeek);
    var rate = parseNumber(input.conversionRate);
    var job = parseNumber(input.jobValue);
    var past = parseNumber(input.pastCustomers);
    var reactivation = parseNumber(input.reactivationRate);
    var dormantJob = parseNumber(input.dormantJobValue);

    if (missed.empty) errors.missedPerWeek = 'Enter the average missed calls or inbound leads per week.';
    else if (missed.invalid) errors.missedPerWeek = 'Enter a number, such as 8.';
    else if (missed.value > 100000) errors.missedPerWeek = 'Enter 100,000 or fewer per week.';

    if (rate.empty) errors.conversionRate = 'Enter the call-to-customer rate you want to use.';
    else if (rate.invalid) errors.conversionRate = 'Enter a percent from 0 to 100.';
    else if (rate.value > 100) errors.conversionRate = 'Enter a rate from 0 to 100.';

    if (job.empty) errors.jobValue = 'Enter the average job value.';
    else if (job.invalid) errors.jobValue = 'Enter a dollar amount, such as 750.';
    else if (job.value > 10000000) errors.jobValue = 'Enter a job value of $10,000,000 or less.';

    var pastTouched = !past.empty || !reactivation.empty;
    if (past.invalid) errors.pastCustomers = 'Enter the number of past customers, or leave it blank.';
    else if (past.value > 10000000) errors.pastCustomers = 'Enter 10,000,000 or fewer past customers.';
    else if (past.empty && !reactivation.empty) errors.pastCustomers = 'Enter the number of past customers, or clear the reactivation rate to skip this line.';

    if (reactivation.invalid) errors.reactivationRate = 'Enter a reactivation rate from 0 to 100, or leave it blank.';
    else if (!reactivation.empty && reactivation.value > 100) errors.reactivationRate = 'Enter a rate from 0 to 100.';
    else if (reactivation.empty && !past.empty) errors.reactivationRate = 'Enter the reactivation rate you consider realistic, or clear the past-customer count to skip this line.';

    if (dormantJob.invalid) errors.dormantJobValue = 'Enter a dollar amount, or leave it blank to use the missed-call job value.';
    else if (!dormantJob.empty && dormantJob.value > 10000000) errors.dormantJobValue = 'Enter a job value of $10,000,000 or less.';
    else if (pastTouched && dormantJob.empty && (job.empty || job.invalid)) errors.dormantJobValue = 'Enter a job value for past customers, or enter the missed-call job value above.';

    if (Object.keys(errors).length) return { ok: false, errors: errors };

    var weeklyExact = missed.value * (rate.value / 100) * job.value;
    var yearlyExact = weeklyExact * 52;
    var monthlyExact = yearlyExact / 12;
    var weeklyMoney = roundCents(weeklyExact);
    var yearlyMoney = roundCents(yearlyExact);
    var monthlyMoney = roundCents(monthlyExact);

    var dormant = null;
    if (pastTouched) {
      var dormantJobValue = dormantJob.empty ? job.value : dormantJob.value;
      var totalExact = past.value * (reactivation.value / 100) * dormantJobValue;
      var total = roundCents(totalExact);
      dormant = {
        total: total,
        totalText: formatMoney(total),
        usedDefaultJob: dormantJob.empty === true,
        explanation: dormantExplanation(formatInputNumber(input.pastCustomers), formatInputNumber(input.reactivationRate), dormantJobValue, total, dormantJob.empty, job.value)
      };
    }

    return {
      ok: true,
      errors: {},
      contact: { name: name, email: email, phone: phone },
      missed: {
        weekly: weeklyMoney,
        yearly: yearlyMoney,
        monthly: monthlyMoney,
        weeklyText: formatMoney(weeklyMoney),
        yearlyText: formatMoney(yearlyMoney),
        monthlyText: formatMoney(monthlyMoney),
        explanation: missedExplanation(formatInputNumber(input.missedPerWeek), formatInputNumber(input.conversionRate), job.value, weeklyMoney, yearlyMoney, monthlyMoney)
      },
      dormant: dormant
    };
  }

  function readForm(form) {
    function value(name) {
      var field = form.querySelector('[data-field="' + name + '"]');
      return field ? field.value : '';
    }
    return {
      name: value('name'),
      email: value('email'),
      phone: value('phone'),
      missedPerWeek: value('missedPerWeek'),
      conversionRate: value('conversionRate'),
      jobValue: value('jobValue'),
      pastCustomers: value('pastCustomers'),
      reactivationRate: value('reactivationRate'),
      dormantJobValue: value('dormantJobValue')
    };
  }

  function showErrors(form, errors) {
    var fields = form.querySelectorAll('[data-field]');
    var first = null;
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      var key = field.getAttribute('data-field');
      var message = errors[key] || '';
      var slot = form.querySelector('[data-error-for="' + key + '"]');
      if (slot) slot.textContent = message;
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        if (!first) first = field;
      } else {
        field.removeAttribute('aria-invalid');
      }
    }
    var summary = form.querySelector('[data-error-summary]');
    if (summary) {
      if (Object.keys(errors).length) {
        summary.hidden = false;
        summary.textContent = 'Check the marked fields. The estimate uses only the numbers you enter.';
      } else {
        summary.hidden = true;
        summary.textContent = '';
      }
    }
    return first;
  }

  function render(doc, model) {
    var result = doc.getElementById('roi-result');
    if (!result) return;
    result.hidden = false;
    var month = doc.getElementById('missed-month');
    var year = doc.getElementById('missed-year');
    var math = doc.getElementById('missed-math');
    if (month) month.textContent = model.missed.monthlyText;
    if (year) year.textContent = model.missed.yearlyText;
    if (math) math.textContent = model.missed.explanation;

    var dormantBlock = doc.getElementById('dormant-block');
    if (dormantBlock) {
      if (model.dormant) {
        dormantBlock.hidden = false;
        var total = doc.getElementById('dormant-total');
        var dormantMath = doc.getElementById('dormant-math');
        if (total) total.textContent = model.dormant.totalText;
        if (dormantMath) dormantMath.textContent = model.dormant.explanation;
      } else {
        dormantBlock.hidden = true;
      }
    }

    var booking = bookingUrl(doc.location ? doc.location.search : '');
    var links = doc.querySelectorAll('[data-booking-link]');
    for (var i = 0; i < links.length; i++) links[i].setAttribute('href', booking);

    var title = doc.getElementById('roi-result-title');
    if (title && typeof title.focus === 'function') title.focus();
    if (typeof result.scrollIntoView === 'function') result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function mount(doc) {
    if (!doc || doc.__oneappRoiMounted) return;
    var form = doc.getElementById('roi-form');
    if (!form) return;
    doc.__oneappRoiMounted = true;

    var booking = bookingUrl(doc.location ? doc.location.search : '');
    var links = doc.querySelectorAll('[data-booking-link]');
    for (var i = 0; i < links.length; i++) links[i].setAttribute('href', booking);

    var edit = doc.getElementById('edit-numbers');
    if (edit) {
      edit.addEventListener('click', function () {
        var field = form.querySelector('[data-field="missedPerWeek"]');
        if (field && typeof field.focus === 'function') field.focus();
        if (field && typeof field.scrollIntoView === 'function') field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }

    form.addEventListener('submit', function (event) {
      if (event && typeof event.preventDefault === 'function') event.preventDefault();
      var model = calculate(readForm(form));
      if (!model.ok) {
        var first = showErrors(form, model.errors);
        if (first && typeof first.focus === 'function') first.focus();
        return;
      }
      showErrors(form, {});
      var submit = form.querySelector('[type="submit"]');
      if (submit) submit.textContent = 'Update the estimate';
      render(doc, model);
    });
  }

  return {
    calculate: calculate,
    bookingUrl: bookingUrl,
    formatMoney: formatMoney,
    mount: mount
  };
});
