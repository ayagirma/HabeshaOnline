/* ── Shared UI ─────────────────────────────────────────────────────
   Escaping, price and date formatting, the listing card, the toast, and
   the bookmark list. Everything a seller typed passes through esc()
   before it reaches innerHTML.                                        */

(function (HO) {

  HO.esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  HO.money = function (n) {
    return "$" + Number(n || 0).toLocaleString("en-US");
  };

  /* "$1,800/mo", "From $45", "Call for quote" — in either language. */
  HO.priceLabel = function (l) {
    var am = HO.lang === "am";
    if (l.unit === "quote" || (!l.price && l.unit !== "total")) return HO.t("unit.quote");
    var m = HO.money(l.price);
    switch (l.unit) {
      case "mo":   return am ? m + "/ወር"  : m + "/mo";
      case "day":  return am ? m + "/ቀን"  : m + "/day";
      case "hr":   return am ? m + "/ሰዓት" : m + "/hr";
      case "from": return am ? "ከ" + m + " ጀምሮ" : "From " + m;
      default:     return m;
    }
  };

  /* Sorting needs a comparable number; "call for quote" sorts last. */
  HO.priceValue = function (l) {
    if (l.unit === "quote") return Number.MAX_SAFE_INTEGER;
    return Number(l.price) || 0;
  };

  HO.initials = function (name) {
    var parts = String(name || "?").trim().split(/\s+/).slice(0, 2);
    return parts.map(function (p) { return p[0]; }).join("").toUpperCase();
  };

  /* ── bookmarks (this browser only) ───────────────────────────── */
  var K_SAVED = "ho.saved.v1";
  HO.saved = function () {
    try { return JSON.parse(localStorage.getItem(K_SAVED)) || []; } catch (e) { return []; }
  };
  HO.isSaved = function (id) { return HO.saved().indexOf(id) !== -1; };
  HO.toggleSaved = function (id) {
    var list = HO.saved();
    var i = list.indexOf(id);
    if (i === -1) list.push(id); else list.splice(i, 1);
    try { localStorage.setItem(K_SAVED, JSON.stringify(list)); } catch (e) {}
    return i === -1;
  };

  /* ── toast ───────────────────────────────────────────────────── */
  var toastTimer = null;
  HO.toast = function (msg) {
    var el = document.getElementById("toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 3600);
  };

  /* An error thrown by store/auth carries a translation key. */
  HO.errText = function (e) {
    if (e && e.key) return HO.t(e.key, e.vars);
    return HO.t("store.err");
  };

  /* ── the listing card ────────────────────────────────────────── */
  HO.artFor = function (l) {
    return l.art || "g-stone";
  };

  HO.cardHtml = function (l, opts) {
    opts = opts || {};
    var featured = l.tier === "featured" || l.tier === "premium";
    var mine = HO.auth.session && l.sellerId === HO.auth.session.sellerId;
    var cat = HO.cat(l.cat);
    var savedOn = HO.isSaved(l.id);

    var art = l.thumb
      ? '<img src="' + HO.esc(l.thumb) + '" alt="" loading="lazy" />'
      : '<span aria-hidden="true">' + HO.esc(l.ico || cat.ico) + "</span>";

    return '' +
      '<article class="card' + (featured ? " is-featured" : "") + '">' +
        '<button class="card-open" onclick="HO.detail.open(\'' + HO.esc(l.id) + '\')" ' +
                'aria-label="' + HO.esc(HO.tt(l.title)) + '">' +
          '<div class="thumb ' + HO.esc(HO.artFor(l)) + '">' + art +
            (featured ? '<span class="chip chip-featured">★ ' + HO.t("card.featured") + "</span>" : "") +
            (mine ? '<span class="chip chip-mine">' + HO.t("card.yours") + "</span>" :
             (l.sample ? '<span class="chip chip-sample">' + HO.t("card.sample") + "</span>" : "")) +
            (l.video ? '<span class="chip chip-video">▶ ' + HO.t("card.video") + "</span>" : "") +
          "</div>" +
          '<div class="card-body">' +
            '<div class="card-cat">' + HO.esc(HO.tt(cat)) + "</div>" +
            '<h3 class="card-title">' + HO.esc(HO.tt(l.title)) + "</h3>" +
            '<div class="card-meta">' +
              '<span class="price">' + HO.esc(HO.priceLabel(l)) + "</span>" +
              '<span class="place">' + HO.esc(l.place || "") + "</span>" +
            "</div>" +
            '<div class="card-foot">' +
              "<span>" + HO.esc(l.seller || "") + "</span>" +
              "<span>" + HO.esc(HO.timeAgo(l.createdAt, HO.lang)) + "</span>" +
            "</div>" +
          "</div>" +
        "</button>" +
        '<button class="save' + (savedOn ? " on" : "") + '" ' +
                'onclick="HO.onSaveClick(event, \'' + HO.esc(l.id) + '\')" ' +
                'aria-pressed="' + (savedOn ? "true" : "false") + '" ' +
                'title="' + HO.t(savedOn ? "card.unsave" : "card.save") + '" ' +
                'aria-label="' + HO.t(savedOn ? "card.unsave" : "card.save") + '">' +
          (savedOn ? "♥" : "♡") +
        "</button>" +
      "</article>";
  };

  HO.onSaveClick = function (ev, id) {
    ev.stopPropagation();
    var on = HO.toggleSaved(id);
    var btn = ev.currentTarget;
    btn.classList.toggle("on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.textContent = on ? "♥" : "♡";
    btn.setAttribute("aria-label", HO.t(on ? "card.unsave" : "card.save"));
    if (HO.current === "saved") HO.account.renderSaved();
  };

  HO.gridHtml = function (list) {
    return list.map(function (l) { return HO.cardHtml(l); }).join("");
  };

  /* Buyers only ever see live listings. */
  HO.liveListings = function () {
    return HO.store.listings().filter(HO.store.isLive);
  };
})(window.HO);
