/* Confirmed Hub appearances only. Empty as of 7 Nov 2026.
   Shape: { name, start, end, timezone, venue, address, town, note,
            organiserUrl, sourceUrl, verifiedOn, status } */
window.HUB_EVENTS = [];

window.HUB_eventUpcoming = function (event, now) {
  if (!event || event.status !== "confirmed" || !event.start) return false;
  var end = new Date(event.end || event.start);
  return end >= now;
};

(function () {
  var mount = document.getElementById("confirmed-events");
  if (!mount) return;
  var now = new Date();
  var upcoming = window.HUB_EVENTS.filter(function (event) {
    return window.HUB_eventUpcoming(event, now);
  }).sort(function (a, b) { return new Date(a.start) - new Date(b.start); });
  if (!upcoming.length) {
    mount.innerHTML = "<p class=\"display\" style=\"font-size:clamp(28px,7vw,44px)\">Our next market dates will appear here once confirmed.</p>";
    return;
  }
  mount.innerHTML = "";
  upcoming.forEach(function (event) {
    var start = new Date(event.start);
    var when = start.toLocaleString("en-CA", { timeZone: event.timezone || "America/Toronto", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    var card = document.createElement("article");
    card.className = "date-card";
    card.innerHTML =
      "<p class=\"date-block\">" + start.toLocaleString("en-CA", { timeZone: event.timezone || "America/Toronto", month: "short", day: "numeric" }) + "</p>" +
      "<div><h2>" + event.name + "</h2><p>" + (event.venue || "") + (event.town ? " · " + event.town : "") + "</p><p>" + when + " · " + (event.timezone || "America/Toronto") + "</p>" +
      (event.note ? "<p>" + event.note + "</p>" : "") +
      (event.sourceUrl ? "<p class=\"fine\">Checked " + (event.verifiedOn || "") + ". <a href=\"" + event.sourceUrl + "\">Source</a></p>" : "") +
      "</div>";
    mount.appendChild(card);
  });
})();
