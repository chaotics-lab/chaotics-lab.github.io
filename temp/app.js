/* ============================================================
   iiSU recreation — theme toggle + scroll reveal motion system
   ============================================================ */

(function () {
  "use strict";

  /* ---------- THEME ---------- */
  // theme is already resolved & applied by the inline head script (avoids flash-of-wrong-theme).
  // here we just wire up the toggle interaction and keep localStorage in sync.
  var root = document.documentElement;
  var STORAGE_KEY = "iisu-theme";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
  }

  var toggleBtn = document.getElementById("themeToggle");
  var flashEl = document.querySelector(".theme-flash");

  if (toggleBtn) {
    var currentTheme = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    toggleBtn.setAttribute("aria-pressed", currentTheme === "light" ? "true" : "false");

    toggleBtn.addEventListener("click", function (e) {
      var current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      var next = current === "light" ? "dark" : "light";

      // origin the power-flash at the toggle's position
      if (flashEl) {
        var rect = toggleBtn.getBoundingClientRect();
        var x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
        var y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
        flashEl.style.setProperty("--flash-x", x + "%");
        flashEl.style.setProperty("--flash-y", y + "%");
        flashEl.classList.remove("firing");
        // restart animation
        void flashEl.offsetWidth;
        flashEl.classList.add("firing");
      }

      applyTheme(next);
      toggleBtn.setAttribute("aria-pressed", next === "light" ? "true" : "false");
    });
  }

  /* ---------- SCROLL REVEAL ---------- */
  var revealTargets = document.querySelectorAll("[data-reveal], [data-reveal-group]");

  if ("IntersectionObserver" in window && revealTargets.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    // no IntersectionObserver support — just show everything
    revealTargets.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- FAQ ACCORDION (animated open/close) ---------- */
  document.querySelectorAll("[data-faq]").forEach(function (item) {
    var btn = item.querySelector(".faq-summary");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var isOpen = item.hasAttribute("open");
      if (isOpen) {
        item.removeAttribute("open");
        btn.setAttribute("aria-expanded", "false");
      } else {
        item.setAttribute("open", "");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- MOBILE NAV TOGGLE ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mainNav = document.querySelector(".main-nav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      mainNav.classList.toggle("nav-open");
    });
  }

  /* ---------- NEWS FILTER PILLS (cosmetic in this static recreation) ---------- */
  document.querySelectorAll(".filter-pills button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".filter-pills button").forEach(function (b) {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
    });
  });
})();