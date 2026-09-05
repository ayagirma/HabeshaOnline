/* ── Browse ────────────────────────────────────────────────────────
   Search, category filter, sort, the featured strip and the main grid.
   Everything redraws from one function so a live update from another
   viewer lands without any special case.                              */

(function (HO) {
  var b = HO.browse = {};

  var filterCat = null;
  var search = "";
  var sort = "new";

  b.setCat = function (key) {
    filterCat = (filterCat === key) ? null : key;
    b.render();
  };

  b.onSearch = function (v) { search = v; b.render(); };

  b.submitSearch = function (ev) { ev.preventDefault(); b.render(); return false; };

  b.setSort = function (v) { sort = v; b.render(); };

  b.clearFilters = function () {
    filterCat = null; search = "";
    var input = document.getElementById("searchInput");
    if (input) input.value = "";
    b.render();
  };

  b.openCat = function (key) {
    filterCat = key;
    HO.go("browse");
    b.render();
    var head = document.getElementById("recentTitle");
    if (head) head.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  function matches(l) {
    if (filterCat && l.cat !== filterCat) return false;
    var q = search.trim().toLowerCase();
    if (!q) return true;
    var hay = [HO.tt(l.title), HO.tt(l.desc), l.place, l.seller,
               HO.tt(HO.cat(l.cat))].join(" ").toLowerCase();
    return q.split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }

  function sorted(list) {
    var out = list.slice();
    if (sort === "low")  out.sort(function (x, y) { return HO.priceValue(x) - HO.priceValue(y); });
    if (sort === "high") out.sort(function (x, y) { return HO.priceValue(y) - HO.priceValue(x); });
    return out;
  }

  b.renderRail = function () {
    var live = HO.liveListings();
    var counts = {};
    live.forEach(function (l) { counts[l.cat] = (counts[l.cat] || 0) + 1; });

    document.getElementById("catRail").innerHTML = HO.CATS.map(function (c) {
      return '<button class="cat' + (filterCat === c.key ? " on" : "") + '" ' +
             'aria-pressed="' + (filterCat === c.key ? "true" : "false") + '" ' +
             "onclick=\"HO.browse.setCat('" + c.key + "')\">" +
               '<span class="ico" aria-hidden="true">' + c.ico + "</span>" +
               "<span>" + HO.esc(HO.tt(c)) + "</span>" +
               '<span class="n">' + (counts[c.key] || 0) + "</span>" +
             "</button>";
    }).join("");
  };

  b.renderStats = function () {
    var live = HO.liveListings();
    var cities = new Set(live.map(function (l) { return l.place; }));
    document.getElementById("statStrip").innerHTML =
      "<span><b>" + live.length + "</b>" + HO.t("stat.listings") + "</span>" +
      "<span><b>" + HO.CATS.length + "</b>" + HO.t("stat.cats") + "</span>" +
      "<span><b>" + cities.size + "</b>" + HO.t("stat.cities") + "</span>";
  };

  /* The panel beside the hero: what it costs to be on the board. */
  b.renderSide = function () {
    var el = document.getElementById("heroSide");
    if (!el) return;
    el.innerHTML =
      '<div class="cap" aria-hidden="true"></div>' +
      '<div class="in">' +
        "<h3>" + HO.t("pricing.title") + "</h3>" +
        "<ul>" + HO.TIERS.map(function (t) {
          return "<li><span>" + HO.esc(HO.tt(t.name)) + "</span><b>" +
            (t.usd ? HO.money(t.usd) : "$0") + "</b></li>";
        }).join("") + "</ul>" +
        '<p class="why">' + HO.t("pricing.sub") + "</p>" +
        '<button class="btn btn-accent btn-wide" onclick="HO.go(\'post\')">' +
          HO.t("nav.post") + "</button>" +
        '<button class="link-btn" style="justify-self:start" onclick="HO.go(\'pricing\')">' +
          HO.t("nav.pricing") + "</button>" +
      "</div>";
  };

  b.renderHow = function () {
    var steps = [1, 2, 3, 4].map(function (n) {
      return "<li><h3>" + HO.t("how." + n + "t") + "</h3><p>" + HO.t("how." + n + "b") + "</p></li>";
    }).join("");
    document.getElementById("howSteps").innerHTML = steps;
  };

  b.render = function () {
    if (!document.getElementById("catRail")) return;
    b.renderRail();
    b.renderStats();
    b.renderSide();
    b.renderHow();

    var live = HO.liveListings();

    /* Featured strip ignores the filters — it is the paid shelf. */
    var featured = live.filter(function (l) {
      return l.tier === "featured" || l.tier === "premium";
    }).slice(0, 4);
    document.getElementById("featuredBlock").hidden = featured.length === 0;
    document.getElementById("featuredGrid").innerHTML = HO.gridHtml(featured);

    var rows = sorted(live.filter(matches));
    document.getElementById("recentGrid").innerHTML = HO.gridHtml(rows);
    document.getElementById("browseEmpty").hidden = rows.length !== 0;

    var filtering = !!filterCat || !!search.trim();
    document.getElementById("clearFilter").hidden = !filtering;
    document.getElementById("resultsCount").textContent =
      rows.length + " " + HO.t("browse.results");

    var title = document.getElementById("recentTitle");
    title.textContent = filterCat ? HO.tt(HO.cat(filterCat)) : HO.t("browse.recent");
  };
})(window.HO);
