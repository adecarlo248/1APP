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

  window.OneAppAds = { track: track };

  window.addEventListener('message', function (event) {
    if (trustedOrigins.indexOf(event.origin) === -1) return;
    if (!Array.isArray(event.data) || event.data[0] !== 'set-sticky-contacts') return;

    var frame = Array.prototype.find.call(
      document.querySelectorAll('iframe[data-oneapp-conversion-source]'),
      function (candidate) { return candidate.contentWindow === event.source; }
    );

    if (!frame) return;
    track(frame.getAttribute('data-oneapp-conversion-source'));
  });
})();
