/* ── App shell ─────────────────────────────────────────────────────
   Screen switching, the nav, the language toggle, and start-up.       */

(function (HO) {
  var SCREENS = ["browse", "detail", "post", "pricing", "checkout", "saved", "inbox", "you", "seller", "moderation"];
  var history = [];

  HO.current = "browse";

  function show(screen) {
    HO.current = screen;
    SCREENS.forEach(function (s) {
      var el = document.getElementById("screen-" + s);
      if (el) el.hidden = s !== screen;
    });

    if (screen === "browse")   HO.browse.render();
    if (screen === "pricing")  HO.pricing.render();
    if (screen === "saved")    HO.account.renderSaved();
    if (screen === "inbox")    HO.account.renderInbox();
    if (screen === "you")      HO.account.render();
    if (screen === "post")     HO.post.render();
    if (screen === "detail")   HO.detail.render();
    if (screen === "seller")   HO.seller.render();
    if (screen === "checkout") HO.checkout.render();
    if (screen === "moderation") HO.moderation.render();

    HO.renderNav();
    window.scrollTo(0, 0);
  }

  /* Navigate, remembering where we came from so Back has somewhere
     to return to. */
  HO.go = function (screen) {
    if (SCREENS.indexOf(screen) === -1) screen = "browse";
    if (screen !== HO.current) history.push(HO.current);
    if (history.length > 30) history.shift();
    show(screen);
  };

  HO.back = function () {
    show(history.pop() || "browse");
  };

  var NAV = [
    { key: "browse",  label: "nav.browse" },
    { key: "saved",   label: "nav.saved" },
    { key: "inbox",   label: "nav.inbox" },
    { key: "pricing", label: "nav.pricing" }
  ];

  HO.renderNav = function () {
    document.getElementById("nav").innerHTML = NAV.map(function (n) {
      return '<button class="' + (HO.current === n.key ? "on" : "") +
        "\" onclick=\"HO.go('" + n.key + "')\">" + HO.t(n.label) + "</button>";
    }).join("");

    document.querySelectorAll(".tab").forEach(function (t) {
      t.classList.toggle("on", t.dataset.screen === HO.current);
    });
    HO.account.updateDot();
  };

  HO.setLang = function (l) {
    HO.lang = l === "am" ? "am" : "en";
    try { localStorage.setItem("ho.lang.v1", HO.lang); } catch (e) {}
    HO.applyLang();
    HO.renderNav();
    HO.browse.render();
    if (HO.current === "detail")   HO.detail.render();
    if (HO.current === "post")     HO.post.render();
    if (HO.current === "pricing")  HO.pricing.render();
    if (HO.current === "checkout") HO.checkout.render();
    if (HO.current === "saved")    HO.account.renderSaved();
    if (HO.current === "you")      HO.account.render();
    if (HO.current === "seller")   HO.seller.render();
    if (HO.current === "inbox")    HO.account.renderInbox();
    if (HO.current === "moderation") HO.moderation.render();
    HO.footStatus();
  };

  HO.footStatus = function () {
    var el = document.getElementById("storageStatus");
    if (el) el.textContent = HO.t(HO.store.statusKey());
  };

  /* ── boot ────────────────────────────────────────────────────── */
  function boot() {
    try {
      var saved = localStorage.getItem("ho.lang.v1");
      if (saved === "am" || saved === "en") HO.lang = saved;
    } catch (e) {}

    HO.applyLang();
    HO.auth.restore();

    /* Draw the board immediately from the samples; the shared store,
       when this viewer has it, redraws over the top a moment later. */
    HO.go("browse");
    HO.footStatus();

    HO.store.onListings(function () {
      if (HO.current === "browse") HO.browse.render();
      if (HO.current === "saved")  HO.account.renderSaved();
      if (HO.current === "you")    HO.account.render();
      if (HO.current === "seller") HO.seller.render();
    });

    HO.store.init().then(function () {
      HO.footStatus();
      HO.browse.render();
      if (HO.auth.isSignedIn()) HO.account.watchInbox();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.HO);
