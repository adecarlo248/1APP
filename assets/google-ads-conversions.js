/* Lead and demo conversion for Google Ads action "Submit lead forms".
   send_to label recovered from commit 9412773 (18 Sep 2026):
   AW-18283853824/i8sACPCb9-wcEIDwtY5E
   There is no separate phone-call conversion label in this repo, so tel: clicks
   are not sent on this action. */
(function () {
  'use strict';

  var conversionLabel = 'AW-18283853824/i8sACPCb9-wcEIDwtY5E';
  var trustedOrigins = [
    'https://api.leadconnectorhq.com',
    'https://link.msgsndr.com'
  ];
  var sent = Object.create(null);
  var pendingUserData = typeof WeakMap === 'function' ? new WeakMap() : null;
  var pendingUserDataFallback = [];

  function ensureGtag() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  }

  function storageKey(source) {
    return 'oneapp-ads-conversion:' + source;
  }

  function alreadySent(source) {
    if (sent[source]) return true;
    if (source !== 'demo-booked') return false;
    try {
      return window.sessionStorage.getItem(storageKey(source)) === '1';
    } catch (error) {
      return false;
    }
  }

  function rememberSent(source) {
    sent[source] = true;
    if (source !== 'demo-booked') return;
    try {
      window.sessionStorage.setItem(storageKey(source), '1');
    } catch (error) {}
  }

  function normalizePhone(value) {
    var trimmed = String(value || '').trim();
    if (!trimmed) return '';
    var digits = trimmed.replace(/\D/g, '');
    if (trimmed.charAt(0) === '+' && digits.length >= 10) return '+' + digits;
    if (digits.length === 10) return '+1' + digits;
    if (digits.length === 11 && digits.charAt(0) === '1') return '+' + digits;
    return '';
  }

  function userDataFromPayload(payload) {
    var data = payload;
    if (typeof payload === 'string') {
      try { data = JSON.parse(payload); } catch (error) { return null; }
    }
    if (!data || typeof data !== 'object') return null;

    var email = data.email || data.emailAddress || '';
    var phone = data.phone || data.phoneNumber || data.phone_number || '';
    var first = data.first_name || data.firstName || '';
    var last = data.last_name || data.lastName || '';
    var userData = {};

    if (typeof email === 'string' && email.indexOf('@') !== -1) {
      userData.email = email.trim().toLowerCase();
    }
    var phoneNumber = normalizePhone(phone);
    if (phoneNumber) userData.phone_number = phoneNumber;
    if (first || last) {
      userData.address = {};
      if (first) userData.address.first_name = String(first).trim();
      if (last) userData.address.last_name = String(last).trim();
    }
    return userData.email || userData.phone_number ? userData : null;
  }

  function rememberUserData(sourceWindow, payload) {
    var userData = userDataFromPayload(payload);
    if (!userData || !sourceWindow) return;
    if (pendingUserData) {
      pendingUserData.set(sourceWindow, userData);
      return;
    }
    pendingUserDataFallback.push({ source: sourceWindow, userData: userData });
  }

  function readUserData(sourceWindow) {
    if (!sourceWindow) return null;
    if (pendingUserData) return pendingUserData.get(sourceWindow) || null;
    for (var i = pendingUserDataFallback.length - 1; i >= 0; i -= 1) {
      if (pendingUserDataFallback[i].source === sourceWindow) return pendingUserDataFallback[i].userData;
    }
    return null;
  }

  function track(source, userData) {
    if (!source || alreadySent(source)) return;
    rememberSent(source);
    ensureGtag();
    if (userData) window.gtag('set', 'user_data', userData);
    window.gtag('event', 'conversion', {
      send_to: conversionLabel,
      conversion_source: source
    });
  }

  function showLeadConfirmation(frame, source) {
    if (source !== 'revenue-reactivation-sprint' && source !== 'get-started-lead') return;

    var wrapper = frame.parentElement;
    if (!wrapper || wrapper.querySelector('[data-oneapp-lead-confirmation]')) return;

    frame.style.display = 'none';
    var confirmation = document.createElement('div');
    confirmation.setAttribute('data-oneapp-lead-confirmation', 'true');
    confirmation.setAttribute('role', 'status');
    confirmation.style.cssText = 'background:#fff;border:1px solid #d9e1ec;border-radius:12px;padding:40px 28px;text-align:center;color:#062653;box-shadow:0 8px 30px rgba(6,38,83,.08);';
    confirmation.innerHTML = '<h2 style="font-size:1.5rem;margin:0 0 12px;">Thank you!</h2><p style="font-size:1rem;line-height:1.6;margin:0;">Someone from 1APP will contact you within one business day to confirm your Revenue Reactivation Sprint eligibility, authorized-contact requirements, agreed margin, verified-job fee, and launch availability.</p>';
    wrapper.appendChild(confirmation);
  }

  function frameForSource(sourceWindow) {
    return Array.prototype.find.call(
      document.querySelectorAll('iframe[data-oneapp-conversion-source]'),
      function (candidate) { return candidate.contentWindow === sourceWindow; }
    );
  }

  window.OneAppAds = {
    track: function (source) { track(source, null); }
  };

  window.addEventListener('message', function (event) {
    if (trustedOrigins.indexOf(event.origin) === -1) return;
    if (!Array.isArray(event.data) || event.data[0] !== 'set-sticky-contacts') return;

    var frame = frameForSource(event.source);
    if (!frame) return;

    var source = frame.getAttribute('data-oneapp-conversion-source');
    var mode = frame.getAttribute('data-oneapp-conversion-mode') || 'form';
    var messageKey = String(event.data[1] || '');
    var bookingConfirmed = messageKey.indexOf('embedded_iframe_') === 0;

    /* The calendar posts set-sticky-contacts twice on a successful booking.
       The _ud message carries the contact for enhanced conversions and can
       also be sent when sticky contacts sync. The embedded_iframe_ message
       is the success signal in the current LeadConnector widget. */
    if (mode === 'booking') {
      if (!bookingConfirmed) {
        rememberUserData(event.source, event.data[2]);
        return;
      }
      track(source, readUserData(event.source));
      return;
    }

    var userData = userDataFromPayload(event.data[2]) || readUserData(event.source);
    if (userData) rememberUserData(event.source, event.data[2]);
    track(source, userData);
    showLeadConfirmation(frame, source);
  });
})();
