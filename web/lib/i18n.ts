/* ── i18n ──────────────────────────────────────────────────────────
   Ported verbatim from src/js/i18n.js — same keys, same strings, both
   languages. Content sellers write is stored in whichever language they
   typed it and is never machine-translated here.

   Difference from the original: no global mutable HO.lang. `t`/`tt` take
   the language explicitly; see i18n-context.tsx for the React-side state
   (a context + hook, same shape as the old HO.lang / HO.t / HO.tt). */

export type Lang = "en" | "am";

type Row = { en: string; am: string };
type BilingualPair = { en: string; am?: string } | string | null | undefined;

export const STR: Record<string, Row> = {
  "common.back": { en: "← Back", am: "← ተመለስ" },
  "common.cancel": { en: "Cancel", am: "ተወው" },
  "common.save": { en: "Save", am: "አስቀምጥ" },
  "common.delete": { en: "Delete", am: "አጥፋ" },
  "common.edit": { en: "Edit", am: "አስተካክል" },
  "common.close": { en: "Close", am: "ዝጋ" },
  "common.optional": { en: "optional", am: "አማራጭ" },
  "common.required": { en: "Required", am: "ያስፈልጋል" },
  "common.saving": { en: "Saving…", am: "በማስቀመጥ ላይ…" },
  "common.loading": { en: "Loading…", am: "በመጫን ላይ…" },

  "nav.browse": { en: "Browse", am: "አስስ" },
  "nav.saved": { en: "Saved", am: "የተቀመጡ" },
  "nav.inbox": { en: "Inbox", am: "መልዕክቶች" },
  "nav.you": { en: "You", am: "መለያዎ" },
  "nav.pricing": { en: "Pricing", am: "ዋጋ" },
  "nav.post": { en: "Post an ad", am: "ማስታወቂያ ለጥፍ" },
  "nav.postShort": { en: "Post", am: "ለጥፍ" },
  "nav.moderation": { en: "Reports", am: "ሪፖርቶች" },

  "hero.eyebrow": { en: "Colorado · ኮሎራዶ", am: "ኮሎራዶ · Colorado" },
  "hero.title": {
    en: "A place for your post to actually be seen",
    am: "ማስታወቂያዎ በትክክል የሚታይበት ቦታ",
  },
  "hero.lede": {
    en: "Salons, apartments, cars, catering and jobs — posted by neighbors in Denver, Aurora and the Front Range, in Amharic and English.",
    am: "ሳሎን፣ አፓርታማ፣ መኪና፣ ምግብ አቅርቦትና ስራ — በዴንቨር፣ በአውሮራና በአካባቢው ባሉ ጎረቤቶች የተለጠፉ፤ በአማርኛና በእንግሊዝኛ።",
  },
  "hero.telegram": {
    en: "You know the feeling from the Telegram groups — a good listing, buried within the hour under a hundred more messages. Here, nothing scrolls away.",
    am: "በቴሌግራም ቡድኖች ውስጥ ያንን ስሜት ያውቁታል — ጥሩ ማስታወቂያ በሰዓታት ውስጥ በመቶዎች በሚቆጠሩ መልዕክቶች ስር ይቀበራል። እዚህ ግን ምንም ነገር አይሸሽም።",
  },

  "search.placeholder": { en: "Search rooms, salons, cars…", am: "ክፍል፣ ሳሎን፣ መኪና ይፈልጉ…" },
  "search.go": { en: "Search", am: "ፈልግ" },

  "stat.listings": { en: "listings live", am: "ንቁ ማስታወቂያዎች" },
  "stat.cats": { en: "categories", am: "ምድቦች" },
  "stat.cities": { en: "Colorado cities", am: "የኮሎራዶ ከተሞች" },

  "browse.featured": { en: "Featured this week", am: "የዚህ ሳምንት ተለይተው የቀረቡ" },
  "browse.featuredSub": {
    en: "Paid placements — they wear the woven band.",
    am: "የተከፈለባቸው ማስታወቂያዎች — የጥልፍ ማሰሪያ ያላቸው።",
  },
  "browse.recent": { en: "Latest listings", am: "የቅርብ ጊዜ ማስታወቂያዎች" },
  "browse.sort": { en: "Sort", am: "ደርድር" },
  "browse.clear": { en: "Clear filters", am: "ማጣሪያ አጽዳ" },
  "browse.emptyTitle": { en: "Nothing matches that search yet.", am: "ከፍለጋዎ ጋር የሚገጥም የለም።" },
  "browse.emptyCta": { en: "Show everything", am: "ሁሉንም አሳይ" },
  "browse.results": { en: "results", am: "ውጤቶች" },

  "sort.new": { en: "Newest", am: "አዲስ" },
  "sort.low": { en: "Price: low to high", am: "ዋጋ፡ ከዝቅተኛ" },
  "sort.high": { en: "Price: high to low", am: "ዋጋ፡ ከከፍተኛ" },

  "how.title": { en: "How it works", am: "እንዴት እንደሚሰራ" },
  "how.1t": { en: "Make an account", am: "መለያ ይክፈቱ" },
  "how.1b": {
    en: "A user name, a password, and a code we email to confirm it's you.",
    am: "የተጠቃሚ ስም፣ የይለፍ ቃል፣ እና እርስዎ መሆንዎን ለማረጋገጥ በኢሜይል የምንልክልዎ ኮድ።",
  },
  "how.2t": { en: "Post your ad", am: "ማስታወቂያዎን ይለጥፉ" },
  "how.2b": {
    en: "Category, price, and where you are — in Amharic, English, or both. It goes live once we've had a quick look.",
    am: "ምድብ፣ ዋጋ፣ እና የሚገኙበት ቦታ — በአማርኛ፣ በእንግሊዝኛ ወይም በሁለቱም። ፈጣን እይታ ካደረግን በኋላ ይታያል።",
  },
  "how.3t": { en: "Choose how long it runs", am: "የሚቆይበትን ጊዜ ይምረጡ" },
  "how.3b": {
    en: "Free ads run a week. Paid plans run a month and sit higher in the category.",
    am: "ነፃ ማስታወቂያ ለአንድ ሳምንት ይቆያል። የተከፈለባቸው ለአንድ ወር ይቆያሉ፤ በምድቡ ውስጥም ከፍ ብለው ይታያሉ።",
  },
  "how.4t": { en: "Answer within 3 business days", am: "በ3 የስራ ቀናት ውስጥ ይመልሱ" },
  "how.4b": {
    en: "Buyers reach you by message, or by your number if you choose to show it. Reply — yes, no, or sold. Ads left unanswered are treated as no longer wanted and taken down, so no one is left waiting.",
    am: "ገዢዎች በመልዕክት ወይም ካሳዩ በስልክ ቁጥርዎ ያገኙዎታል። ይመልሱ — አዎ፣ አይ ወይም ተሽጧል። መልስ ያልተሰጠባቸው ማስታወቂያዎች እንደማይፈለጉ ተቆጥረው ይወርዳሉ፤ ማንም ተጠባቂ አይሆንም።",
  },
  "how.buyers": {
    en: "Buyers: no account needed to browse or to message a seller.",
    am: "ገዢዎች፡ ለማሰስ ወይም ለሻጭ መልዕክት ለመላክ መለያ አያስፈልግም።",
  },

  "card.sample": { en: "Sample", am: "ናሙና" },
  "card.photo": { en: "Photo", am: "ፎቶ" },
  "card.featured": { en: "Featured", am: "ተለይቷል" },
  "card.video": { en: "Video", am: "ቪዲዮ" },
  "card.yours": { en: "Yours", am: "የእርስዎ" },
  "card.save": { en: "Save listing", am: "ማስታወቂያ አስቀምጥ" },
  "card.unsave": { en: "Remove from saved", am: "ከተቀመጡት አውጣ" },

  "detail.posted": { en: "Posted", am: "የተለጠፈው" },
  "detail.runsTo": { en: "Runs until", am: "የሚቆይበት" },
  "detail.about": { en: "About this listing", am: "ስለዚህ ማስታወቂያ" },
  "detail.noDesc": { en: "The seller didn't add a description.", am: "ሻጩ ማብራሪያ አልጨመረም።" },
  "detail.contact": { en: "Show contact", am: "አድራሻ አሳይ" },
  "detail.message": { en: "Message seller", am: "ለሻጩ ይጻፉ" },
  "detail.member": { en: "Member since", am: "አባል የሆኑት" },
  "detail.viewSeller": { en: "See all their listings", am: "ሁሉንም ማስታወቂያዎቻቸውን ይመልከቱ" },
  "detail.safety": { en: "Staying safe", am: "ደህንነት" },
  "detail.s1": { en: "Meet in a public place, in daylight.", am: "በቀን ብርሃን፣ በሕዝብ ቦታ ይገናኙ።" },
  "detail.s2": { en: "Look at the item before you pay.", am: "ከመክፈልዎ በፊት እቃውን ይመልከቱ።" },
  "detail.s3": {
    en: "Never wire money or send gift cards to someone you haven't met.",
    am: "ላላገኙት ሰው ገንዘብ በዝውውር ወይም በስጦታ ካርድ አይላኩ።",
  },
  "detail.report": { en: "Report this ad", am: "ይህን ማስታወቂያ ሪፖርት አድርግ" },
  "detail.reportWhy": { en: "What's wrong with it?", am: "ችግሩ ምንድን ነው?" },
  "detail.reported": {
    en: "Reported — thank you. Our team will look at it.",
    am: "ተሪፖርት ተደርጓል — እናመሰግናለን። ቡድናችን ይመለከተዋል።",
  },
  "report.spam": { en: "Spam", am: "አላስፈላጊ ማስታወቂያ" },
  "report.scam": { en: "Scam", am: "አጭበርባሪ" },
  "report.wrongCat": { en: "Wrong category", am: "የተሳሳተ ምድብ" },
  "report.offensive": { en: "Offensive", am: "አጸያፊ" },
  "report.other": { en: "Other", am: "ሌላ" },
  "detail.similar": { en: "More in this category", am: "በዚህ ምድብ ተጨማሪ" },
  "detail.gone": { en: "That listing is no longer available.", am: "ይህ ማስታወቂያ የለም።" },
  "detail.sampleNote": {
    en: "This is a sample listing that ships with the site, not a real seller.",
    am: "ይህ ከጣቢያው ጋር የቀረበ የናሙና ማስታወቂያ ነው፤ እውነተኛ ሻጭ አይደለም።",
  },

  "ask.title": { en: "Ask about this listing", am: "ስለዚህ ማስታወቂያ ይጠይቁ" },
  "ask.name": { en: "Your name", am: "ስምዎ" },
  "ask.contact": { en: "Phone or email so they can reply", am: "እንዲመልሱልዎ ስልክ ወይም ኢሜይል" },
  "ask.body": { en: "Message", am: "መልዕክት" },
  "ask.ph": {
    en: "Is this still available? I can pick it up this weekend.",
    am: "አሁንም አለ? በዚህ ሳምንት መጨረሻ መውሰድ እችላለሁ።",
  },
  "ask.send": { en: "Send message", am: "መልዕክት ላክ" },
  "ask.sent": {
    en: "Sent. The seller has 3 business days to reply — by yes, no, or sold — or the ad comes down.",
    am: "ተልኳል። ሻጩ በ3 የስራ ቀናት ውስጥ መልስ መስጠት አለበት — አዎ፣ አይ ወይም ተሽጧል — አለበለዚያ ማስታወቂያው ይወርዳል።",
  },
  "ask.sample": { en: "Sample listings have no seller to write to.", am: "የናሙና ማስታወቂያዎች የሚጻፍላቸው ሻጭ የላቸውም።" },
  "ask.incomplete": { en: "Fill in your name, a way to reach you, and a message.", am: "ስምዎን፣ የሚያገኙበትን መንገድ እና መልዕክት ይሙሉ።" },
  "ask.error": { en: "That didn't send. Check your connection and try again.", am: "አልተላከም። ግንኙነትዎን አረጋግጠው ይሞክሩ።" },

  "post.title": { en: "Post an ad", am: "ማስታወቂያ ይለጥፉ" },
  "post.editTitle": { en: "Edit your ad", am: "ማስታወቂያዎን ያስተካክሉ" },
  "post.sec1": { en: "What are you posting?", am: "ምን እየለጠፉ ነው?" },
  "post.sec2": { en: "Photos", am: "ፎቶዎች" },
  "post.sec3": { en: "Price and place", am: "ዋጋና ቦታ" },
  "post.sec4": { en: "How buyers reach you", am: "ገዢዎች እንዴት ያገኙዎታል" },
  "post.sec5": { en: "Plan", am: "እቅድ" },
  "post.cat": { en: "Category", am: "ምድብ" },
  "post.adTitle": { en: "Title", am: "ርዕስ" },
  "post.titlePh": { en: "2BR apartment near Havana St", am: "2 መኝታ ክፍል አፓርታማ" },
  "post.desc": { en: "Description", am: "ማብራሪያ" },
  "post.descPh": {
    en: "Describe the condition, what's included, and when you're available.",
    am: "ሁኔታውን፣ የተካተተውን ነገርና መቼ እንደሚገኙ ይግለጹ።",
  },
  "post.price": { en: "Price", am: "ዋጋ" },
  "post.pricePh": { en: "1800", am: "1800" },
  "post.priceUnit": { en: "Per", am: "በ" },
  "post.city": { en: "City", am: "ከተማ" },
  "post.method": { en: "Reply by", am: "መልስ በ" },
  "post.contact": { en: "Phone or email", am: "ስልክ ወይም ኢሜይል" },
  "post.photoHint": {
    en: "Up to {n} photos on this plan. They're shrunk on your device before upload.",
    am: "በዚህ እቅድ እስከ {n} ፎቶ። ከመላካቸው በፊት በመሳሪያዎ ላይ ይቀነሳሉ።",
  },
  "post.addPhoto": { en: "Add photo", am: "ፎቶ ጨምር" },
  "post.photoUploading": { en: "Uploading…", am: "በመስቀል ላይ…" },
  "post.photoCover": { en: "Cover", am: "ሽፋን" },
  "post.photoBad": { en: "Couldn't add", am: "አልተጨመረም" },
  "post.photoType": {
    en: "Couldn't read that image. iPhone photos are often HEIC — set the camera to \"Most Compatible\", or pick a JPG or PNG.",
    am: "ያንን ምስል ማንበብ አልተቻለም። የ iPhone ፎቶዎች ብዙ ጊዜ HEIC ናቸው — ካሜራውን ወደ \"Most Compatible\" ያድርጉ፣ ወይም JPG ወይም PNG ይምረጡ።",
  },
  "post.errPhotos": {
    en: "One of the photos didn't upload. Remove it and try again.",
    am: "ከፎቶዎቹ አንዱ አልተሰቀለም። አውጥተው እንደገና ይሞክሩ።",
  },
  "post.preview": { en: "Live preview", am: "ቅድመ እይታ" },
  "post.publish": { en: "Publish ad", am: "ማስታወቂያ አትም" },
  "post.saveEdit": { en: "Save changes", am: "ለውጦችን አስቀምጥ" },
  "post.toPay": { en: "Continue to payment", am: "ወደ ክፍያ ቀጥል" },
  "post.published": { en: "Your ad is live.", am: "ማስታወቂያዎ ታትሟል።" },
  "post.pendingReview": {
    en: "Submitted — it'll go live once an admin approves it.",
    am: "ተልኳል — አስተዳዳሪ ካጸደቀው በኋላ ይታያል።",
  },
  "post.updated": { en: "Changes saved.", am: "ለውጦች ተቀምጠዋል።" },
  "post.needAuth": { en: "Sign in to post an ad", am: "ማስታወቂያ ለመለጠፍ ይግቡ" },
  "post.needAuthB": {
    en: "An account keeps your listings together and lets buyers write to you.",
    am: "መለያ ማስታወቂያዎችዎን አንድ ላይ ያስቀምጣል፤ ገዢዎችም እንዲጽፉልዎ ያደርጋል።",
  },
  "post.needVerified": {
    en: "Confirm your email before posting — check the link we sent you.",
    am: "ከመለጠፍዎ በፊት ኢሜይልዎን ያረጋግጡ — የላክንልዎትን አገናኝ ይመልከቱ።",
  },
  "post.tooBig": {
    en: "That image is too large even after shrinking. Try another.",
    am: "ይህ ምስል ከተቀነሰም በኋላ በጣም ትልቅ ነው። ሌላ ይሞክሩ።",
  },
  "post.errTitle": { en: "Give the ad a title.", am: "ለማስታወቂያው ርዕስ ይስጡ።" },
  "post.errPrice": { en: "Add a price, or choose “Call for quote”.", am: "ዋጋ ይጨምሩ ወይም “ዋጋ ይጠይቁ” ይምረጡ።" },
  "post.errContact": { en: "Buyers need a way to reach you.", am: "ገዢዎች የሚያገኙዎት መንገድ ያስፈልጋቸዋል።" },
  "post.agree": {
    en: "I confirm this listing is accurate and I'm responsible for its content.",
    am: "ይህ ማስታወቂያ ትክክለኛ መሆኑን አረጋግጣለሁ፣ ለይዘቱም ኃላፊነት እወስዳለሁ።",
  },
  "post.errAgree": { en: "Please confirm you're responsible for this listing.", am: "እባክዎ ለዚህ ማስታወቂያ ኃላፊነት እንደሚወስዱ ያረጋግጡ።" },
  "post.rateLimited": {
    en: "You've reached the posting limit for one day. Try again tomorrow.",
    am: "ለአንድ ቀን የማስታወቂያ ገደብ ደርሰዋል። ነገ እንደገና ይሞክሩ።",
  },

  "unit.total": { en: "total", am: "ጠቅላላ" },
  "unit.mo": { en: "month", am: "ወር" },
  "unit.day": { en: "day", am: "ቀን" },
  "unit.hr": { en: "hour", am: "ሰዓት" },
  "unit.from": { en: "starting at", am: "ጀምሮ" },
  "unit.quote": { en: "Call for quote", am: "ዋጋ ይጠይቁ" },

  "pricing.title": { en: "Plans for sellers", am: "ለሻጮች እቅዶች" },
  "pricing.sub": {
    en: "Free listings run 7 days. Paid plans add photos, video and placement.",
    am: "ነፃ ማስታወቂያ ለ7 ቀናት ይቆያል። የተከፈለባቸው ፎቶ፣ ቪዲዮና ቦታ ይጨምራሉ።",
  },
  "pricing.note": {
    en: "Prices in USD. Paid plans are sent by Cash App or Zelle — your ad goes live once we confirm it, usually within a day.",
    am: "ዋጋዎች በዶላር ናቸው። የተከፈለባቸው እቅዶች በ Cash App ወይም Zelle ይላካሉ — ካረጋገጥን በኋላ ማስታወቂያዎ ይታያል፣ ብዙውን ጊዜ በአንድ ቀን ውስጥ።",
  },
  "pricing.pick": { en: "Choose this plan", am: "ይህን እቅድ ምረጥ" },
  "pricing.pop": { en: "Most chosen", am: "በብዛት የሚመረጥ" },
  "pricing.runs": { en: "Runs", am: "የሚቆይበት" },

  "post.planPaid": {
    en: "Paid plan — you'll get Cash App / Zelle payment steps right after you submit.",
    am: "የተከፈለ እቅድ — ካስገቡ በኋላ ወዲያውኑ የ Cash App / Zelle የክፍያ ደረጃዎችን ያገኛሉ።",
  },
  "pay.title": { en: "One more step: send your payment", am: "አንድ ተጨማሪ ደረጃ: ክፍያዎን ይላኩ" },
  "pay.body": {
    en: "Your {plan} plan is {amount}. Send it with either option below, then we confirm it and your ad goes live — usually within a day.",
    am: "የ{plan} እቅድዎ {amount} ነው። ከታች ካሉት አንዱን ተጠቅመው ይላኩ፣ ከዚያም እናረጋግጥና ማስታወቂያዎ ይታያል — ብዙውን ጊዜ በአንድ ቀን ውስጥ።",
  },
  "pay.cashapp": { en: "Cash App", am: "Cash App" },
  "pay.zelle": { en: "Zelle", am: "Zelle" },
  "pay.noteLabel": { en: "Put this in the payment note", am: "ይህንን በክፍያው ማስታወሻ ላይ ያስገቡ" },
  "pay.matchNote": {
    en: "The code in the payment note is how we match your transfer to this exact listing. Without it, approval takes longer.",
    am: "በክፍያው ማስታወሻ ላይ ያለው ኮድ ክፍያዎን ከዚህ ማስታወቂያ ጋር የምናዛምድበት መንገድ ነው። ከሌለ ማጽደቁ ረዘም ይላል።",
  },
  "pay.pendingBadge": { en: "Payment pending", am: "ክፍያ በመጠባበቅ ላይ" },
  "pay.refShort": { en: "Payment code", am: "የክፍያ ኮድ" },

  "checkout.title": { en: "Checkout", am: "ክፍያ" },
  "checkout.demo": {
    en: "Demonstration checkout. Don't type a real card number — nothing is sent anywhere and no payment is taken.",
    am: "የሙከራ ክፍያ። እውነተኛ የካርድ ቁጥር አይጻፉ — ምንም አይላክም፤ ክፍያም አይወሰድም።",
  },
  "checkout.card": { en: "Card number", am: "የካርድ ቁጥር" },
  "checkout.exp": { en: "Expiry", am: "የሚያበቃበት" },
  "checkout.cvc": { en: "CVC", am: "CVC" },
  "checkout.name": { en: "Name on card", am: "በካርዱ ላይ ያለ ስም" },
  "checkout.pay": { en: "Pay and publish", am: "ክፈልና አትም" },
  "checkout.plan": { en: "Plan", am: "እቅድ" },
  "checkout.runs": { en: "Runs for", am: "የሚቆይበት" },
  "checkout.total": { en: "Total (USD)", am: "ጠቅላላ (ዶላር)" },
  "checkout.done": { en: "Payment accepted — your ad is live.", am: "ክፍያ ተቀብለናል — ማስታወቂያዎ ታትሟል።" },
  "checkout.view": { en: "View your ad", am: "ማስታወቂያዎን ይመልከቱ" },

  "saved.title": { en: "Saved listings", am: "የተቀመጡ ማስታወቂያዎች" },
  "saved.sub": {
    en: "Kept in this browser only — they don't leave your device.",
    am: "በዚህ አሳሽ ውስጥ ብቻ የተቀመጡ — መሳሪያዎን አይለቁም።",
  },
  "saved.empty": {
    en: "Tap the bookmark on any listing to keep it here.",
    am: "ማንኛውንም ማስታወቂያ እዚህ ለማስቀመጥ ምልክቱን ይንኩ።",
  },
  "saved.emptyCta": { en: "Browse listings", am: "ማስታወቂያዎችን አስስ" },

  "inbox.title": { en: "Inquiries", am: "ጥያቄዎች" },
  "inbox.sub": { en: "Messages buyers sent about your listings.", am: "ገዢዎች ስለ ማስታወቂያዎችዎ የላኩት መልዕክት።" },
  "inbox.empty": {
    en: "No messages yet. They arrive here when a buyer writes about one of your ads.",
    am: "እስካሁን መልዕክት የለም። ገዢ ስለ ማስታወቂያዎ ሲጽፍ እዚህ ይደርሳል።",
  },
  "inbox.about": { en: "About", am: "ስለ" },
  "inbox.new": { en: "New", am: "አዲስ" },
  "inbox.from": { en: "From", am: "ከ" },
  "inbox.reach": { en: "Reach them at", am: "የሚያገኙበት" },
  "inbox.respondBy": { en: "Respond by {date}", am: "እስከ {date} ድረስ ይመልሱ" },
  "inbox.overdue": { en: "Overdue — reply now or this ad will be taken down.", am: "አልፎበታል — አሁን ይመልሱ አለበለዚያ ማስታወቂያው ይወርዳል።" },
  "inbox.markAnswered": { en: "Mark answered", am: "እንደተመለሰ ምልክት አድርግ" },
  "inbox.markSpam": { en: "Spam", am: "አላስፈላጊ" },
  "inbox.answered": { en: "Answered", am: "ተመልሷል" },
  "inbox.spam": { en: "Spam", am: "አላስፈላጊ" },
  "inbox.answeredNote": { en: "Reply — yes, no, or sold — within 3 business days. Contact the buyer directly, then mark it answered here.", am: "በ3 የስራ ቀናት ውስጥ ይመልሱ — አዎ፣ አይ ወይም ተሽጧል። ገዢውን በቀጥታ ያግኙ፣ ከዚያ እዚህ እንደተመለሰ ምልክት ያድርጉ።" },
  "inbox.needAuth": { en: "Sign in to read messages about your listings.", am: "ስለ ማስታወቂያዎችዎ መልዕክቶችን ለማንበብ ይግቡ።" },

  "auth.signin": { en: "Sign in", am: "ግባ" },
  "auth.signup": { en: "Create account", am: "መለያ ክፈት" },
  "auth.signout": { en: "Sign out", am: "ውጣ" },
  "auth.handle": { en: "User name", am: "የተጠቃሚ ስም" },
  "auth.handleHint": {
    en: "Letters, numbers, dots and dashes. This is how buyers see you.",
    am: "ፊደል፣ ቁጥር፣ ነጥብና ሰረዝ። ገዢዎች የሚያዩዎት በዚህ ነው።",
  },
  "auth.display": { en: "Display name", am: "የሚታይ ስም" },
  "auth.password": { en: "Password", am: "የይለፍ ቃል" },
  "auth.password2": { en: "Repeat password", am: "የይለፍ ቃል ድገም" },
  "auth.contact": { en: "Phone or email", am: "ስልክ ወይም ኢሜይል" },
  "auth.email": { en: "Email", am: "ኢሜይል" },
  "common.phone": { en: "Phone", am: "ስልክ" },
  "common.email": { en: "Email", am: "ኢሜይል" },
  "auth.contactHint": {
    en: "Shown only after a buyer taps “Show contact”.",
    am: "ገዢ “አድራሻ አሳይ” ሲነካ ብቻ ይታያል።",
  },
  "auth.show": { en: "Show password", am: "የይለፍ ቃል አሳይ" },
  "auth.hide": { en: "Hide password", am: "የይለፍ ቃል ደብቅ" },
  "auth.haveAcct": { en: "Already have an account?", am: "መለያ አለዎት?" },
  "auth.noAcct": { en: "New here?", am: "አዲስ ነዎት?" },
  "auth.welcome": { en: "Welcome back, {name}.", am: "እንኳን ደህና መጡ፣ {name}።" },
  "auth.created": {
    en: "Almost there — check your email and confirm to finish signing up.",
    am: "ገና ትንሽ ይቀራል — ኢሜይልዎን ይመልከቱ እና ምዝገባዎን ያጠናቅቁ።",
  },
  "auth.codeSent": {
    en: "We emailed a code to {email}. Enter it below to finish signing up.",
    am: "ወደ {email} ኮድ ልከናል። ምዝገባዎን ለማጠናቀቅ ከታች ያስገቡ።",
  },
  "auth.code": { en: "Code from the email", am: "ከኢሜይሉ የመጣ ኮድ" },
  "auth.confirm": { en: "Confirm", am: "አረጋግጥ" },
  "auth.badCode": { en: "That code is wrong or expired. Check your email or resend it.", am: "ኮዱ ትክክል አይደለም ወይም አልፎበታል። ኢሜይልዎን ይመልከቱ ወይም እንደገና ይላኩ።" },
  "auth.resend": { en: "Resend code", am: "ኮድ እንደገና ላክ" },
  "auth.resent": { en: "Sent again — check your email.", am: "እንደገና ተልኳል — ኢሜይልዎን ይመልከቱ።" },
  "auth.forgot": { en: "Forgot password?", am: "የይለፍ ቃል ረስተዋል?" },
  "auth.resetTitle": { en: "Reset your password", am: "የይለፍ ቃልዎን ዳግም ያስጀምሩ" },
  "auth.resetIntro": {
    en: "Enter your email and we'll send a code.",
    am: "ኢሜይልዎን ያስገቡ፣ ኮድ እንልካለን።",
  },
  "auth.sendCode": { en: "Send code", am: "ኮድ ላክ" },
  "auth.resetSent": {
    en: "If that email is registered, a code is on its way. Enter it below with your new password.",
    am: "ያ ኢሜይል ተመዝግቦ ከሆነ ኮድ እየተላከ ነው። ከአዲሱ የይለፍ ቃልዎ ጋር ከታች ያስገቡ።",
  },
  "auth.newPassword": { en: "New password", am: "አዲስ የይለፍ ቃል" },
  "auth.resetDone": { en: "Password updated — you're signed in.", am: "የይለፍ ቃል ተቀይሯል — ገብተዋል።" },
  "auth.backToSignin": { en: "Back to sign in", am: "ወደ መግቢያ ተመለስ" },
  "auth.badCreds": { en: "That user name and password don't match.", am: "የተጠቃሚ ስሙና የይለፍ ቃሉ አይገጥሙም።" },
  "auth.unverified": {
    en: "Signed in, but your email isn't confirmed yet — check your inbox.",
    am: "ገብተዋል፣ ግን ኢሜይልዎ ገና አልተረጋገጠም — የመልዕክት ሳጥንዎን ይመልከቱ።",
  },
  "auth.taken": { en: "That user name is taken. Try another.", am: "ይህ ስም ተይዟል። ሌላ ይሞክሩ።" },
  "auth.badHandle": { en: "Use 3–24 letters, numbers, dots or dashes.", am: "3–24 ፊደል፣ ቁጥር፣ ነጥብ ወይም ሰረዝ ይጠቀሙ።" },
  "auth.shortPw": { en: "Use at least 6 characters.", am: "ቢያንስ 6 ቁምፊ ይጠቀሙ።" },
  "auth.mismatch": { en: "The two passwords are different.", am: "ሁለቱ የይለፍ ቃላት ይለያያሉ።" },
  "auth.working": { en: "Checking…", am: "በማረጋገጥ ላይ…" },
  "auth.blocked": {
    en: "This account has been blocked. Contact support if you think that's wrong.",
    am: "ይህ መለያ ታግዷል። ስህተት ነው ብለው ካሰቡ ድጋፍን ያግኙ።",
  },
  "auth.secTitle": { en: "How sign-in works here", am: "እዚህ መግባት እንዴት ይሰራል" },
  "auth.secBody": {
    en: "Auth runs on Supabase — your password never reaches this app in readable form, and a real confirmation email verifies you own the address you signed up with.",
    am: "ግቤት በSupabase ላይ ይሰራል — የይለፍ ቃልዎ በሚነበብ መልኩ ወደዚህ መተግበሪያ አይደርስም፤ እውነተኛ ማረጋገጫ ኢሜይል የገቡበትን አድራሻ ባለቤት መሆንዎን ያረጋግጣል።",
  },

  "you.title": { en: "Your account", am: "መለያዎ" },
  "you.listings": { en: "Your listings", am: "የእርስዎ ማስታወቂያዎች" },
  "you.none": { en: "You haven't posted anything yet.", am: "እስካሁን ምንም አልለጠፉም።" },
  "you.postFirst": { en: "Post your first ad", am: "የመጀመሪያ ማስታወቂያዎን ይለጥፉ" },
  "you.since": { en: "On HabeshaOnline since", am: "በHabeshaOnline ላይ ከ" },
  "you.confirmDel": { en: "Delete this listing? This can't be undone.", am: "ይህን ማስታወቂያ ማጥፋት? ወደኋላ አይመለስም።" },
  "you.deleted": { en: "Listing deleted.", am: "ማስታወቂያው ጠፍቷል።" },
  "you.expired": { en: "Expired", am: "አብቅቷል" },
  "you.pending": { en: "Awaiting approval", am: "ማጽደቅ በመጠባበቅ ላይ" },
  "you.suspended": { en: "Suspended", am: "ታግዷል" },
  "you.live": { en: "Live", am: "ንቁ" },
  "you.renew": { en: "Renew", am: "አድስ" },
  "you.renewed": { en: "Renewed for another run.", am: "ለተጨማሪ ጊዜ ታድሷል።" },
  "you.views": { en: "views", am: "እይታዎች" },
  "you.msgs": { en: "messages", am: "መልዕክቶች" },
  "you.verified": { en: "Email confirmed", am: "ኢሜይል ተረጋግጧል" },
  "you.notVerified": { en: "Email not confirmed yet", am: "ኢሜይል ገና አልተረጋገጠም" },

  "seller.title": { en: "Listings by {name}", am: "የ{name} ማስታወቂያዎች" },
  "seller.none": { en: "Nothing live from this seller right now.", am: "ከዚህ ሻጭ አሁን ንቁ ማስታወቂያ የለም።" },

  "mod.title": { en: "Reported listings", am: "የተዘገቡ ማስታወቂያዎች" },
  "mod.sub": {
    en: "Listings flagged by buyers, and pending listings waiting on approval.",
    am: "በገዢዎች የተዘገቡ ማስታወቂያዎች እና ማጽደቅ የሚጠባበቁ ማስታወቂያዎች።",
  },
  "mod.empty": { en: "Nothing reported. Good sign.", am: "ምንም አልተዘገበም። መልካም ምልክት ነው።" },
  "mod.remove": { en: "Remove listing", am: "ማስታወቂያ አስወግድ" },
  "mod.approve": { en: "Approve", am: "አጽድቅ" },
  "mod.suspend": { en: "Suspend", am: "አግድ" },
  "mod.block": { en: "Block user", am: "ተጠቃሚ አግድ" },
  "mod.unblock": { en: "Unblock user", am: "የተጠቃሚ እገዳ አንሳ" },
  "mod.dismiss": { en: "Dismiss", am: "አሰናብት" },
  "mod.removed": { en: "Listing removed.", am: "ማስታወቂያው ተወግዷል።" },
  "mod.dismissed": { en: "Report dismissed.", am: "ሪፖርቱ ተሰናብቷል።" },
  "mod.reportedBy": { en: "Reported by", am: "ሪፖርት ያደረገው" },
  "mod.anon": { en: "Someone not signed in", am: "ያልገቡ ሰው" },
  "mod.gone": { en: "listing already gone", am: "ማስታወቂያው ጠፍቷል" },
  "mod.pendingTab": { en: "Pending listings", am: "ማጽደቅ የሚጠባበቁ" },
  "mod.reportsTab": { en: "Reports", am: "ሪፖርቶች" },
  "mod.usersTab": { en: "Users", am: "ተጠቃሚዎች" },

  "foot.note": {
    en: "A community marketplace for the Ethiopian and Eritrean community in Colorado.",
    am: "በኮሎራዶ ላሉ የኢትዮጵያና የኤርትራ ማህበረሰብ የገበያ ቦታ።",
  },
  "foot.terms": { en: "Terms", am: "ውሎች" },
  "foot.privacy": { en: "Privacy", am: "ግላዊነት" },
  "foot.status": {
    en: "Deals are directly between buyer and seller. Meet safely.",
    am: "ግብይቶች በቀጥታ በገዢና በሻጭ መካከል ናቸው። በደህንነት ይገናኙ።",
  },
};

/* Look up a key; {name} style placeholders are filled from `vars`. */
export function t(key: keyof typeof STR | string, lang: Lang, vars?: Record<string, string>): string {
  const row = STR[key as string];
  let s = row ? row[lang] || row.en : (key as string);
  if (vars) for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
  return s;
}

/* Pick the current language out of a {en, am} pair written by a seller.
   Falls back to whichever one they actually wrote. */
export function tt(pair: BilingualPair, lang: Lang): string {
  if (pair == null) return "";
  if (typeof pair === "string") return pair;
  return pair[lang] || pair.en || pair.am || "";
}
