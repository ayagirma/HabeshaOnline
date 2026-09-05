/* ── Account, listings, saved, inbox ───────────────────────────────
   Sign-in and sign-up, the seller's own listings, their saved list and
   the messages buyers have sent them.                                 */

(function (HO) {
  var a = HO.account = {};
  var mode = "signin";
  var busy = false;
  var stopInbox = null;
  var unread = 0;

  /* ── auth form ───────────────────────────────────────────────── */
  a.setMode = function (m) { mode = m; a.render(); };

  a.onPw = function (el) {
    var st = HO.auth.strength(el.value);
    var bar = document.getElementById("pwBar");
    var txt = document.getElementById("pwTxt");
    if (!bar || !txt) return;
    var pct = [8, 30, 58, 82, 100][st.score];
    var color = ["var(--bad)", "var(--bad)", "var(--warn)", "var(--ok)", "var(--ok)"][st.score];
    bar.style.width = pct + "%";
    bar.style.background = color;
    txt.textContent = HO.t("auth.strength" + st.score);
  };

  a.togglePw = function (btn, id) {
    var input = document.getElementById(id);
    var show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.textContent = HO.t(show ? "auth.hide" : "auth.show");
  };

  a.submitAuth = function (ev) {
    ev.preventDefault();
    if (busy) return false;
    var form = ev.target;
    var err = document.getElementById("authErr");
    err.hidden = true;

    var btn = document.getElementById("authBtn");
    busy = true;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>' +
      HO.t(mode === "signup" ? "auth.hashing" : "auth.working");

    var done = function (session) {
      busy = false;
      /* The password never outlives the submit. */
      form.reset();
      HO.toast(mode === "signup"
        ? HO.t("auth.created")
        : HO.t("auth.welcome", { name: session.display }));
      mode = "signin";
      a.render();
      HO.renderNav();
      a.watchInbox();
      HO.browse.render();
    };
    var fail = function (e) {
      busy = false;
      btn.disabled = false;
      btn.textContent = HO.t(mode === "signup" ? "auth.signup" : "auth.signin");
      err.textContent = HO.errText(e);
      err.hidden = false;
    };

    if (mode === "signup") {
      HO.auth.signUp({
        handle: form.handle_.value,
        display: form.display_.value,
        contact: form.contact_.value,
        method: form.method_.value,
        password: form.pw_.value,
        password2: form.pw2_.value
      }).then(done).catch(fail);
    } else {
      HO.auth.signIn(form.handle_.value, form.pw_.value).then(done).catch(fail);
    }
    return false;
  };

  function authForm() {
    var signup = mode === "signup";
    if (!HO.auth.available()) {
      return '<div class="panel"><p class="note note-bad">' +
        "This browser can't hash a password securely here, so accounts are switched off. " +
        "Open the page over https and try again.</p></div>";
    }
    return '<div class="auth-wrap">' +
      '<div class="auth-tabs">' +
        '<button class="pick" aria-pressed="' + (!signup ? "true" : "false") +
          '" onclick="HO.account.setMode(\'signin\')">' + HO.t("auth.signin") + "</button>" +
        '<button class="pick" aria-pressed="' + (signup ? "true" : "false") +
          '" onclick="HO.account.setMode(\'signup\')">' + HO.t("auth.signup") + "</button>" +
      "</div>" +
      '<form class="panel" onsubmit="return HO.account.submitAuth(event)" style="display:grid;gap:16px">' +
        '<div class="field"><label for="i_handle">' + HO.t("auth.handle") + "</label>" +
          '<input id="i_handle" name="handle_" required maxlength="24" autocomplete="username" ' +
            'autocapitalize="none" spellcheck="false" />' +
          (signup ? '<span class="hint">' + HO.t("auth.handleHint") + "</span>" : "") +
        "</div>" +

        (signup ?
          '<div class="field"><label for="i_display">' + HO.t("auth.display") + "</label>" +
            '<input id="i_display" name="display_" maxlength="40" autocomplete="nickname" /></div>' +
          '<div class="row2">' +
            '<div class="field"><label for="i_method">' + HO.t("post.method") + "</label>" +
              '<select id="i_method" name="method_">' +
                '<option value="phone">' + (HO.lang === "am" ? "ስልክ" : "Phone") + "</option>" +
                '<option value="email">' + (HO.lang === "am" ? "ኢሜይል" : "Email") + "</option>" +
              "</select></div>" +
            '<div class="field"><label for="i_contact">' + HO.t("auth.contact") + "</label>" +
              '<input id="i_contact" name="contact_" maxlength="80" /></div>' +
          "</div>" : "") +

        '<div class="field"><label for="i_pw">' + HO.t("auth.password") + "</label>" +
          '<input id="i_pw" name="pw_" type="password" required minlength="' + (signup ? 5 : 1) + '" ' +
            'autocomplete="' + (signup ? "new-password" : "current-password") + '" ' +
            (signup ? 'oninput="HO.account.onPw(this)" ' : "") + "/>" +
          '<button type="button" class="link-btn" style="justify-self:start" ' +
            'onclick="HO.account.togglePw(this, \'i_pw\')">' + HO.t("auth.show") + "</button>" +
          (signup ?
            '<div class="strength"><div class="strength-bar"><i id="pwBar"></i></div>' +
            '<span class="strength-txt" id="pwTxt">' + HO.t("auth.strength0") + "</span></div>" : "") +
        "</div>" +

        (signup ?
          '<div class="field"><label for="i_pw2">' + HO.t("auth.password2") + "</label>" +
            '<input id="i_pw2" name="pw2_" type="password" required minlength="5" ' +
              'autocomplete="new-password" /></div>' : "") +

        '<p class="note note-bad" id="authErr" hidden></p>' +
        '<button class="btn btn-accent btn-wide btn-lg" id="authBtn" type="submit">' +
          HO.t(signup ? "auth.signup" : "auth.signin") + "</button>" +
      "</form>" +

      '<div class="panel"><h3>' + HO.t("auth.secTitle") + "</h3>" +
        '<p style="margin-top:8px;font-size:13.5px;color:var(--ink-2)">' + HO.t("auth.secBody") + "</p>" +
        '<p class="note note-warn" style="margin-top:12px">' + HO.t("auth.secLimit") + "</p>" +
      "</div>" +
    "</div>";
  }

  /* ── signed-in view ──────────────────────────────────────────── */
  a.signOut = function () {
    HO.auth.signOut();
    if (stopInbox) { stopInbox(); stopInbox = null; }
    unread = 0;
    a.updateDot();
    a.render();
    HO.renderNav();
    HO.browse.render();
    HO.toast(HO.t("auth.signout"));
  };

  a.saveProfile = function (ev) {
    ev.preventDefault();
    var f = ev.target;
    HO.auth.updateProfile({
      display: f.display_.value, contact: f.contact_.value, method: f.method_.value
    }).then(function () {
      HO.toast(HO.t("post.updated"));
      a.render();
    }).catch(function (e) { HO.toast(HO.errText(e)); });
    return false;
  };

  a.changePw = function (ev) {
    ev.preventDefault();
    var f = ev.target;
    var btn = f.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>' + HO.t("auth.hashing");
    HO.auth.changePassword(f.cur_.value, f.new_.value, f.new2_.value)
      .then(function () { f.reset(); HO.toast(HO.t("post.updated")); })
      .catch(function (e) { HO.toast(HO.errText(e)); })
      .then(function () {
        btn.disabled = false;
        btn.textContent = HO.t("common.save");
      });
    return false;
  };

  a.del = function (id) {
    if (!window.confirm(HO.t("you.confirmDel"))) return;
    HO.store.removeListing(id).then(function () {
      HO.toast(HO.t("you.deleted"));
      a.render();
    }).catch(function (e) { HO.toast(HO.errText(e)); });
  };

  a.renew = function (id) {
    var l = HO.store.get(id);
    if (!l) return;
    var days = HO.tier(l.tier).days;
    HO.store.updateListing(id, { expiresAt: Date.now() + days * 86400000 })
      .then(function () { HO.toast(HO.t("you.renewed")); a.render(); })
      .catch(function (e) { HO.toast(HO.errText(e)); });
  };

  function mineRow(l) {
    var live = HO.store.isLive(l);
    var art = l.thumb
      ? '<img src="' + HO.esc(l.thumb) + '" alt="" />'
      : '<span aria-hidden="true">' + HO.esc(l.ico || HO.cat(l.cat).ico) + "</span>";
    return '<div class="mine">' +
      '<div class="mini ' + HO.esc(HO.artFor(l)) + '">' + art + "</div>" +
      '<div class="mine-body">' +
        '<button class="mine-title" style="background:none;border:0;padding:0;text-align:left" ' +
          "onclick=\"HO.detail.open('" + HO.esc(l.id) + "')\">" + HO.esc(HO.tt(l.title)) + "</button>" +
        '<div class="mine-meta">' +
          '<span class="badge ' + (live ? "badge-live" : "badge-expired") + '">' +
            HO.t(live ? "you.live" : "you.expired") + "</span>" +
          "<span>" + HO.esc(HO.priceLabel(l)) + "</span>" +
          "<span>" + HO.esc(HO.tt(HO.tier(l.tier).name)) + "</span>" +
          "<span>" + HO.esc(HO.bothDates(l.createdAt, HO.lang)) + "</span>" +
        "</div>" +
      "</div>" +
      '<div class="mine-acts">' +
        (live ? "" : '<button class="btn btn-ghost" onclick="HO.account.renew(\'' +
                     HO.esc(l.id) + '\')">' + HO.t("you.renew") + "</button>") +
        '<button class="btn btn-ghost" onclick="HO.post.edit(\'' + HO.esc(l.id) + '\')">' +
          HO.t("common.edit") + "</button>" +
        '<button class="btn btn-danger" onclick="HO.account.del(\'' + HO.esc(l.id) + '\')">' +
          HO.t("common.delete") + "</button>" +
      "</div>" +
    "</div>";
  }

  a.render = function () {
    var body = document.getElementById("youBody");
    if (!body) return;

    var s = HO.auth.session;
    if (!s) {
      body.innerHTML = '<div class="block-head center"><h2>' + HO.t("you.title") + "</h2></div>" + authForm();
      return;
    }

    var mine = HO.store.mine(s.sellerId);
    body.innerHTML =
      '<div class="you-head">' +
        '<span class="avatar">' + HO.esc(HO.initials(s.display)) + "</span>" +
        "<div><div class=\"you-name\">" + HO.esc(s.display) + "</div>" +
          '<div class="you-sub">@' + HO.esc(s.handle) + " · " + HO.t("you.since") + " " +
          HO.esc(HO.bothDates(s.createdAt || Date.now(), HO.lang)) + "</div></div>" +
        '<div class="you-actions">' +
          '<button class="btn btn-accent" onclick="HO.post.start()">' + HO.t("nav.post") + "</button>" +
          '<button class="btn btn-ghost" onclick="HO.account.signOut()">' + HO.t("auth.signout") + "</button>" +
        "</div>" +
      "</div>" +

      '<div class="block-head"><h2>' + HO.t("you.listings") + '</h2><span class="count">' +
        mine.length + "</span></div>" +
      (mine.length
        ? '<div class="mine-list">' + mine.map(mineRow).join("") + "</div>"
        : '<div class="empty"><p>' + HO.t("you.none") + "</p>" +
          '<button class="btn btn-accent" onclick="HO.post.start()">' + HO.t("you.postFirst") + "</button></div>") +

      '<div class="band-rule" aria-hidden="true"></div>' +

      '<div class="panel"><h3>' + HO.t("you.title") + "</h3>" +
        '<form onsubmit="return HO.account.saveProfile(event)" style="display:grid;gap:16px;margin-top:14px">' +
          '<div class="field"><label for="p_display">' + HO.t("auth.display") + "</label>" +
            '<input id="p_display" name="display_" maxlength="40" value="' + HO.esc(s.display) + '" /></div>' +
          '<div class="row2">' +
            '<div class="field"><label for="p_method">' + HO.t("post.method") + "</label>" +
              '<select id="p_method" name="method_">' +
                '<option value="phone"' + (s.method === "phone" ? " selected" : "") + ">" +
                  (HO.lang === "am" ? "ስልክ" : "Phone") + "</option>" +
                '<option value="email"' + (s.method === "email" ? " selected" : "") + ">" +
                  (HO.lang === "am" ? "ኢሜይል" : "Email") + "</option></select></div>" +
            '<div class="field"><label for="p_contact">' + HO.t("auth.contact") + "</label>" +
              '<input id="p_contact" name="contact_" maxlength="80" value="' + HO.esc(s.contact || "") + '" />' +
              '<span class="hint">' + HO.t("auth.contactHint") + "</span></div>" +
          "</div>" +
          '<button class="btn btn-ink" type="submit" style="justify-self:start">' + HO.t("common.save") + "</button>" +
        "</form>" +
      "</div>" +

      '<div class="panel"><h3>' + HO.t("auth.password") + "</h3>" +
        '<form onsubmit="return HO.account.changePw(event)" style="display:grid;gap:16px;margin-top:14px" ' +
          'autocomplete="off">' +
          '<div class="field"><label for="c_cur">' + HO.t("auth.password") + "</label>" +
            '<input id="c_cur" name="cur_" type="password" required autocomplete="current-password" /></div>' +
          '<div class="row2">' +
            '<div class="field"><label for="c_new">' + HO.t("auth.password") + " ★</label>" +
              '<input id="c_new" name="new_" type="password" required minlength="5" ' +
                'autocomplete="new-password" /></div>' +
            '<div class="field"><label for="c_new2">' + HO.t("auth.password2") + "</label>" +
              '<input id="c_new2" name="new2_" type="password" required minlength="5" ' +
                'autocomplete="new-password" /></div>' +
          "</div>" +
          '<button class="btn btn-ink" type="submit" style="justify-self:start">' + HO.t("common.save") + "</button>" +
        "</form>" +
        '<p class="note note-warn" style="margin-top:14px">' + HO.t("auth.secLimit") + "</p>" +
      "</div>";
  };

  /* ── saved ───────────────────────────────────────────────────── */
  a.renderSaved = function () {
    var grid = document.getElementById("savedGrid");
    if (!grid) return;
    var ids = HO.saved();
    var rows = HO.store.listings().filter(function (l) { return ids.indexOf(l.id) !== -1; });
    grid.innerHTML = HO.gridHtml(rows);
    document.getElementById("savedEmpty").hidden = rows.length !== 0;
  };

  /* ── inbox ───────────────────────────────────────────────────── */
  a.watchInbox = function () {
    if (stopInbox) { stopInbox(); stopInbox = null; }
    var s = HO.auth.session;
    if (!s) return;
    stopInbox = HO.store.onInquiries(s.sellerId, function (rows) {
      unread = rows.filter(function (m) { return !m.read; }).length;
      a.updateDot();
      if (HO.current === "inbox") a.paintInbox(rows);
    });
  };

  a.updateDot = function () {
    var dot = document.getElementById("inboxDot");
    if (dot) dot.hidden = unread === 0;
  };

  a.paintInbox = function (rows) {
    var body = document.getElementById("inboxBody");
    if (!body) return;
    if (!rows.length) {
      body.innerHTML = '<div class="empty"><p>' + HO.t("inbox.empty") + "</p></div>";
      return;
    }
    body.innerHTML = '<div class="msg-list">' + rows.map(function (m) {
      return '<article class="msg' + (m.read ? "" : " unread") + '">' +
        '<div class="msg-head">' +
          '<span class="msg-from">' + HO.esc(m.fromName) +
            (m.read ? "" : ' <span class="badge badge-plan">' + HO.t("inbox.new") + "</span>") + "</span>" +
          '<span class="msg-on">' + HO.esc(HO.bothDates(m.createdAt, HO.lang)) + "</span>" +
        "</div>" +
        '<p class="msg-body">' + HO.esc(m.body) + "</p>" +
        '<p class="msg-contact">' + HO.t("inbox.reply") + ": <b>" + HO.esc(m.contact) + "</b></p>" +
        '<p class="msg-contact">' + HO.t("inbox.about") + ": " +
          '<button class="link-btn" onclick="HO.detail.open(\'' + HO.esc(m.listingId) + '\')">' +
          HO.esc(m.listingTitle) + "</button></p>" +
        (m.read ? "" : '<button class="btn btn-ghost" style="justify-self:start" ' +
          'onclick="HO.account.markRead(\'' + HO.esc(m.id) + '\')">' + HO.t("common.close") + "</button>") +
      "</article>";
    }).join("") + "</div>";
  };

  a.markRead = function (id) {
    HO.store.markRead(id);
  };

  a.renderInbox = function () {
    var body = document.getElementById("inboxBody");
    if (!body) return;
    if (!HO.auth.isSignedIn()) {
      body.innerHTML = '<div class="empty"><p>' + HO.t("inbox.needAuth") + "</p>" +
        '<button class="btn btn-accent" onclick="HO.go(\'you\')">' + HO.t("auth.signin") + "</button></div>";
      return;
    }
    body.innerHTML = '<div class="empty"><p>' + HO.t("common.loading") + "</p></div>";
    a.watchInbox();
  };
})(window.HO);
