/* ── Accounts ──────────────────────────────────────────────────────
   What this does: a password is never stored and never leaves the
   device in readable form. It is stretched with PBKDF2-SHA-256 over
   210,000 rounds against 16 random bytes of salt, and only the derived
   key and the salt are written to the store. Sign-in repeats the
   derivation and compares the result in constant time.

   What this does NOT do: there is no server here. The account records
   live in the same store the page shares with its viewers, so a
   determined reader can take a copy and guess against it offline. The
   iteration count makes that expensive, not impossible. The interface
   says so where people choose a password, and nobody should reuse a
   password they use elsewhere.                                        */

(function (HO) {
  var ITERATIONS = 210000;
  var KEY_BITS   = 256;
  var SESSION_MS = 30 * 86400000;      /* 30 days */
  var SESSION_K  = "ho.session.v1";
  var LOCK_K     = "ho.lock.v1";
  var MAX_TRIES  = 5;
  var LOCK_MS    = 60000;

  var auth = HO.auth = {};
  var subtle = (window.crypto && window.crypto.subtle) || null;

  auth.available = function () { return !!subtle; };

  /* ── helpers ─────────────────────────────────────────────────── */
  function b64(bytes) {
    var s = "";
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  }
  function unb64(str) {
    var s = atob(str), out = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }
  function randomBytes(n) {
    var a = new Uint8Array(n);
    window.crypto.getRandomValues(a);
    return a;
  }
  auth.randomId = function (prefix) {
    return prefix + b64(randomBytes(9)).replace(/[^A-Za-z0-9]/g, "").slice(0, 12);
  };

  /* Compare without leaking where the difference is. */
  function sameDigest(a, b) {
    if (a.length !== b.length) return false;
    var diff = 0;
    for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
  }

  /* PBKDF2-SHA-256. Returns the derived key, base64. */
  auth.derive = function (password, saltB64, iterations) {
    var salt = unb64(saltB64);
    return subtle.importKey("raw", new TextEncoder().encode(password),
                            { name: "PBKDF2" }, false, ["deriveBits"])
      .then(function (key) {
        return subtle.deriveBits(
          { name: "PBKDF2", salt: salt, iterations: iterations, hash: "SHA-256" },
          key, KEY_BITS);
      })
      .then(function (bits) { return b64(new Uint8Array(bits)); });
  };

  /* ── validation ──────────────────────────────────────────────── */
  var HANDLE_RE = /^[a-z0-9][a-z0-9._-]{2,23}$/;

  auth.normalizeHandle = function (h) {
    return String(h || "").trim().toLowerCase();
  };
  auth.validHandle = function (h) { return HANDLE_RE.test(h); };

  /* A blunt strength read: length first, then variety, minus the
     obvious. Returns 0-4 and the reason it is not higher. */
  var WEAK = ["password", "12345678", "qwerty", "habesha", "letmein",
              "welcome", "iloveyou", "admin123", "abebe", "ethiopia",
              "1234567890", "00000000", "colorado"];

  auth.strength = function (pw) {
    pw = pw || "";
    if (pw.length < 5) return { score: 0, ok: false, why: "auth.shortPw" };
    var low = pw.toLowerCase();
    for (var i = 0; i < WEAK.length; i++) {
      if (low.indexOf(WEAK[i]) !== -1 && pw.length < 16) {
        return { score: 1, ok: false, why: "auth.weakPw" };
      }
    }
    var classes = 0;
    if (/[a-z]/.test(pw)) classes++;
    if (/[A-Z]/.test(pw)) classes++;
    if (/[0-9]/.test(pw)) classes++;
    if (/[^A-Za-z0-9]/.test(pw)) classes++;
    var uniq = new Set(pw.split("")).size;

    var score = 1;
    if (pw.length >= 12 && (classes >= 2 || uniq >= 9)) score = 2;
    if (pw.length >= 14 && (classes >= 3 || uniq >= 12)) score = 3;
    if (pw.length >= 18 || (pw.length >= 15 && classes >= 4)) score = 4;
    return { score: score, ok: score >= 1, why: score < 1 ? "auth.weakPw" : null };
  };

  /* ── lockout ─────────────────────────────────────────────────── */
  function lockState() {
    try { return JSON.parse(localStorage.getItem(LOCK_K)) || { fails: 0, until: 0 }; }
    catch (e) { return { fails: 0, until: 0 }; }
  }
  function writeLock(v) {
    try { localStorage.setItem(LOCK_K, JSON.stringify(v)); } catch (e) {}
  }
  auth.lockedFor = function () {
    var l = lockState();
    return Math.max(0, Math.ceil((l.until - Date.now()) / 1000));
  };
  function noteFail() {
    var l = lockState();
    l.fails++;
    if (l.fails >= MAX_TRIES) { l.until = Date.now() + LOCK_MS; l.fails = 0; }
    writeLock(l);
  }
  function clearFails() { writeLock({ fails: 0, until: 0 }); }

  /* ── session ─────────────────────────────────────────────────── */
  auth.session = null;

  function persistSession(s) {
    auth.session = s;
    try { localStorage.setItem(SESSION_K, JSON.stringify(s)); } catch (e) {}
  }

  auth.restore = function () {
    var raw;
    try { raw = localStorage.getItem(SESSION_K); } catch (e) { return null; }
    if (!raw) return null;
    var s;
    try { s = JSON.parse(raw); } catch (e) { return null; }
    if (!s || !s.handle || !s.exp || s.exp < Date.now()) { auth.signOut(); return null; }
    auth.session = s;
    return s;
  };

  auth.signOut = function () {
    auth.session = null;
    try { localStorage.removeItem(SESSION_K); } catch (e) {}
  };

  auth.isSignedIn = function () { return !!auth.session; };

  /* ── sign up ─────────────────────────────────────────────────── */
  auth.signUp = function (input) {
    var handle = auth.normalizeHandle(input.handle);
    if (!auth.validHandle(handle)) return Promise.reject({ key: "auth.badHandle" });
    var st = auth.strength(input.password);
    if (!st.ok) return Promise.reject({ key: st.why });
    if (input.password !== input.password2) return Promise.reject({ key: "auth.mismatch" });
    if (!subtle) return Promise.reject({ key: "auth.noCrypto" });

    var saltB64 = b64(randomBytes(16));

    return HO.store.claimHandle(handle).then(function (won) {
      if (!won) throw { key: "auth.taken" };
      return auth.derive(input.password, saltB64, ITERATIONS);
    }).then(function (hash) {
      var rec = {
        handle: handle,
        sellerId: auth.randomId("u_"),
        display: (input.display || "").trim() || handle,
        contact: (input.contact || "").trim(),
        method: input.method === "email" ? "email" : "phone",
        kdf: "PBKDF2-SHA256",
        iterations: ITERATIONS,
        salt: saltB64,
        hash: hash,
        createdAt: Date.now()
      };
      return HO.store.putAccount(rec).then(function () { return rec; });
    }).then(function (rec) {
      clearFails();
      persistSession({
        handle: rec.handle, sellerId: rec.sellerId, display: rec.display,
        contact: rec.contact, method: rec.method, createdAt: rec.createdAt,
        token: auth.randomId("t_"), exp: Date.now() + SESSION_MS
      });
      return auth.session;
    });
  };

  /* ── sign in ─────────────────────────────────────────────────── */
  auth.signIn = function (handleRaw, password) {
    var wait = auth.lockedFor();
    if (wait > 0) return Promise.reject({ key: "auth.locked", vars: { s: wait } });
    if (!subtle) return Promise.reject({ key: "auth.noCrypto" });

    var handle = auth.normalizeHandle(handleRaw);
    return HO.store.getAccount(handle).then(function (rec) {
      /* Derive either way, so a missing handle costs the same time as a
         wrong password and tells an attacker nothing. */
      var salt = rec ? rec.salt : b64(randomBytes(16));
      var iters = rec ? (rec.iterations || ITERATIONS) : ITERATIONS;
      return auth.derive(password, salt, iters).then(function (hash) {
        if (!rec || !sameDigest(hash, rec.hash)) {
          noteFail();
          throw { key: "auth.badCreds" };
        }
        clearFails();
        persistSession({
          handle: rec.handle, sellerId: rec.sellerId, display: rec.display,
          contact: rec.contact, method: rec.method, createdAt: rec.createdAt,
          token: auth.randomId("t_"), exp: Date.now() + SESSION_MS
        });
        return auth.session;
      });
    });
  };

  /* Update the profile fields a signed-in seller can change. */
  auth.updateProfile = function (patch) {
    if (!auth.session) return Promise.reject({ key: "auth.badCreds" });
    var s = auth.session;
    return HO.store.getAccount(s.handle).then(function (rec) {
      if (!rec) throw { key: "auth.badCreds" };
      rec.display = (patch.display || rec.display).trim();
      rec.contact = (patch.contact !== undefined ? patch.contact : rec.contact).trim();
      rec.method  = patch.method === "email" ? "email" : (patch.method === "phone" ? "phone" : rec.method);
      return HO.store.putAccount(rec).then(function () {
        persistSession(Object.assign({}, s, {
          display: rec.display, contact: rec.contact, method: rec.method
        }));
        return auth.session;
      });
    });
  };

  /* Re-derive under a fresh salt; the old password must still check out. */
  auth.changePassword = function (current, next, next2) {
    if (!auth.session) return Promise.reject({ key: "auth.badCreds" });
    var st = auth.strength(next);
    if (!st.ok) return Promise.reject({ key: st.why });
    if (next !== next2) return Promise.reject({ key: "auth.mismatch" });

    var handle = auth.session.handle;
    return HO.store.getAccount(handle).then(function (rec) {
      if (!rec) throw { key: "auth.badCreds" };
      return auth.derive(current, rec.salt, rec.iterations || ITERATIONS)
        .then(function (hash) {
          if (!sameDigest(hash, rec.hash)) { noteFail(); throw { key: "auth.badCreds" }; }
          var salt = b64(randomBytes(16));
          return auth.derive(next, salt, ITERATIONS).then(function (h2) {
            rec.salt = salt; rec.hash = h2; rec.iterations = ITERATIONS;
            rec.passwordChangedAt = Date.now();
            return HO.store.putAccount(rec);
          });
        });
    });
  };
})(window.HO);
