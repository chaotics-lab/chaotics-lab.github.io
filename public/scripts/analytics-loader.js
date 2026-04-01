(function () {
  var isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  if (isLocal) return;

  var analytics = document.createElement("script");
  analytics.defer = true;
  analytics.src = "/stats/script.js";
  analytics.setAttribute("data-website-id", "6c3150ff-16e1-4bcc-bdaf-d5cf2fa804ab");
  document.head.appendChild(analytics);
})();