/* ── Sample listings ──────────────────────────────────────────────
   Fictional listings so a first-time visitor sees a working board
   instead of an empty one — same role as HO.SAMPLES in the original
   static build (src/js/data.js). Never written to Supabase; the Browse
   screen unions these with real rows client-side and marks each one
   "Sample" wherever it appears.

   Styled after real posts from Denver-area Habesha Telegram groups —
   the emoji-heavy shorthand, the cross-street landmarks, the bilingual
   line at the end — but every seller name, shop name, address and price
   here is invented. A couple of these started from real posts a user
   shared as reference; the format and energy are kept, the identifying
   details (name, phone number, exact street address) are not, the same
   way every other sample here already omits real contact info. */

export type Bilingual = { en: string; am: string };

export type Sample = {
  id: string;
  cat: string;
  tier: "free" | "standard" | "featured" | "premium";
  art: "g-stone" | "g-berbere" | "g-sky" | "g-coffee" | "g-saffron" | "g-enset";
  ico: string;
  video?: boolean;
  title: Bilingual;
  desc: Bilingual;
  price: number;
  unit: "total" | "mo" | "day" | "hr" | "from" | "quote";
  place: string;
  seller: string;
  createdAt: number;
};

const DAY = 86400000;
const ago = (days: number) => Date.now() - Math.round(days * DAY);

export const SAMPLES: Sample[] = [
  {
    id: "s-housing-3",
    cat: "housing",
    tier: "featured",
    art: "g-enset",
    ico: "🏡",
    title: {
      en: "Townhouse for rent — Tower & Iliff",
      am: "የሚከራይ ታውንሀውስ — ታወር እና ኢሊፍ",
    },
    desc: {
      en: "🛏️ 2 Bedrooms | 🛁 1 Bathroom\n🚗 1-car attached garage + 2 off-street spaces\n🍽️ All appliances included\n🚌 Bus stop right in front\n✨ Updated, move-in ready — AC and furnace both work\n💰 $1,900/mo, water and trash included",
      am: "2 መኝታ ክፍል | 1 ባዝ\n1 የመኪና ጋራዥ + 2 ተጨማሪ ማቆሚያ\nየታደሰ፣ ወዲያውኑ መግባት ይቻላል",
    },
    price: 1900,
    unit: "mo",
    place: "Aurora, CO",
    seller: "Aster B.",
    createdAt: ago(0.4),
  },
  {
    id: "s-housing-4",
    cat: "housing",
    tier: "standard",
    art: "g-stone",
    ico: "🚪",
    title: {
      en: "Basement room for rent — separate entrance",
      am: "የከርሰ ምድር ክፍል ለኪራይ — የተለየ በር",
    },
    desc: {
      en: "One room in a quiet residential basement, separate walk-out entrance so you're not sharing the main house. Good for a single tenant who wants privacy. Available now.",
      am: "በጸጥታ ሰፈር ውስጥ አንድ ክፍል፣ የተለየ በር ስላለው ከዋናው ቤት ጋር አይጋራም። ለአንድ ተከራይ ተስማሚ። አሁን ዝግጁ ነው።",
    },
    price: 750,
    unit: "mo",
    place: "Centennial, CO",
    seller: "Mekonnen T.",
    createdAt: ago(1.1),
  },
  {
    id: "s-services-2",
    cat: "services",
    tier: "featured",
    art: "g-saffron",
    ico: "✂️",
    video: true,
    title: {
      en: "Beza Tailoring & Custom Tees",
      am: "ቤዛ ልብስ ስፌትና ዲዛይን ቲሸርት",
    },
    desc: {
      en: "Look good, feel confident — we stitch quality, you wear it. Suits & jackets, dresses, pants & hemming, zippers, resizing, uniforms. Plus custom t-shirt printing for groups, teams and events, your design or ours.",
      am: "ጥራት ያለው ስፌት እንሰራለን፣ እርስዎ በልበ ሙሉነት ይለብሱ። ሱፍ፣ ቀሚስ፣ ሱሪ ማሳጠር፣ ዚፕ ለውጥ፣ ዩኒፎርም። ለቡድንና ለዝግጅት የቲሸርት ህትመትም እንሰራለን።",
    },
    price: 20,
    unit: "from",
    place: "Aurora, CO",
    seller: "Beza W.",
    createdAt: ago(2.6),
  },
  {
    id: "s-sale-2",
    cat: "sale",
    tier: "free",
    art: "g-stone",
    ico: "🍽️",
    title: {
      en: "Dining table + 6 chairs, good condition",
      am: "የመመገቢያ ጠረጴዛ ከ6 ወንበሮች ጋር",
    },
    desc: {
      en: "Solid wood, seats six comfortably, minor scuffs on two chair legs but sturdy. Moving out of state, need it gone by end of month. You pick up.",
      am: "ጠንካራ እንጨት፣ ለስድስት ሰው ምቹ። ወደ ሌላ ግዛት ስለምዘዋወር በዚህ ወር መጨረሻ መሸጥ አለብኝ። እርስዎ ይውሰዱ።",
    },
    price: 180,
    unit: "total",
    place: "Thornton, CO",
    seller: "Selamawit G.",
    createdAt: ago(0.8),
  },
  {
    id: "s-other-1",
    cat: "other",
    tier: "standard",
    art: "g-coffee",
    ico: "🛒",
    title: {
      en: "Habesha Corner Market — now open",
      am: "ሀበሻ ኮርነር ማርኬት — ተከፍቷል",
    },
    desc: {
      en: "Teff, berbere, mitmita, shiro, injera, and Ethiopian coffee beans, roasted weekly. Also carrying tibeb-print netela and habesha kemis for special occasions.",
      am: "ጤፍ፣ በርበሬ፣ ሚጥሚጣ፣ ሽሮ፣ እንጀራና ሳምንታዊ የተጠበሰ ቡና። ለበዓል የሚሆን ነጠላና የሀበሻ ቀሚስም እናቀርባለን።",
    },
    price: 0,
    unit: "quote",
    place: "Denver, CO",
    seller: "Habesha Corner Market",
    createdAt: ago(3.5),
  },
];
