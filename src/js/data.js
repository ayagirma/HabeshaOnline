/* ── Catalog ───────────────────────────────────────────────────────
   Categories, plans, cities, and the sample listings that ship with the
   page so a first-time visitor sees a working board rather than an empty
   one. Samples are marked `sample: true` and are labelled as samples
   everywhere they appear — they are page content, not seller data, and
   they are never written to the shared store.                          */

(function (HO) {

  HO.CATS = [
    { key: "housing",   ico: "🏠", en: "Housing & Rentals",   am: "ቤት እና ኪራይ" },
    { key: "sale",      ico: "🏷️", en: "For Sale",            am: "ለሽያጭ" },
    { key: "salon",     ico: "💈", en: "Hair Salon & Barber", am: "ፀጉር ሳሎን" },
    { key: "beauty",    ico: "💄", en: "Beauty & Skincare",   am: "ውበት እና ቆዳ" },
    { key: "cars",      ico: "🚗", en: "Cars & Rental",       am: "መኪና እና ኪራይ" },
    { key: "food",      ico: "☕", en: "Food & Coffee",        am: "ምግብ እና ቡና" },
    { key: "services",  ico: "🔧", en: "Services & Pros",     am: "አገልግሎቶች" },
    { key: "jobs",      ico: "💼", en: "Jobs",                am: "ስራ" },
    { key: "events",    ico: "🎟️", en: "Events",              am: "ዝግጅቶች" },
    { key: "community", ico: "📰", en: "Community",           am: "ማህበረሰብ" },
    { key: "other",     ico: "🗂️", en: "Other",               am: "ሌላ" }
  ];

  HO.CITIES = ["Denver, CO", "Aurora, CO", "Colorado Springs, CO", "Lakewood, CO",
               "Fort Collins, CO", "Boulder, CO", "Westminster, CO", "Thornton, CO"];

  HO.UNITS = [
    { key: "total", en: "total",         am: "ጠቅላላ" },
    { key: "mo",    en: "per month",     am: "በወር" },
    { key: "day",   en: "per day",       am: "በቀን" },
    { key: "hr",    en: "per hour",      am: "በሰዓት" },
    { key: "from",  en: "starting at",   am: "ጀምሮ" },
    { key: "quote", en: "call for quote",am: "ዋጋ ይጠይቁ" }
  ];

  HO.TIERS = [
    { key: "free", usd: 0, days: 7, photos: 1, video: false, pop: false,
      name: { en: "Free", am: "ነፃ" },
      feats: [ { ok: true,  en: "1 photo",             am: "1 ፎቶ" },
               { ok: false, en: "No video",            am: "ቪዲዮ የለም" },
               { ok: true,  en: "Runs 7 days",         am: "ለ7 ቀናት ይቆያል" },
               { ok: true,  en: "Standard placement",  am: "መደበኛ ቦታ" } ] },
    { key: "standard", usd: 5, days: 30, photos: 5, video: false, pop: false,
      name: { en: "Standard", am: "መደበኛ" },
      feats: [ { ok: true,  en: "Up to 5 photos",      am: "እስከ 5 ፎቶ" },
               { ok: false, en: "No video",            am: "ቪዲዮ የለም" },
               { ok: true,  en: "Runs 30 days",        am: "ለ30 ቀናት ይቆያል" },
               { ok: true,  en: "Higher in category",  am: "በምድቡ ከፍ ያለ" } ] },
    { key: "featured", usd: 15, days: 30, photos: 8, video: true, pop: true,
      name: { en: "Featured", am: "ተለይቶ የቀረበ" },
      feats: [ { ok: true,  en: "Up to 8 photos",      am: "እስከ 8 ፎቶ" },
               { ok: true,  en: "One video clip",      am: "አንድ ቪዲዮ" },
               { ok: true,  en: "Runs 30 days",        am: "ለ30 ቀናት ይቆያል" },
               { ok: true,  en: "Woven band + top of category", am: "የጥልፍ ማሰሪያ + የምድቡ አናት" } ] },
    { key: "premium", usd: 30, days: 30, photos: 12, video: true, pop: false,
      name: { en: "Premium", am: "ፕሪሚየም" },
      feats: [ { ok: true,  en: "Up to 12 photos",     am: "እስከ 12 ፎቶ" },
               { ok: true,  en: "Two video clips",     am: "ሁለት ቪዲዮ" },
               { ok: true,  en: "Runs 30 days",        am: "ለ30 ቀናት ይቆያል" },
               { ok: true,  en: "Front page + pinned", am: "የመነሻ ገጽ + ተሰክቷል" } ] }
  ];

  HO.tier = function (key) {
    return HO.TIERS.find(function (t) { return t.key === key; }) || HO.TIERS[0];
  };
  HO.cat = function (key) {
    return HO.CATS.find(function (c) { return c.key === key; }) || HO.CATS[HO.CATS.length - 1];
  };

  var DAY = 86400000;
  function ago(days) { return Date.now() - Math.round(days * DAY); }

  /* Sample board. Prices are numbers plus a unit so sorting works and
     the card can render "$1,800 / month" in either language.          */
  HO.SAMPLES = [
    { id: "s-salon-1", cat: "salon", tier: "featured", art: "g-berbere", ico: "💇🏽‍♀️", video: true,
      title: { en: "Selam Hair & Braids — grand opening week", am: "ሰላም ፀጉር እና ብሬድ — የመክፈቻ ሳምንት" },
      desc:  { en: "Braids, silk press, twists and locs. Grand opening week: 20% off every service through Saturday. Walk-ins welcome before noon, appointments after.",
               am: "ብሬድ፣ ሲልክ ፕረስ፣ ትዊስት እና ሎክ። የመክፈቻ ሳምንት፡ እስከ ቅዳሜ በሁሉም አገልግሎት 20% ቅናሽ። እስከ ቀትር ያለ ቀጠሮ፣ ከዚያ በኋላ በቀጠሮ።" },
      price: 45, unit: "from", place: "Aurora, CO", seller: "Selam B.", createdAt: ago(1.2) },

    { id: "s-housing-1", cat: "housing", tier: "featured", art: "g-stone", ico: "🏠",
      title: { en: "2BR apartment near Havana St", am: "2 መኝታ ክፍል አፓርታማ በሃቫና ጎዳና አካባቢ" },
      desc:  { en: "Second floor, two bedrooms, one bath. Heat and water included, off-street parking for one car. Ten minutes from the Ethiopian shops on Havana. Available from the first of the month.",
               am: "ሁለተኛ ፎቅ፣ ሁለት መኝታ ክፍል፣ አንድ መታጠቢያ። ማሞቂያና ውሃ ተካትቷል፤ ለአንድ መኪና ማቆሚያ አለ። ከሃቫና የኢትዮጵያ ሱቆች በአስር ደቂቃ። ከወሩ መጀመሪያ ጀምሮ ዝግጁ።" },
      price: 1800, unit: "mo", place: "Denver, CO", seller: "Yonas T.", createdAt: ago(2.4) },

    { id: "s-cars-1", cat: "cars", tier: "featured", art: "g-sky", ico: "🚗", video: true,
      title: { en: "2019 Toyota Camry LE — clean title", am: "2019 ቶዮታ ካምሪ LE — ንጹህ ሰነድ" },
      desc:  { en: "One owner, 68,000 miles, clean title in hand. New tires in June, oil changed last month, records available. Drives straight, no warning lights.",
               am: "አንድ ባለቤት፣ 68,000 ማይል፣ ንጹህ ሰነድ በእጅ። በሰኔ አዲስ ጎማ፣ ባለፈው ወር ዘይት ተቀይሯል፤ መዝገብ አለ። በጥሩ ሁኔታ ይሄዳል፤ ምንም ማስጠንቀቂያ መብራት የለም።" },
      price: 16500, unit: "total", place: "Colorado Springs, CO", seller: "Dawit G.", createdAt: ago(3.1) },

    { id: "s-food-1", cat: "food", tier: "standard", art: "g-coffee", ico: "🧑🏽‍🍳",
      title: { en: "Home-made injera — weekly delivery", am: "የቤት እንጀራ — ሳምንታዊ አቅርቦት" },
      desc:  { en: "Fresh injera baked Thursday, delivered Friday across the metro. Ten pieces per pack, teff blend or pure teff. Standing orders welcome.",
               am: "ሐሙስ የተጋገረ ትኩስ እንጀራ፣ ዓርብ በከተማው ውስጥ ይደርሳል። በአንድ ጥቅል አስር፣ የተቀላቀለ ወይም ንጹህ ጤፍ። ቋሚ ትዕዛዝ እንቀበላለን።" },
      price: 15, unit: "total", place: "Aurora, CO", seller: "Tigist A.", createdAt: ago(0.3) },

    { id: "s-beauty-1", cat: "beauty", tier: "standard", art: "g-saffron", ico: "💅🏽",
      title: { en: "Nails and lashes by appointment", am: "ጥፍርና ሽፋሽፍት በቀጠሮ" },
      desc:  { en: "Gel, acrylic, classic and hybrid lash sets. Home studio near Iliff, evenings and weekends.",
               am: "ጄል፣ አክሪሊክ፣ ክላሲክና ሃይብሪድ ሽፋሽፍት። በኢሊፍ አካባቢ የቤት ስቱዲዮ፤ ምሽትና ቅዳሜ እሁድ።" },
      price: 35, unit: "from", place: "Denver, CO", seller: "Hanna M.", createdAt: ago(0.6) },

    { id: "s-sale-1", cat: "sale", tier: "free", art: "g-stone", ico: "🛋️",
      title: { en: "Sofa set, barely used", am: "ሶፋ ስብስብ፣ ብዙ ያልተጠቀመ" },
      desc:  { en: "Three-seater and armchair, grey fabric, no pets and no smoking in the house. You pick up — I can help you load it.",
               am: "የሶስት ሰው ሶፋና ወንበር፣ ግራጫ ጨርቅ፣ በቤት ውስጥ እንስሳም ሲጋራም የለም። እርስዎ ይውሰዱ — ለመጫን እረዳለሁ።" },
      price: 400, unit: "total", place: "Lakewood, CO", seller: "Meron K.", createdAt: ago(1.9) },

    { id: "s-housing-2", cat: "housing", tier: "free", art: "g-enset", ico: "🔑",
      title: { en: "Roommate wanted — private room", am: "የክፍል ተካፋይ ተፈላጊ — የግል ክፍል" },
      desc:  { en: "Private room in a quiet three-bedroom, shared kitchen. Utilities split three ways. Habesha household, no smoking.",
               am: "በጸጥታ ባለ ሶስት መኝታ ቤት ውስጥ የግል ክፍል፣ የጋራ ማብሰያ። መገልገያዎች በሶስት ይካፈላሉ። የሀበሻ ቤተሰብ፣ ሲጋራ የለም።" },
      price: 650, unit: "mo", place: "Fort Collins, CO", seller: "Abel S.", createdAt: ago(4.2) },

    { id: "s-services-1", cat: "services", tier: "standard", art: "g-stone", ico: "🔧",
      title: { en: "Mobile mechanic — comes to you", am: "ተንቀሳቃሽ መካኒክ — ወደ እርስዎ ይመጣል" },
      desc:  { en: "Brakes, alternators, batteries, diagnostics. Fifteen years in the trade. I come to your driveway anywhere in the metro.",
               am: "ብሬክ፣ አልተርኔተር፣ ባትሪ፣ ምርመራ። በሙያው አስራ አምስት ዓመት። በከተማው ውስጥ የትም ወደ ቤትዎ እመጣለሁ።" },
      price: 0, unit: "quote", place: "Denver, CO", seller: "Kidus H.", createdAt: ago(5.5) },

    { id: "s-food-2", cat: "food", tier: "featured", art: "g-coffee", ico: "☕",
      title: { en: "Coffee ceremony catering for events", am: "የቡና ስነ-ስርዓት ለዝግጅቶች" },
      desc:  { en: "Full jebena ceremony for weddings, melse, graduations and office events — roasting, incense, popcorn and service for up to sixty guests.",
               am: "ለሰርግ፣ ለመልስ፣ ለምረቃና ለቢሮ ዝግጅቶች ሙሉ የጀበና ስነ-ስርዓት — መጥበስ፣ ዕጣን፣ ፍንዳታና እስከ ስድሳ እንግዳ አገልግሎት።" },
      price: 150, unit: "from", place: "Boulder, CO", seller: "Almaz W.", createdAt: ago(6.1) },

    { id: "s-jobs-1", cat: "jobs", tier: "standard", art: "g-berbere", ico: "💼",
      title: { en: "Line cook wanted — Habesha restaurant", am: "የወጥ ቤት ሰራተኛ ተፈላጊ — የሀበሻ ምግብ ቤት" },
      desc:  { en: "Evening shift, five days. Experience with wot and tibs preferred but we will train the right person. Meals included.",
               am: "የምሽት ፈረቃ፣ አምስት ቀን። የወጥና የጥብስ ልምድ ይመረጣል፤ ትክክለኛውን ሰው ግን እናሰለጥናለን። ምግብ ተካትቷል።" },
      price: 22, unit: "hr", place: "Denver, CO", seller: "Habesha Kitchen", createdAt: ago(2.8) },

    { id: "s-events-1", cat: "events", tier: "premium", art: "g-saffron", ico: "🎶",
      title: { en: "Enkutatash concert — New Year tickets", am: "የእንቁጣጣሽ ኮንሰርት — የአዲስ ዓመት ትኬት" },
      desc:  { en: "Live band, traditional dancers and a full kitchen. Doors at seven, music at nine. Tables of eight can be reserved together.",
               am: "የቀጥታ ባንድ፣ ባህላዊ ዳንሰኞችና ሙሉ ወጥ ቤት። በሰባት ሰዓት መግቢያ፣ በዘጠኝ ሙዚቃ። የስምንት ሰው ጠረጴዛ አብሮ ማስያዝ ይቻላል።" },
      price: 40, unit: "total", place: "Aurora, CO", seller: "Habesha Events CO", createdAt: ago(0.9) },

    { id: "s-cars-2", cat: "cars", tier: "free", art: "g-sky", ico: "🚙",
      title: { en: "SUV for daily rental", am: "SUV ለቀን ኪራይ" },
      desc:  { en: "Seven seats, insured and cleaned between renters. Good for airport runs and family visits. Weekly rate available.",
               am: "ሰባት መቀመጫ፣ የተመዘገበ መድን ያለውና በተከራዮች መካከል የሚጸዳ። ለአውሮፕላን ማረፊያና ለቤተሰብ ጉብኝት ጥሩ። ሳምንታዊ ዋጋም አለ።" },
      price: 65, unit: "day", place: "Denver, CO", seller: "Dawit G.", createdAt: ago(7.4) },

    { id: "s-salon-2", cat: "salon", tier: "free", art: "g-coffee", ico: "💈",
      title: { en: "Men's cuts and beard trim", am: "የወንዶች ፀጉርና ጺም" },
      desc:  { en: "Fades, line-ups and hot towel shaves. Chair in a shop off Academy, Tuesday to Sunday.",
               am: "ፌድ፣ ላይን አፕና በሙቅ ፎጣ መላጨት። በአካዳሚ አካባቢ ባለ ሱቅ ውስጥ፣ ከማክሰኞ እስከ እሁድ።" },
      price: 25, unit: "from", place: "Colorado Springs, CO", seller: "Bereket L.", createdAt: ago(9.2) },

    { id: "s-beauty-2", cat: "beauty", tier: "standard", art: "g-berbere", ico: "💄",
      title: { en: "Bridal makeup for weddings and melse", am: "የሙሽራ ሜካፕ ለሰርግና ለመልስ" },
      desc:  { en: "Bride, maids and family. I travel to you with lighting and a full kit. Trial session before the day is included.",
               am: "ለሙሽራ፣ ለሚዜዎችና ለቤተሰብ። ከመብራትና ከሙሉ ቁሳቁስ ጋር ወደ እርስዎ እመጣለሁ። ከቀኑ በፊት የሙከራ ክፍለ ጊዜ ተካትቷል።" },
      price: 120, unit: "from", place: "Denver, CO", seller: "Hanna M.", createdAt: ago(3.7) },

    { id: "s-other-1", cat: "other", tier: "free", art: "g-enset", ico: "📦",
      title: { en: "Cargo shipping to Addis — monthly container", am: "ጭነት ወደ አዲስ አበባ — ወርሃዊ ኮንቴነር" },
      desc:  { en: "Barrels and boxes, door to door. Container leaves the first week of every month. Insured, with a tracking number for each piece.",
               am: "በርሜልና ካርቶን፣ ከበር እስከ በር። ኮንቴነሩ በየወሩ የመጀመሪያ ሳምንት ይነሳል። መድን ያለው፤ ለእያንዳንዱ ዕቃ መከታተያ ቁጥር አለው።" },
      price: 0, unit: "quote", place: "Aurora, CO", seller: "Nile Cargo", createdAt: ago(11.5) },

    { id: "s-community-1", cat: "community", tier: "free", art: "g-enset", ico: "📰",
      title: { en: "Amharic Saturday school — registration open", am: "የአማርኛ ቅዳሜ ትምህርት ቤት — ምዝገባ ተከፍቷል" },
      desc:  { en: "Reading, writing and song for children five to fourteen. Saturday mornings at the community hall. Volunteer teachers welcome.",
               am: "ለአምስት እስከ አስራ አራት ዓመት ልጆች ንባብ፣ ጽሕፈትና ዝማሬ። ቅዳሜ ጠዋት በማህበረሰብ አዳራሽ። በጎ ፈቃደኛ አስተማሪዎችን እንቀበላለን።" },
      price: 0, unit: "quote", place: "Denver, CO", seller: "Community Board", createdAt: ago(8.3) }
  ];

  /* Samples are finished listing records, so the rest of the app can
     treat them exactly like stored ones. */
  HO.SAMPLES.forEach(function (s) {
    s.sample = true;
    s.status = "live";
    s.sellerId = "sample";
    /* Samples stand in for a live board, so they never age out the way
       a real listing does. */
    s.expiresAt = Date.now() + 30 * DAY;
    s.photos = [];
  });

})(window.HO);
