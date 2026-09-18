import type {SiteLocale} from "@/lib/site-locale";

type UiCopy = {
    system: {
        kicker: string;
        title: string;
        description: string;
        cta: string;
        footer: string;
        modules: Array<{name: string; detail: string}>;
    };

    work: {
        kicker: string;
        title: string;
        description: string;
        buildCta: string;
        all: string;
        loading: string;
        empty: string;
        error: string;
        something: string;
        somethingDescription: string;
        conversation: string;
    };

    testimonials: {
        kicker: string;
        title: string;
        description: string;
        loading: string;
        emptyTitle: string;
        write: string;
        overToYou: string;
        formDescription: string;
        name: string;
        company: string;
        email: string;
        rating: string;
        experience: string;
    };
    credentialBadge: string;
};

type JourneyCopy = {
    aria: string;
    title: string;
    description: string;
    start: string;
    controls: string;
    success: string;
    replay: string;
    skip: string;
    footer: string;
};

const english: UiCopy = {
    system: {
        kicker: "ADAMANT · SYSTEM ONLINE",
        title: "One system.<br/>Every capability connected.",
        description: "Good ideas need more than separate tools. Adamant Technologies brings strategy, UI/UX design, website development, mobile app development, SaaS, SEO, automation, analytics, and digital marketing into a connected system that moves with your business.",
        cta: "Find your next move",
        footer: "Technology that moves your business forward.",
        modules: [
            {name: "BUILD", detail: "Turn the brief into a fast website, mobile app, SaaS product, or digital experience people can understand and use."},
            {name: "GROW", detail: "Help the right people discover your business through SEO, useful content, social media, landing pages, and paid campaigns."},
            {name: "AUTOMATE", detail: "Give repetitive work a smarter way forward with AI workflows, CRM processes, integrations, and practical automation."},
            {name: "CONNECT", detail: "Make your website, app, marketing, analytics, CRM, WhatsApp, and business tools share the information your team needs."},
            {name: "SCALE", detail: "Keep the design system, technical SEO, content structure, performance, and product foundations ready for what comes next."},
        ],
    },
    work: {
        kicker: "OUR WORK", title: "Ideas turned into<br/>digital experiences.", description: "Explore our websites and digital products. A closer look at the work we bring from first idea to launch.",
        buildCta: "Let’s build your project", all: "All work", loading: "Loading projects…", empty: "More project stories are on the way. Contact us for examples relevant to your idea.", error: "We couldn’t load our projects right now. Contact us to see examples of our work.", something: "Have something in mind?", somethingDescription: "A website, an app, or a fresh product experience. Tell us what you’re planning.", conversation: "Start a conversation",
    },
    testimonials: {
        kicker: "CLIENT TESTIMONIALS", title: "Your experience.<br/>In your words.", description: "Good work starts with a conversation. Here’s what working with Adamant feels like, from the people who know us.",
        loading: "Loading testimonials…", emptyTitle: "Every project has a story.<br/>We’d love to hear yours.", write: "Write a testimonial", overToYou: "OVER TO YOU", formDescription: "Tell us about your experience. Your email stays private.", name: "Your name", company: "Company", email: "Email address", rating: "Your rating", experience: "Your experience",
    },
    credentialBadge: "Government of India · DPIIT",
};

const englishJourney: JourneyCopy = {
    aria: "The Path to Success interactive business journey",
    title: "Your path to <em>growth.</em>",
    description: "Every business starts with an idea. What happens next depends on the systems behind it.",
    start: "Start journey →",
    controls: "Use arrow keys or W A S D to move.",
    success: "From idea.<br/>To system.<br/><em>To growth.</em>",
    replay: "Replay journey",
    skip: "Skip experience",
    footer: "Continue to footer",
};

const translations: Partial<Record<SiteLocale, UiCopy>> = {
    es: {
        ...english,
        system: {...english.system, kicker: "ADAMANT · SISTEMA EN LÍNEA", title: "Un sistema.<br/>Todas las capacidades conectadas.", cta: "Encuentra tu próximo paso", footer: "Tecnología que impulsa tu negocio."},
        work: {...english.work, kicker: "NUESTRO TRABAJO", title: "Ideas convertidas en<br/>experiencias digitales.", description: "Explora nuestros sitios web y productos digitales.", buildCta: "Construyamos tu proyecto", all: "Todo el trabajo", loading: "Cargando proyectos…", something: "¿Tienes algo en mente?", conversation: "Iniciar conversación"},
        testimonials: {...english.testimonials, kicker: "TESTIMONIOS DE CLIENTES", title: "Tu experiencia.<br/>Con tus palabras.", description: "El buen trabajo empieza con una conversación.", loading: "Cargando testimonios…", write: "Escribir un testimonio", overToYou: "TE TOCA", formDescription: "Cuéntanos tu experiencia. Tu correo es privado."},
        credentialBadge: "Gobierno de India · DPIIT",
    },
    fr: {
        ...english,
        system: {...english.system, kicker: "ADAMANT · SYSTÈME EN LIGNE", title: "Un système.<br/>Chaque capacité connectée.", cta: "Trouver la prochaine étape", footer: "La technologie qui fait avancer votre activité."},
        work: {...english.work, kicker: "NOS RÉALISATIONS", title: "Des idées transformées en<br/>expériences numériques.", description: "Découvrez nos sites et produits numériques.", buildCta: "Construisons votre projet", all: "Toutes les réalisations", loading: "Chargement des projets…", something: "Une idée en tête ?", conversation: "Commencer la conversation"},
        testimonials: {...english.testimonials, kicker: "TÉMOIGNAGES CLIENTS", title: "Votre expérience.<br/>Avec vos mots.", description: "Un bon projet commence par une conversation.", loading: "Chargement des témoignages…", write: "Écrire un témoignage", overToYou: "À VOUS", formDescription: "Parlez-nous de votre expérience. Votre e-mail reste privé."},
        credentialBadge: "Gouvernement indien · DPIIT",
    },
    de: {
        ...english,
        system: {...english.system, kicker: "ADAMANT · SYSTEM ONLINE", title: "Ein System.<br/>Jede Fähigkeit verbunden.", cta: "Nächsten Schritt finden", footer: "Technologie, die Ihr Unternehmen voranbringt."},
        work: {...english.work, kicker: "UNSERE ARBEIT", title: "Ideen werden zu<br/>digitalen Erlebnissen.", description: "Entdecken Sie unsere Websites und digitalen Produkte.", buildCta: "Ihr Projekt starten", all: "Alle Projekte", loading: "Projekte werden geladen…", something: "Haben Sie eine Idee?", conversation: "Gespräch starten"},
        testimonials: {...english.testimonials, kicker: "KUNDENSTIMMEN", title: "Ihre Erfahrung.<br/>Ihre Worte.", description: "Gute Arbeit beginnt mit einem Gespräch.", loading: "Kundenstimmen werden geladen…", write: "Bewertung schreiben", overToYou: "SIE SIND DRAN", formDescription: "Erzählen Sie uns von Ihrer Erfahrung. Ihre E-Mail bleibt privat."},
        credentialBadge: "Indische Regierung · DPIIT",
    },
    pt: {
        ...english,
        system: {...english.system, kicker: "ADAMANT · SISTEMA ONLINE", title: "Um sistema.<br/>Todas as capacidades conectadas.", cta: "Encontrar o próximo passo", footer: "Tecnologia que impulsiona o seu negócio."},
        work: {...english.work, kicker: "NOSSO TRABALHO", title: "Ideias transformadas em<br/>experiências digitais.", description: "Explore os nossos sites e produtos digitais.", buildCta: "Vamos criar o seu projeto", all: "Todo o trabalho", loading: "A carregar projetos…", something: "Tem algo em mente?", conversation: "Iniciar conversa"},
        testimonials: {...english.testimonials, kicker: "DEPOIMENTOS DE CLIENTES", title: "A sua experiência.<br/>Nas suas palavras.", description: "Um bom trabalho começa com uma conversa.", loading: "A carregar depoimentos…", write: "Escrever um depoimento", overToYou: "É A SUA VEZ", formDescription: "Conte-nos a sua experiência. O seu e-mail é privado."},
        credentialBadge: "Governo da Índia · DPIIT",
    },
    ko: {
        ...english,
        system: {...english.system, kicker: "ADAMANT · 시스템 온라인", title: "하나의 시스템.<br/>모든 역량을 연결합니다.", cta: "다음 단계 찾기", footer: "비즈니스를 성장시키는 기술."},
        work: {...english.work, kicker: "우리의 작업", title: "아이디어를<br/>디지털 경험으로.", description: "웹사이트와 디지털 제품을 만나보세요.", buildCta: "프로젝트 시작하기", all: "전체 작업", loading: "프로젝트 로딩 중…", something: "생각해 둔 것이 있나요?", conversation: "상담 시작하기"},
        testimonials: {...english.testimonials, kicker: "고객 후기", title: "당신의 경험을.<br/>당신의 말로.", description: "좋은 작업은 대화에서 시작됩니다.", loading: "후기 로딩 중…", write: "후기 작성하기", overToYou: "이제 당신의 차례입니다", formDescription: "경험을 알려주세요. 이메일은 비공개입니다."},
        credentialBadge: "인도 정부 · DPIIT",
    },
    ar: {
        ...english,
        system: {...english.system, kicker: "ADAMANT · النظام متصل", title: "نظام واحد.<br/>كل القدرات متصلة.", cta: "اكتشف خطوتك التالية", footer: "تقنية تدفع أعمالك إلى الأمام."},
        work: {...english.work, kicker: "أعمالنا", title: "أفكار تتحول إلى<br/>تجارب رقمية.", description: "استكشف مواقعنا ومنتجاتنا الرقمية.", buildCta: "لنبدأ مشروعك", all: "كل الأعمال", loading: "جارٍ تحميل المشاريع…", something: "هل لديك فكرة؟", conversation: "ابدأ محادثة"},
        testimonials: {...english.testimonials, kicker: "آراء العملاء", title: "تجربتك.<br/>بكلماتك.", description: "العمل الجيد يبدأ بمحادثة.", loading: "جارٍ تحميل الآراء…", write: "اكتب رأيًا", overToYou: "دورك الآن", formDescription: "أخبرنا عن تجربتك. بريدك الإلكتروني خاص."},
        credentialBadge: "حكومة الهند · DPIIT",
    },
    bn: {
        ...english,
        system: {...english.system, kicker: "ADAMANT · সিস্টেম অনলাইন", title: "একটি সিস্টেম।<br/>সব সক্ষমতা সংযুক্ত।", cta: "পরবর্তী পদক্ষেপ খুঁজুন", footer: "আপনার ব্যবসাকে এগিয়ে নেওয়ার প্রযুক্তি।"},
        work: {...english.work, kicker: "আমাদের কাজ", title: "ভাবনা থেকে<br/>ডিজিটাল অভিজ্ঞতা।", description: "আমাদের ওয়েবসাইট ও ডিজিটাল পণ্য দেখুন।", buildCta: "আপনার প্রজেক্ট শুরু করুন", all: "সব কাজ", loading: "প্রজেক্ট লোড হচ্ছে…", something: "কিছু ভাবছেন?", conversation: "আলাপ শুরু করুন"},
        testimonials: {...english.testimonials, kicker: "গ্রাহকের মতামত", title: "আপনার অভিজ্ঞতা।<br/>আপনার কথায়।", description: "ভালো কাজ কথোপকথন দিয়ে শুরু হয়।", loading: "মতামত লোড হচ্ছে…", write: "মতামত লিখুন", overToYou: "এবার আপনার পালা", formDescription: "আপনার অভিজ্ঞতা জানান। ইমেল গোপন থাকবে।"},
        credentialBadge: "ভারত সরকার · DPIIT",
    },
    ta: {
        ...english,
        system: {...english.system, kicker: "ADAMANT · சிஸ்டம் ஆன்லைன்", title: "ஒரே அமைப்பு.<br/>அனைத்து திறன்களும் இணைந்தவை.", cta: "அடுத்த படியைக் கண்டறியுங்கள்", footer: "உங்கள் வணிகத்தை முன்னேற்றும் தொழில்நுட்பம்."},
        work: {...english.work, kicker: "எங்கள் பணிகள்", title: "யோசனைகள்<br/>டிஜிட்டல் அனுபவங்களாக.", description: "எங்கள் வலைத்தளங்கள் மற்றும் டிஜிட்டல் தயாரிப்புகளைப் பாருங்கள்.", buildCta: "உங்கள் திட்டத்தைத் தொடங்குங்கள்", all: "அனைத்தும்", loading: "திட்டங்கள் ஏற்றப்படுகின்றன…", something: "ஏதேனும் யோசனை உள்ளதா?", conversation: "உரையாடலைத் தொடங்குங்கள்"},
        testimonials: {...english.testimonials, kicker: "வாடிக்கையாளர் கருத்துகள்", title: "உங்கள் அனுபவம்.<br/>உங்கள் வார்த்தைகளில்.", description: "சிறந்த பணி உரையாடலுடன் தொடங்குகிறது.", loading: "கருத்துகள் ஏற்றப்படுகின்றன…", write: "கருத்து எழுதுங்கள்", overToYou: "இப்போது உங்கள் முறை", formDescription: "உங்கள் அனுபவத்தைப் பகிருங்கள். உங்கள் மின்னஞ்சல் தனிப்பட்டது."},
        credentialBadge: "இந்திய அரசு · DPIIT",
    },
    hi: {
        ...english,
        system: {...english.system, kicker: "ADAMANT · सिस्टम ऑनलाइन", title: "एक सिस्टम।<br/>हर क्षमता जुड़ी हुई।", cta: "अपना अगला कदम खोजें", footer: "आपके व्यवसाय को आगे बढ़ाने वाली तकनीक।", modules: english.system.modules.map((item, i) => [{name: "बनाएँ", detail: "ब्रीफ़ को तेज़ वेबसाइट, मोबाइल ऐप, SaaS प्रोडक्ट या आसान डिजिटल अनुभव में बदलें।"}, {name: "बढ़ाएँ", detail: "SEO, उपयोगी कंटेंट, सोशल मीडिया और कैंपेन से सही लोगों तक पहुँचें।"}, {name: "ऑटोमेट करें", detail: "AI वर्कफ़्लो, CRM और इंटीग्रेशन से दोहराए जाने वाले काम को बेहतर बनाएं।"}, {name: "जोड़ें", detail: "वेबसाइट, ऐप, मार्केटिंग और बिज़नेस टूल्स को एक साथ काम करने दें।"}, {name: "स्केल करें", detail: "डिज़ाइन, SEO, कंटेंट और प्रोडक्ट की नींव को आगे के लिए तैयार रखें।"}][i])},
        work: {...english.work, kicker: "हमारा काम", title: "विचारों से बने<br/>डिजिटल अनुभव।", description: "हमारी वेबसाइट और डिजिटल प्रोडक्ट्स देखें। विचार से लॉन्च तक के काम की झलक।", buildCta: "अपना प्रोजेक्ट बनाएं", all: "सभी काम", loading: "प्रोजेक्ट लोड हो रहे हैं…", something: "कुछ बनाने का विचार है?", conversation: "बातचीत शुरू करें"},
        testimonials: {...english.testimonials, kicker: "क्लाइंट प्रशंसापत्र", title: "आपका अनुभव।<br/>आपके शब्दों में।", description: "अच्छा काम बातचीत से शुरू होता है। हमारे साथ काम करने वालों का अनुभव जानें।", loading: "प्रशंसापत्र लोड हो रहे हैं…", write: "प्रशंसापत्र लिखें", overToYou: "अब आपकी बारी", formDescription: "अपना अनुभव बताएं। आपका ईमेल निजी रहेगा।"},
        credentialBadge: "भारत सरकार · DPIIT",
    },
    ja: {
        ...english,
        system: {...english.system, kicker: "ADAMANT · システム稼働中", title: "ひとつのシステム。<br/>すべての力をつなぐ。", cta: "次の一歩を見つける", footer: "ビジネスを前進させるテクノロジー。"},
        work: {...english.work, kicker: "実績", title: "アイデアを<br/>デジタル体験へ。", description: "ウェブサイトとデジタル製品をご覧ください。アイデアからローンチまでの実績をご紹介します。", buildCta: "プロジェクトを始める", all: "すべて", loading: "プロジェクトを読み込み中…", something: "何かお考えですか？", conversation: "相談を始める"},
        testimonials: {...english.testimonials, kicker: "お客様の声", title: "あなたの体験を。<br/>あなたの言葉で。", description: "良い仕事は会話から始まります。Adamantと働いた方々の声をご覧ください。", loading: "お客様の声を読み込み中…", write: "体験談を書く", overToYou: "あなたの番です", formDescription: "体験をお聞かせください。メールは非公開です。"},
        credentialBadge: "インド政府 · DPIIT",
    },
    "zh-cn": {
        ...english,
        system: {...english.system, kicker: "ADAMANT · 系统在线", title: "一个系统。<br/>连接每项能力。", cta: "找到下一步", footer: "推动业务前进的技术。"},
        work: {...english.work, kicker: "我们的作品", title: "将想法变成<br/>数字体验。", description: "探索我们的网站和数字产品，了解从想法到上线的作品。", buildCta: "打造你的项目", all: "全部作品", loading: "正在加载项目…", something: "有想法要实现吗？", conversation: "开始交流"},
        testimonials: {...english.testimonials, kicker: "客户评价", title: "你的体验。<br/>用你的话说。", description: "好的合作始于沟通，听听与 Adamant 合作过的客户怎么说。", loading: "正在加载评价…", write: "写下评价", overToYou: "轮到你了", formDescription: "告诉我们你的体验，邮箱将保持私密。"},
        credentialBadge: "印度政府 · DPIIT",
    },
};

export function getLocalizedUiCopy(locale: SiteLocale): UiCopy {
    return translations[locale] ?? english;
}

export function getLocalizedJourneyCopy(locale: SiteLocale): JourneyCopy {
    if (locale === "hi") return {...englishJourney, aria: "सफलता की राह इंटरैक्टिव बिज़नेस यात्रा", title: "आपकी <em>विकास की राह।</em>", description: "हर व्यवसाय एक विचार से शुरू होता है। आगे क्या होगा, यह उसके सिस्टम पर निर्भर करता है।", start: "यात्रा शुरू करें →", controls: "आगे बढ़ने के लिए ऐरो की या W A S D दबाएँ।", replay: "यात्रा फिर शुरू करें", skip: "अनुभव छोड़ें", footer: "फुटर पर जाएँ"};
    if (locale === "ja") return {...englishJourney, aria: "成功への道 インタラクティブなビジネス体験", title: "成長への<em>道。</em>", description: "すべてのビジネスはアイデアから始まります。その先は仕組みによって変わります。", start: "旅を始める →", controls: "矢印キーまたはW A S Dで進みます。", replay: "もう一度体験する", skip: "体験をスキップ", footer: "フッターへ進む"};
    if (locale === "zh-cn") return {...englishJourney, aria: "通往成功的互动商业体验", title: "你的<em>成长之路。</em>", description: "每个企业都始于一个想法。接下来会怎样，取决于背后的系统。", start: "开始旅程 →", controls: "使用方向键或 W A S D 移动。", replay: "重新体验", skip: "跳过体验", footer: "继续到底部"};
    return englishJourney;
}
