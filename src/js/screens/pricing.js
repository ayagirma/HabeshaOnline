/* ── Pricing and checkout ──────────────────────────────────────────
   The checkout is a demonstration: it takes no card, sends nothing, and
   says so in the form itself rather than in fine print underneath.    */

(function (HO) {
  var pr = HO.pricing = {};
  var co = HO.checkout = {};

  pr.render = function () {
    document.getElementById("tiers").innerHTML = HO.TIERS.map(function (t) {
      return '<div class="tier' + (t.pop ? " pop" : "") + '">' +
        (t.pop ? '<span class="badge badge-plan">' + HO.t("pricing.pop") + "</span>" : "") +
        '<div class="tier-name">' + HO.esc(HO.tt(t.name)) + "</div>" +
        '<div class="tier-amt">' + HO.money(t.usd) +
          (t.usd ? " <small>/ " + (HO.lang === "am" ? "ማስታወቂያ" : "ad") + "</small>" : "") + "</div>" +
        '<div class="block-sub">' + HO.t("pricing.runs") + " " + t.days +
          (HO.lang === "am" ? " ቀናት" : " days") + "</div>" +
        "<ul>" + t.feats.map(function (f) {
          return '<li class="' + (f.ok ? "" : "no") + '"><span class="mk" aria-hidden="true">' +
            (f.ok ? "✓" : "—") + "</span><span>" + HO.esc(HO.tt(f)) + "</span></li>";
        }).join("") + "</ul>" +
        '<button class="btn ' + (t.pop ? "btn-accent" : "btn-ghost") + '" ' +
          "onclick=\"HO.pricing.choose('" + t.key + "')\">" + HO.t("pricing.pick") + "</button>" +
      "</div>";
    }).join("");
  };

  /* Picking a plan on the pricing page starts an ad on that plan. */
  pr.choose = function (key) {
    HO.post.start();
    HO.post.setTier(key);
  };

  /* ── checkout ────────────────────────────────────────────────── */
  var pending = null;

  co.begin = function (rec, photos, tierKey) {
    pending = { rec: rec, photos: photos, tier: HO.tier(tierKey) };
    HO.go("checkout");
    co.render();
  };

  co.pay = function (ev) {
    ev.preventDefault();
    if (!pending) return false;
    var btn = document.getElementById("payBtn");
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>' + HO.t("common.saving");

    /* Nothing is sent anywhere; the pause is only so the state change
       reads as a step rather than a jump. */
    setTimeout(function () {
      var job = pending;
      pending = null;
      HO.post.commit(job.rec, job.photos).then(function () {
        HO.toast(HO.t("checkout.done"));
      });
    }, 700);
    return false;
  };

  co.render = function () {
    var body = document.getElementById("checkoutBody");
    if (!body) return;
    if (!pending) {
      body.innerHTML = '<div class="empty"><p>' + HO.t("detail.gone") + "</p>" +
        '<button class="btn btn-ghost" onclick="HO.go(\'pricing\')">' + HO.t("nav.pricing") + "</button></div>";
      return;
    }
    var t = pending.tier;
    body.innerHTML =
      '<div class="block-head"><h2>' + HO.t("checkout.title") + "</h2></div>" +
      '<div class="checkout">' +
        '<form class="panel" onsubmit="return HO.checkout.pay(event)" autocomplete="off">' +
          '<p class="note note-warn" style="margin-bottom:16px">' + HO.t("checkout.demo") + "</p>" +
          '<div class="field"><label for="cc">' + HO.t("checkout.card") + "</label>" +
            '<input id="cc" inputmode="numeric" maxlength="19" placeholder="4242 4242 4242 4242" required /></div>' +
          '<div class="row2" style="margin-top:16px">' +
            '<div class="field"><label for="exp">' + HO.t("checkout.exp") + "</label>" +
              '<input id="exp" maxlength="5" placeholder="09 / 29" required /></div>' +
            '<div class="field"><label for="cvc">' + HO.t("checkout.cvc") + "</label>" +
              '<input id="cvc" maxlength="4" placeholder="123" required /></div>' +
          "</div>" +
          '<div class="field" style="margin-top:16px"><label for="ccname">' + HO.t("checkout.name") + "</label>" +
            '<input id="ccname" maxlength="60" required /></div>' +
          '<button class="btn btn-accent btn-wide btn-lg" style="margin-top:20px" id="payBtn" type="submit">' +
            HO.t("checkout.pay") + " · " + HO.money(t.usd) + "</button>" +
        "</form>" +
        '<aside class="panel dl">' +
          "<h3>" + HO.esc(HO.tt(pending.rec.title)) + "</h3>" +
          '<div class="row"><span>' + HO.t("checkout.plan") + "</span><b>" + HO.esc(HO.tt(t.name)) + "</b></div>" +
          '<div class="row"><span>' + HO.t("checkout.runs") + "</span><b>" + t.days +
            (HO.lang === "am" ? " ቀናት" : " days") + "</b></div>" +
          '<div class="row total"><span>' + HO.t("checkout.total") + "</span><b>" + HO.money(t.usd) + "</b></div>" +
          "<ul style=\"list-style:none;padding:0;margin:8px 0 0;display:grid;gap:6px;font-size:13.5px\">" +
            t.feats.filter(function (f) { return f.ok; }).map(function (f) {
              return '<li><span class="mk" style="color:var(--ok)">✓</span> ' + HO.esc(HO.tt(f)) + "</li>";
            }).join("") +
          "</ul>" +
        "</aside>" +
      "</div>";
  };
})(window.HO);
