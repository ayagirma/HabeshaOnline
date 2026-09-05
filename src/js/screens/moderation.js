/* ── Moderation ───────────────────────────────────────────────────
   Reports buyers file with "Report this ad" on the detail page. This
   screen has no sign-in gate and no server-side roles to put one
   behind — same honesty as the rest of the app about what a
   client-only page can and can't lock down.                          */

(function (HO) {
  var mo = HO.moderation = {};
  var stopWatch = null;

  mo.remove = function (listingId, reportId) {
    HO.store.removeListing(listingId).then(function () {
      return HO.store.resolveReport(reportId);
    }).then(function () {
      HO.toast(HO.t("mod.removed"));
    }).catch(function (e) { HO.toast(HO.errText(e)); });
  };

  mo.dismiss = function (reportId) {
    HO.store.resolveReport(reportId).then(function () {
      HO.toast(HO.t("mod.dismissed"));
    });
  };

  function paint(rows) {
    var body = document.getElementById("moderationBody");
    if (!body) return;
    var open = rows.filter(function (r) { return r.status !== "resolved"; });
    if (!open.length) {
      body.innerHTML = '<div class="empty"><p>' + HO.t("mod.empty") + "</p></div>";
      return;
    }
    body.innerHTML = '<div class="msg-list">' + open.map(function (r) {
      var l = HO.store.get(r.listingId);
      return '<article class="msg unread">' +
        '<div class="msg-head">' +
          '<span class="msg-from">' + HO.esc(HO.t("report." + r.reason) || r.reason) + "</span>" +
          '<span class="msg-on">' + HO.esc(HO.bothDates(r.createdAt, HO.lang)) + "</span>" +
        "</div>" +
        '<p class="msg-body">' +
          (l ? '<button class="link-btn" onclick="HO.detail.open(\'' + HO.esc(l.id) + '\')">' +
                 HO.esc(HO.tt(l.title)) + "</button>"
             : HO.esc(r.listingTitle || "—") + " (" + HO.t("mod.gone") + ")") +
        "</p>" +
        '<p class="msg-contact">' + HO.t("mod.reportedBy") + ": " +
          HO.esc(r.reporterHandle ? "@" + r.reporterHandle : HO.t("mod.anon")) + "</p>" +
        '<div style="display:flex;gap:10px;margin-top:8px">' +
          (l ? '<button class="btn btn-ghost" onclick="HO.moderation.remove(\'' +
                 HO.esc(r.listingId) + "','" + HO.esc(r.id) + '\')">' + HO.t("mod.remove") + "</button>" : "") +
          '<button class="link-btn" onclick="HO.moderation.dismiss(\'' + HO.esc(r.id) + '\')">' +
            HO.t("mod.dismiss") + "</button>" +
        "</div>" +
      "</article>";
    }).join("") + "</div>";
  }

  mo.render = function () {
    var body = document.getElementById("moderationBody");
    if (!body) return;
    body.innerHTML = '<div class="empty"><p>' + HO.t("common.loading") + "</p></div>";
    if (stopWatch) { stopWatch(); stopWatch = null; }
    stopWatch = HO.store.onReports(paint);
  };
})(window.HO);
