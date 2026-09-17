import {SiteLocale} from "@/lib/site-locale";

export interface RegionalSeo {
    region: string;
    countryCode: string;
    ogLocale: string;
    keywords: string[];
    blogTitle: string;
    blogDescription: string;
}

const REGIONAL_SEO: Record<SiteLocale, RegionalSeo> = {
    en: {
        region: "Worldwide",
        countryCode: "001",
        ogLocale: "en_US",
        keywords: [
            "global website development company",
            "international web design agency",
            "website development company India",
            "web design India",
            "SEO services worldwide",
            "technical SEO agency",
            "mobile app development company",
            "SaaS development company",
            "digital marketing agency worldwide",
        ],
        blogTitle: "Adamant Blog | Web Design, SEO and Digital Growth",
        blogDescription: "Practical insights on website development, UX, technical SEO, SaaS and digital marketing for businesses worldwide.",
    },
    "en-us": {
        region: "United States",
        countryCode: "US",
        ogLocale: "en_US",
        keywords: ["website development company USA", "web design USA", "technical SEO USA", "SaaS development USA", "digital marketing USA"],
        blogTitle: "Adamant Blog | Web Design, SEO and Digital Growth in the USA",
        blogDescription: "Website, UX, technical SEO, SaaS and digital marketing insights for startups and growing businesses in the United States.",
    },
    hi: {
        region: "India",
        countryCode: "IN",
        ogLocale: "hi_IN",
        keywords: ["वेबसाइट डेवलपमेंट कंपनी भारत", "वेब डिजाइन भारत", "SEO सेवाएं भारत", "मोबाइल ऐप डेवलपमेंट", "डिजिटल मार्केटिंग भारत"],
        blogTitle: "Adamant ब्लॉग | वेबसाइट, SEO और डिजिटल मार्केटिंग",
        blogDescription: "भारत के व्यवसायों के लिए वेबसाइट डेवलपमेंट, UX, तकनीकी SEO, SaaS और डिजिटल मार्केटिंग पर व्यावहारिक जानकारी।",
    },
    gu: {
        region: "India",
        countryCode: "IN",
        ogLocale: "gu_IN",
        keywords: ["વેબસાઇટ ડેવલપમેન્ટ કંપની ભારત", "વેબ ડિઝાઇન ગુજરાત", "SEO સેવાઓ ભારત", "મોબાઇલ એપ ડેવલપમેન્ટ", "ડિજિટલ માર્કેટિંગ ભારત"],
        blogTitle: "Adamant બ્લોગ | વેબ ડિઝાઇન, SEO અને ડિજિટલ માર્કેટિંગ",
        blogDescription: "ભારતના વ્યવસાયો માટે વેબસાઇટ ડેવલપમેન્ટ, UX, ટેક્નિકલ SEO, SaaS અને ડિજિટલ માર્કેટિંગ અંગે ઉપયોગી માહિતી.",
    },
    mr: {
        region: "India",
        countryCode: "IN",
        ogLocale: "mr_IN",
        keywords: ["वेबसाइट डेव्हलपमेंट कंपनी भारत", "वेब डिझाइन महाराष्ट्र", "SEO सेवा भारत", "मोबाइल अॅप डेव्हलपमेंट", "डिजिटल मार्केटिंग भारत"],
        blogTitle: "Adamant ब्लॉग | वेब डिझाइन, SEO आणि डिजिटल मार्केटिंग",
        blogDescription: "भारतामधील व्यवसायांसाठी वेबसाइट डेव्हलपमेंट, UX, तांत्रिक SEO, SaaS आणि डिजिटल मार्केटिंगविषयी उपयुक्त माहिती.",
    },
    bn: {
        region: "India",
        countryCode: "IN",
        ogLocale: "bn_IN",
        keywords: ["ওয়েবসাইট ডেভেলপমেন্ট কোম্পানি ভারত", "ওয়েব ডিজাইন ভারত", "SEO পরিষেবা ভারত", "মোবাইল অ্যাপ ডেভেলপমেন্ট", "ডিজিটাল মার্কেটিং ভারত"],
        blogTitle: "Adamant ব্লগ | ওয়েব ডিজাইন, SEO এবং ডিজিটাল মার্কেটিং",
        blogDescription: "ভারতের ব্যবসার জন্য ওয়েবসাইট ডেভেলপমেন্ট, UX, টেকনিক্যাল SEO, SaaS এবং ডিজিটাল মার্কেটিং সম্পর্কে ব্যবহারিক তথ্য।",
    },
    ta: {
        region: "India",
        countryCode: "IN",
        ogLocale: "ta_IN",
        keywords: ["வலைத்தள மேம்பாட்டு நிறுவனம் இந்தியா", "வலை வடிவமைப்பு இந்தியா", "SEO சேவைகள் இந்தியா", "மொபைல் ஆப் மேம்பாடு", "டிஜிட்டல் மார்க்கெட்டிங் இந்தியா"],
        blogTitle: "Adamant வலைப்பதிவு | வலை வடிவமைப்பு, SEO மற்றும் டிஜிட்டல் மார்க்கெட்டிங்",
        blogDescription: "இந்திய நிறுவனங்களுக்கான வலைத்தள மேம்பாடு, UX, தொழில்நுட்ப SEO, SaaS மற்றும் டிஜிட்டல் மார்க்கெட்டிங் குறிப்புகள்.",
    },
    es: {
        region: "Spanish-speaking markets",
        countryCode: "ES",
        ogLocale: "es_ES",
        keywords: ["empresa de desarrollo web", "diseño web y SEO", "desarrollo de aplicaciones móviles", "desarrollo SaaS", "marketing digital"],
        blogTitle: "Blog de Adamant | Diseño web, SEO y crecimiento digital",
        blogDescription: "Ideas prácticas sobre desarrollo web, UX, SEO técnico, SaaS y marketing digital para empresas de mercados hispanohablantes.",
    },
    fr: {
        region: "French-speaking markets",
        countryCode: "FR",
        ogLocale: "fr_FR",
        keywords: ["agence de développement web", "création site internet SEO", "développement application mobile", "développement SaaS", "marketing digital"],
        blogTitle: "Blog Adamant | Design web, SEO et croissance digitale",
        blogDescription: "Conseils pratiques sur le développement web, l'UX, le SEO technique, le SaaS et le marketing digital pour les entreprises francophones.",
    },
    de: {
        region: "German-speaking markets",
        countryCode: "DE",
        ogLocale: "de_DE",
        keywords: ["Webentwicklung Agentur", "Webdesign und SEO", "App Entwicklung", "SaaS Entwicklung", "digitales Marketing"],
        blogTitle: "Adamant Blog | Webdesign, SEO und digitales Wachstum",
        blogDescription: "Praxisnahe Einblicke in Webentwicklung, UX, technisches SEO, SaaS und digitales Marketing für deutschsprachige Unternehmen.",
    },
    "de-ch": {
        region: "Switzerland",
        countryCode: "CH",
        ogLocale: "de_CH",
        keywords: ["Webentwicklung Schweiz", "Webdesign Schweiz", "SEO Agentur Schweiz", "App Entwicklung Schweiz", "digitales Marketing Schweiz"],
        blogTitle: "Adamant Blog | Webentwicklung und SEO in der Schweiz",
        blogDescription: "Einblicke in Webentwicklung, UX, technisches SEO, SaaS und digitales Marketing für Schweizer Unternehmen.",
    },
    "fr-ch": {
        region: "French-speaking Switzerland",
        countryCode: "CH",
        ogLocale: "fr_CH",
        keywords: ["développement web Suisse", "création site web Suisse", "agence SEO Suisse", "application mobile Suisse", "marketing digital Suisse"],
        blogTitle: "Blog Adamant | Développement web et SEO en Suisse",
        blogDescription: "Conseils sur le développement web, l'UX, le SEO technique, le SaaS et le marketing digital pour les entreprises suisses francophones.",
    },
    "it-ch": {
        region: "Italian-speaking Switzerland",
        countryCode: "CH",
        ogLocale: "it_CH",
        keywords: ["sviluppo web Svizzera", "web design Svizzera", "agenzia SEO Svizzera", "sviluppo app Svizzera", "marketing digitale Svizzera"],
        blogTitle: "Blog Adamant | Sviluppo web e SEO in Svizzera",
        blogDescription: "Approfondimenti su sviluppo web, UX, SEO tecnica, SaaS e marketing digitale per le aziende della Svizzera italiana.",
    },
    pt: {
        region: "Portuguese-speaking markets",
        countryCode: "PT",
        ogLocale: "pt_PT",
        keywords: ["empresa de desenvolvimento web", "design web e SEO", "desenvolvimento de aplicações móveis", "desenvolvimento SaaS", "marketing digital"],
        blogTitle: "Blog Adamant | Web design, SEO e crescimento digital",
        blogDescription: "Conteúdos práticos sobre desenvolvimento web, UX, SEO técnico, SaaS e marketing digital para empresas lusófonas.",
    },
    ja: {
        region: "Japan",
        countryCode: "JP",
        ogLocale: "ja_JP",
        keywords: ["Webサイト制作 日本", "ホームページ制作 SEO", "アプリ開発 日本", "SaaS開発", "デジタルマーケティング"],
        blogTitle: "Adamantブログ | Web制作・SEO・デジタル成長",
        blogDescription: "日本企業向けのWebサイト制作、UX、テクニカルSEO、SaaS、デジタルマーケティングに関する実践的な情報。",
    },
    ko: {
        region: "South Korea",
        countryCode: "KR",
        ogLocale: "ko_KR",
        keywords: ["웹사이트 개발 회사", "웹디자인 SEO", "앱 개발 한국", "SaaS 개발", "디지털 마케팅"],
        blogTitle: "Adamant 블로그 | 웹사이트, SEO 및 디지털 성장",
        blogDescription: "한국 기업을 위한 웹사이트 개발, UX, 기술 SEO, SaaS 및 디지털 마케팅 실무 인사이트.",
    },
    ar: {
        region: "United Arab Emirates and Arabic-speaking markets",
        countryCode: "AE",
        ogLocale: "ar_AE",
        keywords: ["شركة تصميم مواقع", "تطوير المواقع في الإمارات", "تحسين محركات البحث", "تطوير تطبيقات الجوال", "التسويق الرقمي"],
        blogTitle: "مدونة Adamant | تصميم المواقع وSEO والنمو الرقمي",
        blogDescription: "رؤى عملية حول تطوير المواقع وتجربة المستخدم وSEO التقني ومنتجات SaaS والتسويق الرقمي للشركات العربية.",
    },
    "zh-cn": {
        region: "China",
        countryCode: "CN",
        ogLocale: "zh_CN",
        keywords: ["中国网站开发公司", "中国网站建设", "中文SEO", "中国移动应用开发", "SaaS开发中国", "中国数字营销"],
        blogTitle: "Adamant 博客 | 网站开发、SEO 与数字增长",
        blogDescription: "面向中国企业的网站开发、用户体验、技术 SEO、SaaS 产品和数字营销实用内容。",
    },
};

export function getRegionalSeo(locale: SiteLocale) {
    return REGIONAL_SEO[locale];
}
