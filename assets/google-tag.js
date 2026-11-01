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
  window.gtag('js', new Date());
  window.gtag('config', AW_ID, { allow_enhanced_conversions: true });

  if (GA4_MEASUREMENT_ID.indexOf('REPLACE_WITH') === -1) {
    window.gtag('config', GA4_MEASUREMENT_ID);
  }

  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(AW_ID);
  var first = document.getElementsByTagName('script')[0];
  if (first && first.parentNode) first.parentNode.insertBefore(script, first);
  else document.head.appendChild(script);
})();
