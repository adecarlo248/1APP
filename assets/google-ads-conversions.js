(function () {
  'use strict';

  var conversionLabel = 'AW-18283853824/i8sACPCb9-wcEIDwtY5E';
  var trustedOrigins = [
    'https://api.leadconnectorhq.com',
    'https://link.msgsndr.com'
  ];
  var sent = Object.create(null);

  function track(source) {
    if (sent[source]) return;
    sent[source] = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('event', 'conversion', {
      send_to: conversionLabel,
      conversion_source: source
    });
  }

  function showTrialConfirmation(frame, source) {
    if (source !== 'free-trial-lead' && source !== 'get-started-lead') return;

    var wrapper = frame.parentElement;
    if (!wrapper || wrapper.querySelector('[data-oneapp-trial-confirmation]')) return;

    frame.style.display = 'none';
    var confirmation = document.createElement('div');
    confirmation.setAttribute('data-oneapp-trial-confirmation', 'true');
    confirmation.setAttribute('role', 'status');
    confirmation.style.cssText = 'background:#fff;border:1px solid #d9e1ec;border-radius:12px;padding:40px 28px;text-align:center;color:#062653;box-shadow:0 8px 30px rgba(6,38,83,.08);';
    confirmation.innerHTML = '<h2 style="font-size:1.5rem;margin:0 0 12px;">Thank you!</h2><p style="font-size:1rem;line-height:1.6;margin:0;">Someone from 1APP will contact you within one business day to confirm eligibility, onboarding requirements, and launch availability for your 14-day starter-automation trial.</p>';
    wrapper.appendChild(confirmation);
  }

  window.OneAppAds = { track: track };

  window.addEventListener('message', function (event) {
    if (trustedOrigins.indexOf(event.origin) === -1) return;
    if (!Array.isArray(event.data) || event.data[0] !== 'set-sticky-contacts') return;

    var frame = Array.prototype.find.call(
      document.querySelectorAll('iframe[data-oneapp-conversion-source]'),
      function (candidate) { return candidate.contentWindow === event.source; }
    );

    if (!frame) return;
    var source = frame.getAttribute('data-oneapp-conversion-source');
    track(source);
    showTrialConfirmation(frame, source);
  });
})();
