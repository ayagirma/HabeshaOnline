/* ── Storage ───────────────────────────────────────────────────────
   Two backends behind one API.

   shared — the artifact's own database, when the viewer's session
            grants it. Listings, accounts and inquiries are then real:
            everyone who opens the page sees the same board, live.
   local  — this browser only, when the database isn't available. The
            page still works end to end; nothing is shared.

   Which one is in play is stated in the footer rather than hidden, so
   nobody posts an ad believing it went further than it did.

   Layout in the shared store:
     listings/<id>                  the record, with a small cover thumb
     listings/<id>/photos/<n>       full-size photos, one per document
     accounts/<handle>              salt + derived key, never a password
     inquiries/<id>                 buyer messages, keyed by seller
     reports/<id>                   "report this ad" flags, open or resolved */

(function (HO) {
  var store = HO.store = {};
  var DAY = 86400000;

  var db = null;
  store.mode = "local";           /* "shared" once the database answers */
  var listings = [];              /* stored records only, samples excluded */
  var listeners = [];
  var inquiries = [];
  var inqListeners = [];
  var reports = [];
  var reportListeners = [];

  var K_LIST = "ho.listings.v1";
  var K_INQ  = "ho.inquiries.v1";
  var K_ACCT = "ho.accounts.v1";
  var K_PHOTO = "ho.photos.";
  var K_REPORT = "ho.reports.v1";

  /* ── local helpers ───────────────────────────────────────────── */
  function lsGet(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function lsSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }
  function quotaError() { return { key: "store.full" }; }

  function emit() {
    listeners.forEach(function (fn) { fn(store.listings()); });
  }
  function emitInq() {
    inqListeners.forEach(function (fn) { fn(inquiries.slice()); });
  }
  function emitReports() {
    reportListeners.forEach(function (fn) { fn(reports.slice()); });
  }

  /* ── start-up ────────────────────────────────────────────────── */
  store.init = function () {
    var use = (window.claude && window.claude.use)
      ? window.claude.use("db")
      : Promise.resolve(null);

    return use.then(function (handle) {
      if (!handle) throw new Error("no-db");
      db = handle;
      store.mode = "shared";
      subscribeShared();
      return "shared";
    }).catch(function () {
      db = null;
      store.mode = "local";
      listings = lsGet(K_LIST, []);
      inquiries = lsGet(K_INQ, []);
      reports = lsGet(K_REPORT, []);
      emit(); emitInq(); emitReports();
      return "local";
    });
  };

  function subscribeShared() {
    db.collection("listings").orderBy("createdAt", "desc").limit(300)
      .onSnapshot(function (snap) {
        listings = snap.docs.map(function (d) {
          return Object.assign({ id: d.id }, d.data());
        });
        emit();
      }, function () { /* terminal: keep whatever we last drew */ });
  }

  /* ── reads ───────────────────────────────────────────────────── */
  /* Samples first-class alongside stored records, newest first. */
  store.listings = function () {
    var all = listings.concat(HO.SAMPLES);
    return all.filter(function (l) { return l && l.status !== "deleted"; })
              .sort(function (a, b) { return b.createdAt - a.createdAt; });
  };

  store.get = function (id) {
    return store.listings().find(function (l) { return l.id === id; }) || null;
  };

  store.isLive = function (l) { return !l.expiresAt || l.expiresAt > Date.now(); };

  store.onListings = function (fn) {
    listeners.push(fn);
    fn(store.listings());
    return function () { listeners = listeners.filter(function (f) { return f !== fn; }); };
  };

  store.mine = function (sellerId) {
    if (!sellerId) return [];
    return listings.filter(function (l) { return l.sellerId === sellerId; })
                   .sort(function (a, b) { return b.createdAt - a.createdAt; });
  };

  store.bySeller = function (sellerId) {
    return store.listings().filter(function (l) {
      return l.sellerId === sellerId && store.isLive(l);
    });
  };

  /* ── listings: write ─────────────────────────────────────────── */
  store.addListing = function (rec, photos) {
    rec.id = rec.id || HO.auth.randomId("l_");
    rec.status = "live";
    rec.createdAt = rec.createdAt || Date.now();
    rec.expiresAt = rec.createdAt + HO.tier(rec.tier).days * DAY;

    if (db) {
      return db.doc("listings/" + rec.id).set(rec)
        .then(function () { return writePhotos(rec.id, photos); })
        .then(function () { return rec; })
        .catch(mapDbError);
    }
    listings.unshift(rec);
    if (!lsSet(K_LIST, listings)) { listings.shift(); return Promise.reject(quotaError()); }
    lsSet(K_PHOTO + rec.id, photos || []);
    emit();
    return Promise.resolve(rec);
  };

  store.updateListing = function (id, patch, photos) {
    if (db) {
      return db.doc("listings/" + id).update(patch)
        .then(function () { return photos ? replacePhotos(id, photos) : null; })
        .catch(mapDbError);
    }
    var i = listings.findIndex(function (l) { return l.id === id; });
    if (i === -1) return Promise.reject({ key: "store.err" });
    listings[i] = Object.assign({}, listings[i], patch);
    lsSet(K_LIST, listings);
    if (photos) lsSet(K_PHOTO + id, photos);
    emit();
    return Promise.resolve();
  };

  store.removeListing = function (id) {
    if (db) {
      return db.collection("listings/" + id + "/photos").get()
        .then(function (snap) {
          return Promise.all(snap.docs.map(function (d) {
            return db.doc("listings/" + id + "/photos/" + d.id).delete();
          }));
        })
        .catch(function () { /* photos may not exist */ })
        .then(function () { return db.doc("listings/" + id).delete(); })
        .catch(mapDbError);
    }
    listings = listings.filter(function (l) { return l.id !== id; });
    lsSet(K_LIST, listings);
    try { localStorage.removeItem(K_PHOTO + id); } catch (e) {}
    emit();
    return Promise.resolve();
  };

  /* ── photos ──────────────────────────────────────────────────── */
  function writePhotos(id, photos) {
    if (!photos || !photos.length) return Promise.resolve();
    return Promise.all(photos.map(function (data, i) {
      return db.doc("listings/" + id + "/photos/p" + i).set({ i: i, data: data });
    }));
  }

  function replacePhotos(id, photos) {
    return db.collection("listings/" + id + "/photos").get().then(function (snap) {
      return Promise.all(snap.docs.map(function (d) {
        return db.doc("listings/" + id + "/photos/" + d.id).delete();
      }));
    }).then(function () { return writePhotos(id, photos); });
  }

  store.getPhotos = function (id) {
    if (db) {
      return db.collection("listings/" + id + "/photos").orderBy("i").get()
        .then(function (snap) {
          return snap.docs.map(function (d) { return d.data().data; })
                          .filter(Boolean);
        })
        .catch(function () { return []; });
    }
    return Promise.resolve(lsGet(K_PHOTO + id, []));
  };

  /* ── inquiries ───────────────────────────────────────────────── */
  store.addInquiry = function (rec) {
    rec.id = HO.auth.randomId("m_");
    rec.createdAt = Date.now();
    rec.read = false;
    if (db) return db.doc("inquiries/" + rec.id).set(rec).catch(mapDbError);
    inquiries.unshift(rec);
    if (!lsSet(K_INQ, inquiries)) { inquiries.shift(); return Promise.reject(quotaError()); }
    emitInq();
    return Promise.resolve();
  };

  store.onInquiries = function (sellerId, fn) {
    if (!sellerId) { fn([]); return function () {}; }
    if (db) {
      var stop = db.collection("inquiries").where("sellerId", "==", sellerId)
        .orderBy("createdAt", "desc").limit(100)
        .onSnapshot(function (snap) {
          inquiries = snap.docs.map(function (d) {
            return Object.assign({ id: d.id }, d.data());
          });
          fn(inquiries.slice());
        }, function () { fn([]); });
      return stop;
    }
    inqListeners.push(fn);
    fn(inquiries.filter(function (m) { return m.sellerId === sellerId; }));
    return function () { inqListeners = inqListeners.filter(function (f) { return f !== fn; }); };
  };

  store.markRead = function (id) {
    if (db) return db.doc("inquiries/" + id).update({ read: true }).catch(function () {});
    var m = inquiries.find(function (x) { return x.id === id; });
    if (m) { m.read = true; lsSet(K_INQ, inquiries); emitInq(); }
    return Promise.resolve();
  };

  /* ── reports ─────────────────────────────────────────────────── */
  store.addReport = function (rec) {
    rec.id = HO.auth.randomId("r_");
    rec.createdAt = Date.now();
    rec.status = "open";
    if (db) return db.doc("reports/" + rec.id).set(rec).catch(mapDbError);
    reports.unshift(rec);
    if (!lsSet(K_REPORT, reports)) { reports.shift(); return Promise.reject(quotaError()); }
    emitReports();
    return Promise.resolve();
  };

  store.onReports = function (fn) {
    if (db) {
      var stop = db.collection("reports").orderBy("createdAt", "desc").limit(200)
        .onSnapshot(function (snap) {
          reports = snap.docs.map(function (d) {
            return Object.assign({ id: d.id }, d.data());
          });
          fn(reports.slice());
        }, function () { fn([]); });
      return stop;
    }
    reportListeners.push(fn);
    fn(reports.slice());
    return function () { reportListeners = reportListeners.filter(function (f) { return f !== fn; }); };
  };

  store.resolveReport = function (id) {
    if (db) return db.doc("reports/" + id).update({ status: "resolved" }).catch(function () {});
    var r = reports.find(function (x) { return x.id === id; });
    if (r) { r.status = "resolved"; lsSet(K_REPORT, reports); emitReports(); }
    return Promise.resolve();
  };

  /* ── accounts ────────────────────────────────────────────────── */
  store.getAccount = function (handle) {
    if (db) {
      return db.doc("accounts/" + handle).get().then(function (d) {
        return d.exists ? d.data() : null;
      }).catch(function () { return null; });
    }
    return Promise.resolve(lsGet(K_ACCT, {})[handle] || null);
  };

  store.putAccount = function (rec) {
    if (db) return db.doc("accounts/" + rec.handle).set(rec).catch(mapDbError);
    var map = lsGet(K_ACCT, {});
    map[rec.handle] = rec;
    if (!lsSet(K_ACCT, map)) return Promise.reject(quotaError());
    return Promise.resolve();
  };

  /* First come, first served. The store has no create-if-absent write,
     so take a short lease on the handle, look, and only then claim it —
     a plain read-then-write lets two people both believe they won. */
  store.claimHandle = function (handle) {
    if (!db) {
      return Promise.resolve(!lsGet(K_ACCT, {})[handle]);
    }
    var ref = db.doc("accounts/" + handle);
    return ref.acquire({ holder: "signup", ttlMs: 8000 }).then(function (res) {
      if (!res.acquired) return false;
      return ref.get().then(function (d) {
        return !(d.exists && d.data() && d.data().hash);
      });
    }).catch(function () { return false; });
  };

  /* ── errors ──────────────────────────────────────────────────── */
  function mapDbError(e) {
    var code = e && e.code;
    if (code === "quota_exceeded" || code === "resource_exhausted") throw quotaError();
    throw { key: "store.err" };
  }

  store.statusKey = function () {
    return store.mode === "shared" ? "store.shared" : "store.local";
  };
})(window.HO);
