/* ── Ethiopian calendar ────────────────────────────────────────────
   Listings carry both dates, the way a community notice board does:
   "Meskerem 3, 2019 · Sep 13, 2026". Conversion goes through the Julian
   Day Number, which is exact for every date this page will ever show.
   The Ethiopian year has twelve 30-day months plus Pagume, a short
   thirteenth month of 5 days (6 before a leap year).                  */

(function (HO) {
  var JDN_EPOCH = 1723856; /* 1 Meskerem 1 EC, Amete Mihret */

  var MONTHS_EN = ["Meskerem","Tikimt","Hidar","Tahsas","Tir","Yekatit",
                   "Megabit","Miazia","Ginbot","Sene","Hamle","Nehase","Pagume"];
  var MONTHS_AM = ["መስከረም","ጥቅምት","ኅዳር","ታኅሣሥ","ጥር","የካቲት",
                   "መጋቢት","ሚያዝያ","ግንቦት","ሰኔ","ሐምሌ","ነሐሴ","ጳጉሜ"];

  function gregorianToJDN(y, m, d) {
    var a = Math.floor((14 - m) / 12);
    var yy = y + 4800 - a;
    var mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy
             + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }

  function jdnToEthiopic(jdn) {
    var r = mod(jdn - JDN_EPOCH, 1461);
    var n = mod(r, 365) + 365 * Math.floor(r / 1460);
    return {
      y: 4 * Math.floor((jdn - JDN_EPOCH) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460),
      m: Math.floor(n / 30) + 1,
      d: mod(n, 30) + 1
    };
  }

  function mod(a, b) { return ((a % b) + b) % b; }

  /* A JS Date (read in local time) as an Ethiopian date. */
  HO.toEthiopic = function (date) {
    var jdn = gregorianToJDN(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return jdnToEthiopic(jdn);
  };

  HO.ethiopicLabel = function (date, lang) {
    var e = HO.toEthiopic(date);
    var names = lang === "am" ? MONTHS_AM : MONTHS_EN;
    return names[e.m - 1] + " " + e.d + ", " + e.y;
  };

  /* "Meskerem 3, 2019 · Sep 13, 2026" — both calendars, one line. */
  HO.bothDates = function (ms, lang) {
    var d = new Date(ms);
    var greg = d.toLocaleDateString(lang === "am" ? "am-ET" : "en-US",
                                    { month: "short", day: "numeric", year: "numeric" });
    return HO.ethiopicLabel(d, lang) + " · " + greg;
  };

  /* Short relative age for cards: "2h", "5d", "3w". */
  HO.timeAgo = function (ms, lang) {
    var s = Math.max(0, Date.now() - ms) / 1000;
    var am = lang === "am";
    if (s < 60)     return am ? "አሁን" : "just now";
    if (s < 3600)   return Math.floor(s / 60) + (am ? " ደቂቃ" : "m");
    if (s < 86400)  return Math.floor(s / 3600) + (am ? " ሰዓት" : "h");
    if (s < 604800) return Math.floor(s / 86400) + (am ? " ቀን" : "d");
    if (s < 2592000)return Math.floor(s / 604800) + (am ? " ሳምንት" : "w");
    return Math.floor(s / 2592000) + (am ? " ወር" : "mo");
  };
})(window.HO);
