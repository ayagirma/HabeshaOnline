/* ── Listing detail ────────────────────────────────────────────────
   Gallery, description, seller panel, the ask-a-question form, and the
   safety note that belongs next to a stranger's phone number.         */

(function (HO) {
  var d = HO.detail = {};
  var current = null;
  var photos = [];
  var shown = 0;

  d.open = function (id) {
    var l = HO.store.get(id);
    if (!l) { HO.toast(HO.t("detail.gone")); return; }
    current = l;
    photos = [];
    shown = 0;
    HO.go("detail");
    d.render();
    if (!l.sample) {
      HO.store.getPhotos(id).then(function (list) {
        if (current && current.id === id && list.length) { photos = list; d.render(); }
      });
    }
  };

  d.pick = function (i) { shown = i; d.render(); };

  d.showContact = function () {
    if (!current) return;
    var el = document.getElementById("contactBox");
    if (!el) return;
    var value = current.contact || (current.sample ? "" : "");
    if (!value) {
      el.innerHTML = '<p class="note note-warn">' + HO.t("ask.sample") + "</p>";
      return;
    }
    var href = current.method === "email" ? "mailto:" + value : "tel:" + value.replace(/[^0-9+]/g, "");
    el.innerHTML = '<a class="contact-out" href="' + HO.esc(href) + '">' + HO.esc(value) + "</a>";
  };

  var REPORT_REASONS = ["spam", "scam", "wrongCat", "offensive", "other"];

  d.reportOpen = function () {
    var box = document.getElementById("reportBox");
    if (!box) return;
    box.innerHTML =
      '<p class="hint" style="color:var(--muted);font-size:13px;margin-bottom:8px">' +
        HO.t("detail.reportWhy") + "</p>" +
      '<div class="chips">' + REPORT_REASONS.map(function (r) {
        return '<button type="button" class="pick" onclick="HO.detail.reportSend(\'' + r + '\')">' +
          HO.t("report." + r) + "</button>";
      }).join("") +
      '<button type="button" class="link-btn" onclick="HO.detail.reportClose()">' +
        HO.t("common.cancel") + "</button></div>";
  };

  d.reportClose = function () {
    var box = document.getElementById("reportBox");
    if (box) box.innerHTML = reportLinkHtml();
  };

  d.reportSend = function (reason) {
    if (!current) return;
    var box = document.getElementById("reportBox");
    var s = HO.auth.session;
    HO.store.addReport({
      listingId: current.id,
      listingTitle: HO.tt(current.title),
      reason: reason,
      reporterId: s ? s.sellerId : "",
      reporterHandle: s ? s.handle : ""
    }).then(function () {
      if (box) box.innerHTML = '<p class="note note-ok">' + HO.t("detail.reported") + "</p>";
    }).catch(function (e) { HO.toast(HO.errText(e)); });
  };

  function reportLinkHtml() {
    return '<button class="link-btn" onclick="HO.detail.reportOpen()">' + HO.t("detail.report") + "</button>";
  }

  d.send = function (ev) {
    ev.preventDefault();
    if (!current) return false;
    var form = ev.target;
    var name = form.name_.value.trim();
    var contact = form.contact_.value.trim();
    var body = form.body_.value.trim();
    if (!name || !contact || !body) return false;

    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = HO.t("common.saving");

    HO.store.addInquiry({
      listingId: current.id,
      listingTitle: HO.tt(current.title),
      sellerId: current.sellerId,
      fromName: name,
      contact: contact,
      body: body
    }).then(function () {
      form.reset();
      document.getElementById("askDone").hidden = false;
      HO.toast(HO.t("ask.sent"));
    }).catch(function (e) {
      HO.toast(HO.errText(e));
    }).then(function () {
      btn.disabled = false;
      btn.textContent = HO.t("ask.send");
    });
    return false;
  };

  function galleryHtml(l) {
    var art = HO.artFor(l);
    var big;
    if (photos.length) {
      big = '<div class="shot ' + art + '"><img src="' + HO.esc(photos[shown]) +
            '" alt="' + HO.esc(HO.tt(l.title)) + '" /></div>';
    } else if (l.thumb) {
      big = '<div class="shot ' + art + '"><img src="' + HO.esc(l.thumb) +
            '" alt="' + HO.esc(HO.tt(l.title)) + '" /></div>';
    } else {
      big = '<div class="shot ' + art + '"><span aria-hidden="true">' +
            HO.esc(l.ico || HO.cat(l.cat).ico) + "</span></div>";
    }
    var strip = photos.length > 1
      ? '<div class="thumbs">' + photos.map(function (p, i) {
          return '<button onclick="HO.detail.pick(' + i + ')" aria-current="' +
                 (i === shown ? "true" : "false") + '" aria-label="Photo ' + (i + 1) + '">' +
                 '<img src="' + HO.esc(p) + '" alt="" /></button>';
        }).join("") + "</div>"
      : "";
    return '<div class="gallery">' + big + strip + "</div>";
  }

  function sellerPanel(l) {
    var isMine = HO.auth.session && l.sellerId === HO.auth.session.sellerId;
    return '<div class="panel">' +
      (l.sample
        ? '<p class="note note-warn">' + HO.t("detail.sampleNote") + "</p>"
        : '<button class="seller" onclick="HO.seller.open(\'' + HO.esc(l.sellerId) + '\')">' +
            '<span class="avatar">' + HO.esc(HO.initials(l.seller)) + "</span>" +
            "<span><span class=\"seller-name\">" + HO.esc(l.seller || "") + "</span><br />" +
            '<span class="seller-sub">' + HO.t("detail.viewSeller") + "</span></span>" +
          "</button>") +
      (l.sample ? "" :
        '<div id="contactBox"><button class="btn btn-accent btn-wide" style="margin-top:12px" ' +
        'onclick="HO.detail.showContact()">' + HO.t("detail.contact") + "</button></div>") +
      (isMine
        ? '<button class="btn btn-ghost btn-wide" style="margin-top:8px" onclick="HO.post.edit(\'' +
          HO.esc(l.id) + '\')">' + HO.t("common.edit") + "</button>"
        : "") +
    "</div>";
  }

  function askPanel(l) {
    if (l.sample) return "";
    return '<div class="panel">' +
      "<h3>" + HO.t("ask.title") + "</h3>" +
      '<form onsubmit="return HO.detail.send(event)" style="display:grid;gap:12px;margin-top:12px">' +
        '<div class="field"><label for="ask_name">' + HO.t("ask.name") + "</label>" +
        '<input id="ask_name" name="name_" required maxlength="60" autocomplete="name" /></div>' +
        '<div class="field"><label for="ask_contact">' + HO.t("ask.contact") + "</label>" +
        '<input id="ask_contact" name="contact_" required maxlength="80" /></div>' +
        '<div class="field"><label for="ask_body">' + HO.t("ask.body") + "</label>" +
        '<textarea id="ask_body" name="body_" required maxlength="600" placeholder="' +
          HO.esc(HO.t("ask.ph")) + '"></textarea></div>' +
        '<button class="btn btn-ink" type="submit">' + HO.t("ask.send") + "</button>" +
        '<p class="note note-ok" id="askDone" hidden>' + HO.t("ask.sent") + "</p>" +
      "</form></div>";
  }

  d.render = function () {
    var l = current;
    if (!l) return;
    var cat = HO.cat(l.cat);
    var similar = HO.liveListings().filter(function (x) {
      return x.cat === l.cat && x.id !== l.id;
    }).slice(0, 4);

    document.getElementById("detailBody").innerHTML =
      '<div class="detail">' +
        "<div>" +
          galleryHtml(l) +
          '<div class="detail-head">' +
            '<div class="detail-title"><h1>' + HO.esc(HO.tt(l.title)) + "</h1>" +
              '<span class="detail-price">' + HO.esc(HO.priceLabel(l)) + "</span></div>" +
            '<div class="detail-meta">' +
              "<span>" + HO.esc(HO.tt(cat)) + "</span><span class=\"dot\">·</span>" +
              "<span>📍 " + HO.esc(l.place || "") + "</span><span class=\"dot\">·</span>" +
              "<span>" + HO.t("detail.posted") + " " + HO.esc(HO.bothDates(l.createdAt, HO.lang)) + "</span>" +
              (l.tier && l.tier !== "free"
                ? '<span class="badge badge-plan">' + HO.esc(HO.tt(HO.tier(l.tier).name)) + "</span>" : "") +
            "</div>" +
          "</div>" +
          '<h3 class="detail-body-h3">' + HO.t("detail.about") + "</h3>" +
          '<p class="detail-desc">' + (HO.tt(l.desc) ? HO.esc(HO.tt(l.desc)) : HO.t("detail.noDesc")) + "</p>" +
          '<div id="reportBox" style="margin-top:20px">' + reportLinkHtml() + "</div>" +
        "</div>" +
        '<aside class="aside">' +
          sellerPanel(l) +
          askPanel(l) +
          '<div class="panel"><h3>' + HO.t("detail.safety") + "</h3>" +
            '<ul class="safety" style="margin-top:10px">' +
              "<li>" + HO.t("detail.s1") + "</li>" +
              "<li>" + HO.t("detail.s2") + "</li>" +
              "<li>" + HO.t("detail.s3") + "</li>" +
            "</ul></div>" +
        "</aside>" +
      "</div>" +
      (similar.length
        ? '<section class="similar"><div class="block-head"><h2>' + HO.t("detail.similar") +
          '</h2></div><div class="grid">' + HO.gridHtml(similar) + "</div></section>"
        : "");
  };

  /* ── seller profile ──────────────────────────────────────────── */
  var s = HO.seller = {};
  var sellerId = null;

  s.open = function (id) {
    if (!id || id === "sample") return;
    sellerId = id;
    HO.go("seller");
    s.render();
  };

  s.render = function () {
    if (!sellerId) return;
    var rows = HO.store.bySeller(sellerId);
    var name = rows.length ? rows[0].seller : "—";
    var since = rows.length
      ? Math.min.apply(null, rows.map(function (r) { return r.createdAt; }))
      : Date.now();

    document.getElementById("sellerBody").innerHTML =
      '<div class="seller-head">' +
        '<span class="avatar">' + HO.esc(HO.initials(name)) + "</span>" +
        "<div><div class=\"you-name\">" + HO.esc(name) + "</div>" +
        '<div class="you-sub">' + HO.t("you.since") + " " + HO.esc(HO.bothDates(since, HO.lang)) + "</div></div>" +
      "</div>" +
      (rows.length
        ? '<div class="grid">' + HO.gridHtml(rows) + "</div>"
        : '<div class="empty"><p>' + HO.t("seller.none") + "</p></div>");
  };
})(window.HO);
