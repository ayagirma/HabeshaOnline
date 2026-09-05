/* ── Post / edit an ad ─────────────────────────────────────────────
   One form, a live preview of the card the ad will become, and the plan
   choice. Free ads publish straight away; paid plans hand off to
   checkout and publish when that returns.                             */

(function (HO) {
  var p = HO.post = {};
  var DAY = 86400000;
  var MAX_POSTS_PER_DAY = 5;

  var draft = null;
  var editingId = null;

  function blank() {
    var s = HO.auth.session || {};
    return {
      cat: "sale", title: "", desc: "", price: "", unit: "total",
      place: HO.CITIES[0], contact: s.contact || "", method: s.method || "phone",
      tier: "free", photos: [], art: "g-stone", agree: false
    };
  }

  p.start = function () {
    editingId = null;
    draft = blank();
    HO.go("post");
    p.render();
  };

  p.edit = function (id) {
    var l = HO.store.get(id);
    if (!l) { HO.toast(HO.t("detail.gone")); return; }
    editingId = id;
    draft = {
      cat: l.cat, title: HO.tt(l.title), desc: HO.tt(l.desc),
      price: l.unit === "quote" ? "" : String(l.price || ""),
      unit: l.unit, place: l.place, contact: l.contact || "",
      method: l.method || "phone", tier: l.tier, photos: [], art: l.art || "g-stone",
      agree: false
    };
    HO.go("post");
    p.render();
    HO.store.getPhotos(id).then(function (list) {
      if (editingId === id) { draft.photos = list; p.render(); }
    });
  };

  p.set = function (field, value) {
    draft[field] = value;
    p.renderPreview();
    if (field === "tier" || field === "unit") p.render();
  };

  p.setTier = function (key) { draft.tier = key; p.render(); };

  /* ── photos ──────────────────────────────────────────────────── */
  p.pickPhoto = function () {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = function () {
      var file = input.files && input.files[0];
      if (!file) return;
      HO.toast(HO.t("common.saving"));
      HO.shrinkImage(file).then(function (data) {
        draft.photos.push(data);
        p.render();
      }).catch(function () {
        HO.toast(HO.t("post.tooBig"));
      });
    };
    input.click();
  };

  p.removePhoto = function (i) {
    draft.photos.splice(i, 1);
    p.render();
  };

  /* ── the record the form describes ───────────────────────────── */
  function toListing() {
    var s = HO.auth.session;
    var isQuote = draft.unit === "quote";
    return {
      id: editingId || undefined,
      cat: draft.cat,
      title: { en: draft.title.trim(), am: draft.title.trim() },
      desc:  { en: draft.desc.trim(),  am: draft.desc.trim()  },
      price: isQuote ? 0 : Number(draft.price) || 0,
      unit: draft.unit,
      place: draft.place,
      seller: s ? s.display : "",
      sellerId: s ? s.sellerId : "",
      handle: s ? s.handle : "",
      contact: draft.contact.trim(),
      method: draft.method,
      tier: draft.tier,
      art: draft.art,
      ico: HO.cat(draft.cat).ico,
      sample: false
    };
  }

  function validate() {
    var errs = {};
    if (!draft.title.trim()) errs.title = HO.t("post.errTitle");
    if (draft.unit !== "quote" && !(Number(draft.price) > 0)) errs.price = HO.t("post.errPrice");
    if (!draft.contact.trim()) errs.contact = HO.t("post.errContact");
    if (!draft.agree) errs.agree = HO.t("post.errAgree");
    return errs;
  }

  /* A blunt per-account cap on *new* posts in a rolling 24h — slows a
     script down without pretending to stop one. Editing an existing
     listing never counts against it. */
  function overPostLimit() {
    var s = HO.auth.session;
    if (!s) return false;
    var since = Date.now() - DAY;
    return HO.store.mine(s.sellerId).filter(function (l) {
      return l.createdAt >= since;
    }).length >= MAX_POSTS_PER_DAY;
  }

  /* ── publish ─────────────────────────────────────────────────── */
  p.submit = function (ev) {
    ev.preventDefault();
    var errs = validate();
    p.render(errs);
    if (Object.keys(errs).length) return false;

    if (!editingId && overPostLimit()) {
      HO.toast(HO.t("post.rateLimited"));
      return false;
    }

    var rec = toListing();
    var tier = HO.tier(draft.tier);

    if (!editingId && tier.usd > 0) {
      HO.checkout.begin(rec, draft.photos.slice(), tier.key);
      return false;
    }
    p.commit(rec, draft.photos.slice());
    return false;
  };

  /* Write it, then show the seller what buyers will see. */
  p.commit = function (rec, photos) {
    var first = photos && photos[0];
    var thumbStep = first ? HO.makeThumb(first).catch(function () { return null; })
                          : Promise.resolve(null);

    return thumbStep.then(function (thumb) {
      if (thumb) rec.thumb = thumb;
      if (editingId) {
        var patch = Object.assign({}, rec);
        delete patch.id;
        if (!thumb && (!photos || !photos.length)) patch.thumb = null;
        return HO.store.updateListing(editingId, patch, photos)
          .then(function () { return editingId; });
      }
      return HO.store.addListing(rec, photos).then(function (saved) { return saved.id; });
    }).then(function (id) {
      HO.toast(HO.t(editingId ? "post.updated" : "post.published"));
      editingId = null;
      draft = blank();
      HO.detail.open(id);
    }).catch(function (e) {
      HO.toast(HO.errText(e));
    });
  };

  /* ── rendering ───────────────────────────────────────────────── */
  p.renderPreview = function () {
    var box = document.getElementById("previewBox");
    if (!box) return;
    var l = toListing();
    l.id = "preview";
    l.createdAt = Date.now();
    l.thumb = draft.photos[0] || null;
    if (!l.title.en) l.title = { en: HO.t("post.titlePh"), am: HO.t("post.titlePh") };
    box.innerHTML = HO.cardHtml(l);
  };

  function field(id, labelKey, inner, err) {
    return '<div class="field' + (err ? " bad" : "") + '">' +
      '<label for="' + id + '">' + HO.t(labelKey) + "</label>" + inner +
      (err ? '<span class="err">' + HO.esc(err) + "</span>" : "") + "</div>";
  }

  p.render = function (errs) {
    errs = errs || {};
    var body = document.getElementById("postBody");
    if (!body) return;

    if (!HO.auth.isSignedIn()) {
      body.innerHTML =
        '<div class="auth-wrap"><div class="panel">' +
          "<h2>" + HO.t("post.needAuth") + "</h2>" +
          '<p class="block-sub" style="margin-top:8px">' + HO.t("post.needAuthB") + "</p>" +
          '<button class="btn btn-accent btn-wide btn-lg" style="margin-top:16px" ' +
          'onclick="HO.go(\'you\')">' + HO.t("auth.signin") + "</button>" +
        "</div></div>";
      return;
    }
    if (!draft) draft = blank();
    var tier = HO.tier(draft.tier);

    body.innerHTML =
      '<div class="block-head"><h2>' + HO.t(editingId ? "post.editTitle" : "post.title") + "</h2></div>" +
      '<form class="post-wrap" onsubmit="return HO.post.submit(event)">' +
        '<div class="form-stack">' +

          '<section class="form-sec"><h3>' + HO.t("post.sec1") + "</h3>" +
            '<div class="field"><span class="lbl">' + HO.t("post.cat") + "</span>" +
              '<div class="chips">' + HO.CATS.map(function (c) {
                return '<button type="button" class="pick" aria-pressed="' +
                  (draft.cat === c.key ? "true" : "false") + '" ' +
                  "onclick=\"HO.post.set('cat','" + c.key + "')\">" +
                  c.ico + " " + HO.esc(HO.tt(c)) + "</button>";
              }).join("") + "</div></div>" +
            field("f_title", "post.adTitle",
              '<input id="f_title" maxlength="90" value="' + HO.esc(draft.title) +
              '" placeholder="' + HO.esc(HO.t("post.titlePh")) +
              '" oninput="HO.post.set(\'title\', this.value)" />', errs.title) +
            field("f_desc", "post.desc",
              '<textarea id="f_desc" maxlength="1200" placeholder="' + HO.esc(HO.t("post.descPh")) +
              '" oninput="HO.post.set(\'desc\', this.value)">' + HO.esc(draft.desc) + "</textarea>") +
          "</section>" +

          '<section class="form-sec"><h3>' + HO.t("post.sec2") + "</h3>" +
            '<p class="hint" style="color:var(--muted);font-size:13px">' +
              HO.t("post.photoHint", { n: tier.photos }) + "</p>" +
            '<div class="photo-grid">' +
              draft.photos.map(function (src, i) {
                return '<div class="photo-slot"><img src="' + HO.esc(src) + '" alt="" />' +
                  '<button type="button" class="rm" aria-label="' + HO.t("common.delete") +
                  '" onclick="HO.post.removePhoto(' + i + ')">✕</button></div>';
              }).join("") +
              (draft.photos.length < tier.photos
                ? '<button type="button" class="photo-add" onclick="HO.post.pickPhoto()">' +
                  '<span class="plus" aria-hidden="true">+</span><span>' +
                  HO.t("post.addPhoto") + "</span></button>"
                : "") +
            "</div>" +
          "</section>" +

          '<section class="form-sec"><h3>' + HO.t("post.sec3") + "</h3>" +
            '<div class="row2">' +
              field("f_price", "post.price",
                '<input id="f_price" type="number" min="0" step="1" inputmode="numeric" value="' +
                HO.esc(draft.price) + '" placeholder="' + HO.esc(HO.t("post.pricePh")) +
                '" oninput="HO.post.set(\'price\', this.value)"' +
                (draft.unit === "quote" ? " disabled" : "") + " />", errs.price) +
              field("f_unit", "post.priceUnit",
                '<select id="f_unit" onchange="HO.post.set(\'unit\', this.value)">' +
                HO.UNITS.map(function (u) {
                  return '<option value="' + u.key + '"' + (draft.unit === u.key ? " selected" : "") +
                    ">" + HO.esc(HO.tt(u)) + "</option>";
                }).join("") + "</select>") +
            "</div>" +
            field("f_place", "post.city",
              '<select id="f_place" onchange="HO.post.set(\'place\', this.value)">' +
              HO.CITIES.map(function (c) {
                return '<option' + (draft.place === c ? " selected" : "") + ">" + HO.esc(c) + "</option>";
              }).join("") + "</select>") +
          "</section>" +

          '<section class="form-sec"><h3>' + HO.t("post.sec4") + "</h3>" +
            '<div class="row2">' +
              field("f_method", "post.method",
                '<select id="f_method" onchange="HO.post.set(\'method\', this.value)">' +
                '<option value="phone"' + (draft.method === "phone" ? " selected" : "") + ">" +
                  (HO.lang === "am" ? "ስልክ" : "Phone") + "</option>" +
                '<option value="email"' + (draft.method === "email" ? " selected" : "") + ">" +
                  (HO.lang === "am" ? "ኢሜይል" : "Email") + "</option></select>") +
              field("f_contact", "post.contact",
                '<input id="f_contact" maxlength="80" value="' + HO.esc(draft.contact) +
                '" oninput="HO.post.set(\'contact\', this.value)" />', errs.contact) +
            "</div>" +
            '<p class="note note-warn">' + HO.t("auth.contactHint") + "</p>" +
          "</section>" +

          '<section class="form-sec"><h3>' + HO.t("post.sec5") + "</h3>" +
            '<div class="chips">' + HO.TIERS.map(function (t) {
              return '<button type="button" class="pick" aria-pressed="' +
                (draft.tier === t.key ? "true" : "false") + '" ' +
                "onclick=\"HO.post.setTier('" + t.key + "')\">" +
                HO.esc(HO.tt(t.name)) + " · " + (t.usd ? HO.money(t.usd) : "$0") +
                "</button>";
            }).join("") + "</div>" +
          "</section>" +

          '<div class="field' + (errs.agree ? " bad" : "") + '" style="margin-top:4px">' +
            '<label style="display:flex;gap:10px;align-items:flex-start;font-weight:400;cursor:pointer">' +
              '<input type="checkbox" id="f_agree" style="margin-top:3px"' +
                (draft.agree ? " checked" : "") +
                ' onchange="HO.post.set(\'agree\', this.checked)" />' +
              "<span>" + HO.t("post.agree") + "</span>" +
            "</label>" +
            (errs.agree ? '<span class="err">' + HO.esc(errs.agree) + "</span>" : "") +
          "</div>" +

          '<button class="btn btn-accent btn-lg" type="submit">' +
            HO.t(editingId ? "post.saveEdit" : (tier.usd > 0 ? "post.toPay" : "post.publish")) +
          "</button>" +
        "</div>" +

        '<aside class="preview-card">' +
          '<span class="lbl">' + HO.t("post.preview") + "</span>" +
          '<div id="previewBox"></div>' +
        "</aside>" +
      "</form>";

    p.renderPreview();
  };
})(window.HO);
