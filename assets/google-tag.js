/* 1APP Google tag.
   Ads ID recovered from commit 9412773 (18 Sep 2026), "Add Google Ads conversion tracking
   for leads and demos": AW-18283853824.
   GA4 measurement ID: NOT FOUND in this repository or its git history.
   PLACEHOLDER — do not send a hit until this is replaced with the real G- ID.
   The placeholder below is intentionally not passed to gtag. */
(function () {
  'use strict';

  if (window.__oneappGoogleTag) return;
  window.__oneappGoogleTag = true;

  var AW_ID = 'AW-18283853824';
  var GA4_MEASUREMENT_ID = 'G-REPLACE_WITH_GA4_MEASUREMENT_ID';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  function hasAwConfig() {
    for (var i = 0; i < window.dataLayer.length; i++) {
      var args = window.dataLayer[i];
      if (args && args[0] === 'config' && args[1] === AW_ID) return true;
    }
    return false;
  }

  function hasGtagLoader() {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src || '';
      if (src.indexOf('googletagmanager.com/gtag/js') !== -1 && src.indexOf(AW_ID) !== -1) return true;
    }
    return false;
  }

  /* Official snippet already configured this ID. Do not load gtag.js again. */
  if (hasGtagLoader()) {
    if (!hasAwConfig()) window.gtag('config', AW_ID);
    return;
  }

  if (!hasAwConfig()) {
    window.gtag('js', new Date());
    window.gtag('config', AW_ID, { allow_enhanced_conversions: true });
    if (GA4_MEASUREMENT_ID.indexOf('REPLACE_WITH') === -1) {
      window.gtag('config', GA4_MEASUREMENT_ID);
    }
  }

  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(AW_ID);
  var first = document.getElementsByTagName('script')[0];
  if (first && first.parentNode) first.parentNode.insertBefore(script, first);
  else document.head.appendChild(script);
})();
