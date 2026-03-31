import {
    DEFAULT_SITE_LOCALE,
    SiteLocale,
} from "@/lib/site-locale";

interface LabeledItem {
    title: string;
    description: string;
}

interface FaqItem {
    question: string;
    answer: string;
}

interface ServiceItem {
    title: string;
    description: string;
    detail: string;
    image: string;
}

interface ProcessItem {
    number: string;
    title: string;
    description: string;
}

interface ContactOption {
    value: string;
    label: string;
}

export interface SiteCopy {
    locale: SiteLocale;
    dir: "ltr" | "rtl";
    metadata: {
        title: string;
        description: string;
    };
    schema: {
        organizationDescription: string;
    };
    navbar: {
        navItems: Array<{ name: string; anchor: string }>;
        startProject: string;
        lightMode: string;
        darkMode: string;
        languageAriaLabel: string;
    };
    hero: {
        kicker: string;
        title: string;
        description: string;
        primaryCta: string;
        secondaryCta: string;
        positioningPoints: string[];
        previewEyebrowLeft: string;
        previewEyebrowRight: string;
        floatingBadges: string[];
        featureCards: LabeledItem[];
    };
    valueProps: {
        kicker: string;
        title: string;
        description: string;
        items: LabeledItem[];
    };
    services: {
        kicker: string;
        title: string;
        description: string;
        chips: string[];
        items: ServiceItem[];
    };
    process: {
        kicker: string;
        title: string;
        description: string;
        steps: ProcessItem[];
    };
    faq: {
        kicker: string;
        title: string;
        description: string;
        items: FaqItem[];
    };
    contact: {
        kicker: string;
        title: string;
        description: string;
        highlights: LabeledItem[];
        briefTitle: string;
        briefDescription: string;
        briefItems: LabeledItem[];
        form: {
            fullNameLabel: string;
            fullNamePlaceholder: string;
            emailLabel: string;
            emailPlaceholder: string;
            purposeLabel: string;
            purposePlaceholder: string;
            descriptionLabel: string;
            descriptionPlaceholder: string;
            purposeOptions: ContactOption[];
            submitLabel: string;
            submittingLabel: string;
            successLabel: string;
            configError: string;
            sendError: string;
            successToast: string;
        };
    };
    footer: {
        description: string;
        sections: Array<{
            title: string;
            links: Array<{ name: string; anchor: string }>;
        }>;
        copyright: string;
        tagline: string;
    };
}

const siteCopyMap: Record<SiteLocale, SiteCopy> = {
    en: {
        locale: "en",
        dir: "ltr",
        metadata: {
            title: "The Adamant",
            description: "The Adamant designs websites, UX systems, and mobile experiences with a stronger first impression, sharper messaging, and SEO-ready foundations.",
        },
        schema: {
            organizationDescription: "The Adamant designs websites, product interfaces, and mobile experiences with clear messaging, fast performance, and SEO-ready foundations.",
        },
        navbar: {
            navItems: [
                {name: "Services", anchor: "services"},
                {name: "Process", anchor: "process"},
                {name: "FAQ", anchor: "faq"},
                {name: "Contact", anchor: "contact"},
            ],
            startProject: "Start a project",
            lightMode: "Light mode",
            darkMode: "Dark mode",
            languageAriaLabel: "Change website language",
        },
        hero: {
            kicker: "Design, development, and SEO-ready structure",
            title: "Make the first screen impossible to ignore.",
            description: "The Adamant creates websites, UX systems, and mobile experiences that look premium, explain your offer clearly, and give search engines the structure they need from day one.",
            primaryCta: "Start your project",
            secondaryCta: "Explore services",
            positioningPoints: [
                "Clear messaging that explains value in seconds",
                "Semantic structure that helps search engines understand the page",
                "Responsive layouts built to feel polished on every device",
            ],
            previewEyebrowLeft: "Launch-ready digital presence",
            previewEyebrowRight: "Strategy to shipping",
            floatingBadges: ["Modern motion", "Search-ready", "Conversion-led"],
            featureCards: [
                {
                    title: "Attention-first design",
                    description: "Hierarchy, contrast, and motion that guide the eye fast.",
                },
                {
                    title: "SEO foundations",
                    description: "Metadata, semantic sections, and search-readable copy.",
                },
                {
                    title: "Fast-moving execution",
                    description: "Launch momentum without bloated layouts or vague messaging.",
                },
            ],
        },
        valueProps: {
            kicker: "Why this works",
            title: "A better homepage should do more than look good.",
            description: "It should guide attention, explain value quickly, and create enough confidence that a new visitor wants to stay on the page. These improvements focus on exactly that.",
            items: [
                {
                    title: "Hook attention quickly",
                    description: "Use stronger hierarchy, clearer copy, and more intentional visuals so visitors immediately understand the offer and feel the brand has substance.",
                },
                {
                    title: "Build SEO into the foundation",
                    description: "Support search visibility with semantic sections, better metadata, FAQ content, internal anchors, and keyword-rich supporting copy.",
                },
                {
                    title: "Earn trust before the first call",
                    description: "Shape the page to feel more credible and premium, so users are more willing to keep scrolling, click through, and submit an inquiry.",
                },
            ],
        },
        services: {
            kicker: "Services",
            title: "Design and development services built to convert interest into action.",
            description: "From UI/UX design to SEO-friendly website development and mobile app delivery, each service is shaped to help you look credible quickly and keep momentum after launch.",
            chips: ["Landing pages", "Marketing websites", "Product interfaces", "Cross-platform mobile apps"],
            items: [
                {
                    title: "UI/UX Design",
                    description: "Clean, modern, and user-friendly designs that engage and convert.",
                    detail: "Landing page design, website redesign, responsive interface design, wireframes, user journeys, and conversion-focused layouts built to improve trust, engagement, and lead generation.",
                    image: "/images/img-ui-ux-design.png",
                },
                {
                    title: "Website Development",
                    description: "Fast, scalable, and SEO-friendly websites tailored to your business.",
                    detail: "Responsive website development, performance optimization, technical SEO foundations, clean front-end architecture, and business websites designed to rank better and convert more visitors.",
                    image: "/images/img-web-dev.png",
                },
                {
                    title: "Mobile App Development",
                    description: "High-performance apps with sleek design and seamless functionality.",
                    detail: "Cross-platform mobile app development, mobile app UI design, smooth onboarding flows, scalable product experiences, and user-friendly app interfaces for Android and iOS growth.",
                    image: "/images/img-app-dev.png",
                },
            ],
        },
        process: {
            kicker: "Process",
            title: "A simple path from rough presence to a sharper digital brand.",
            description: "Early-stage websites improve fastest when strategy, design, development, and SEO are treated as one system instead of separate tasks.",
            steps: [
                {
                    number: "01",
                    title: "Clarify the positioning",
                    description: "Define the audience, offer, and message so the page speaks clearly instead of sounding generic.",
                },
                {
                    number: "02",
                    title: "Shape the experience",
                    description: "Turn that positioning into a design system, content hierarchy, and interaction pattern that feels deliberate.",
                },
                {
                    number: "03",
                    title: "Build for performance",
                    description: "Develop the site with responsive layouts, cleaner structure, and practical SEO improvements already in place.",
                },
                {
                    number: "04",
                    title: "Launch with momentum",
                    description: "Refine the final touchpoints so the page is ready to attract, persuade, and convert the right visitors.",
                },
            ],
        },
        faq: {
            kicker: "FAQ",
            title: "Questions people often have before they reach out.",
            description: "These answers also strengthen the page semantically by giving search engines clearer context around your services and how the site is meant to help.",
            items: [
                {
                    question: "What kind of projects does The Adamant handle?",
                    answer: "The Adamant focuses on UI/UX design, website development, and mobile app experiences for brands that want a sharper digital presence and a stronger first impression.",
                },
                {
                    question: "Can the website be made more SEO-friendly from the beginning?",
                    answer: "Yes. Strong metadata, crawlable section structure, useful supporting copy, internal anchor links, and FAQ content can all be built into the site early instead of being added later as cleanup.",
                },
                {
                    question: "Why does homepage structure matter so much?",
                    answer: "The homepage usually decides whether a new visitor keeps scrolling or leaves. Clear hierarchy, focused messaging, and visible next steps help users understand value quickly and move toward contact.",
                },
                {
                    question: "Does design affect conversions as much as development?",
                    answer: "It does when the design improves clarity. Better layout, pacing, contrast, and call-to-action placement reduce hesitation and make the site feel more credible, which supports conversion.",
                },
            ],
        },
        contact: {
            kicker: "Contact",
            title: "Tell us what you want to build.",
            description: "If the goal is to make a stronger first impression, improve clarity, or build a search-friendly foundation, this is the right place to start. Share your scope, timeline, and what success should look like.",
            highlights: [
                {
                    title: "Share the real goal",
                    description: "Tell us what you want users to understand, feel, or do when they land on the page.",
                },
                {
                    title: "Expect a focused reply",
                    description: "We can shape the right mix of design, development, and SEO foundations around your scope.",
                },
                {
                    title: "Move at launch speed",
                    description: "The process is meant to keep momentum high, especially for early-stage websites and product ideas.",
                },
            ],
            briefTitle: "A better brief gets a sharper first reply.",
            briefDescription: "If you already have these details, include them so the first response can be more specific.",
            briefItems: [
                {
                    title: "Business goal",
                    description: "What should this page, product, or launch help you achieve?",
                },
                {
                    title: "Launch timing",
                    description: "Share the target window so the scope can match the pace.",
                },
                {
                    title: "References",
                    description: "Links, examples, or competitors help us understand the direction quickly.",
                },
            ],
            form: {
                fullNameLabel: "Full name",
                fullNamePlaceholder: "Rahul Patel",
                emailLabel: "Email Address",
                emailPlaceholder: "rahulpatel@example.com",
                purposeLabel: "Select purpose",
                purposePlaceholder: "Select purpose...",
                descriptionLabel: "Description",
                descriptionPlaceholder: "Tell us about the page, product, or experience you want users to remember.",
                purposeOptions: [
                    {value: "general", label: "General Inquiry"},
                    {value: "demo", label: "Request a Demo"},
                    {value: "quote", label: "Get a Quote / Pricing"},
                    {value: "support", label: "Technical Support"},
                    {value: "partnership", label: "Partnership / Collaboration"},
                    {value: "careers", label: "Career Opportunities"},
                    {value: "feedback", label: "Feedback / Suggestions"},
                    {value: "other", label: "Other"},
                ],
                submitLabel: "Send project details",
                submittingLabel: "Sending project details...",
                successLabel: "Message captured. The button will return in a few seconds.",
                configError: "EmailJS is not fully configured yet. Add the template ID and public key to continue.",
                sendError: "Could not send the message right now. Please try again.",
                successToast: "Project details sent.",
            },
        },
        footer: {
            description: "Design-forward websites, product interfaces, and mobile experiences built to earn trust quickly and support search visibility from the start.",
            sections: [
                {
                    title: "Navigate",
                    links: [
                        {name: "Home", anchor: ""},
                        {name: "Services", anchor: "services"},
                        {name: "Process", anchor: "process"},
                        {name: "FAQ", anchor: "faq"},
                        {name: "Contact", anchor: "contact"},
                    ],
                },
                {
                    title: "Focus Areas",
                    links: [
                        {name: "UI/UX Design", anchor: "services"},
                        {name: "Website Development", anchor: "services"},
                        {name: "Mobile Apps", anchor: "services"},
                    ],
                },
            ],
            copyright: "The Adamant. All rights reserved.",
            tagline: "Designed for clarity, speed, and stronger first impressions.",
        },
    },
    hi: {
        locale: "hi",
        dir: "ltr",
        metadata: {
            title: "The Adamant | वेबसाइट डिज़ाइन, डेवलपमेंट और SEO",
            description: "The Adamant प्रीमियम वेबसाइट, UX सिस्टम और मोबाइल अनुभव बनाता है जो मजबूत पहली छाप, बेहतर संदेश और SEO-ready संरचना देते हैं।",
        },
        schema: {
            organizationDescription: "The Adamant वेबसाइट, प्रोडक्ट इंटरफेस और मोबाइल अनुभव बनाता है जिनमें साफ संदेश, तेज प्रदर्शन और SEO-ready foundations होती हैं।",
        },
        navbar: {
            navItems: [
                {name: "सेवाएँ", anchor: "services"},
                {name: "प्रक्रिया", anchor: "process"},
                {name: "FAQ", anchor: "faq"},
                {name: "संपर्क", anchor: "contact"},
            ],
            startProject: "प्रोजेक्ट शुरू करें",
            lightMode: "लाइट मोड",
            darkMode: "डार्क मोड",
            languageAriaLabel: "वेबसाइट भाषा बदलें",
        },
        hero: {
            kicker: "डिज़ाइन, डेवलपमेंट और SEO-ready संरचना",
            title: "पहली स्क्रीन को नज़रअंदाज़ करना मुश्किल बनाइए।",
            description: "The Adamant ऐसी वेबसाइट, UX सिस्टम और मोबाइल अनुभव बनाता है जो प्रीमियम दिखें, आपकी पेशकश को साफ़ तरीके से समझाएँ और search engines को पहले दिन से सही संरचना दें।",
            primaryCta: "अपना प्रोजेक्ट शुरू करें",
            secondaryCta: "सेवाएँ देखें",
            positioningPoints: [
                "स्पष्ट संदेश जो कुछ सेकंड में value समझा दे",
                "Semantic structure जो search engines को पेज समझने में मदद करे",
                "Responsive layouts जो हर डिवाइस पर polished महसूस हों",
            ],
            previewEyebrowLeft: "लॉन्च के लिए तैयार डिजिटल प्रेज़ेंस",
            previewEyebrowRight: "रणनीति से शिपिंग तक",
            floatingBadges: ["आधुनिक motion", "Search-ready", "Conversion-led"],
            featureCards: [
                {
                    title: "Attention-first design",
                    description: "Hierarchy, contrast और motion जो नज़र को जल्दी guide करें।",
                },
                {
                    title: "SEO foundations",
                    description: "Metadata, semantic sections और search-friendly copy.",
                },
                {
                    title: "तेज़ execution",
                    description: "बिना भारी layouts या vague messaging के launch momentum.",
                },
            ],
        },
        valueProps: {
            kicker: "यह क्यों काम करता है",
            title: "एक बेहतर homepage सिर्फ अच्छा दिखना ही नहीं चाहिए।",
            description: "उसे attention guide करनी चाहिए, value जल्दी समझानी चाहिए और इतना trust बनाना चाहिए कि नया visitor पेज पर बना रहे। यही सुधार यहाँ केंद्र में हैं।",
            items: [
                {
                    title: "ध्यान जल्दी खींचें",
                    description: "मज़बूत hierarchy, साफ copy और purposeful visuals visitors को offer तुरंत समझने में मदद करते हैं।",
                },
                {
                    title: "SEO को नींव में जोड़ें",
                    description: "Semantic sections, बेहतर metadata, FAQ content और keyword-rich copy search visibility को शुरुआत से support करते हैं।",
                },
                {
                    title: "पहली call से पहले trust बनाएँ",
                    description: "पेज को अधिक credible और premium बनाइए ताकि लोग scroll करें, click करें और inquiry भेजें।",
                },
            ],
        },
        services: {
            kicker: "सेवाएँ",
            title: "डिज़ाइन और डेवलपमेंट सेवाएँ जो interest को action में बदलें।",
            description: "UI/UX design, SEO-friendly website development और mobile app delivery के साथ हर service आपकी brand presence को तेज़ और credible बनाने के लिए shape की जाती है।",
            chips: ["Landing pages", "Marketing websites", "Product interfaces", "Cross-platform mobile apps"],
            items: [
                {
                    title: "UI/UX डिज़ाइन",
                    description: "साफ, आधुनिक और user-friendly designs जो engagement और conversion बढ़ाएँ।",
                    detail: "Landing page design, website redesign, responsive interface design, wireframes, user journeys और conversion-focused layouts जो trust, engagement और lead generation बेहतर करें।",
                    image: "/images/img-ui-ux-design.png",
                },
                {
                    title: "वेबसाइट डेवलपमेंट",
                    description: "तेज़, scalable और SEO-friendly websites जो आपके business के लिए tailored हों।",
                    detail: "Responsive website development, performance optimization, technical SEO foundations, clean front-end architecture और business websites जो बेहतर rank करें और ज़्यादा visitors convert करें।",
                    image: "/images/img-web-dev.png",
                },
                {
                    title: "मोबाइल ऐप डेवलपमेंट",
                    description: "स्लीक design और seamless functionality के साथ high-performance apps.",
                    detail: "Cross-platform mobile app development, mobile app UI design, smooth onboarding flows, scalable product experiences और user-friendly app interfaces for Android and iOS growth.",
                    image: "/images/img-app-dev.png",
                },
            ],
        },
        process: {
            kicker: "प्रक्रिया",
            title: "एक simple path जो rough presence को sharper digital brand में बदलता है।",
            description: "Early-stage websites सबसे तेज़ तब improve होती हैं जब strategy, design, development और SEO को एक ही system की तरह handle किया जाए।",
            steps: [
                {
                    number: "01",
                    title: "Positioning स्पष्ट करें",
                    description: "Audience, offer और message define करें ताकि पेज generic न लगे बल्कि साफ़ बोले।",
                },
                {
                    number: "02",
                    title: "Experience shape करें",
                    description: "उस positioning को design system, content hierarchy और interaction pattern में बदलें जो deliberate महसूस हो।",
                },
                {
                    number: "03",
                    title: "Performance के लिए build करें",
                    description: "Responsive layouts, cleaner structure और practical SEO improvements के साथ site develop करें।",
                },
                {
                    number: "04",
                    title: "Momentum के साथ launch करें",
                    description: "Final touchpoints refine करें ताकि पेज सही visitors को attract, persuade और convert कर सके।",
                },
            ],
        },
        faq: {
            kicker: "FAQ",
            title: "वे सवाल जो लोग संपर्क करने से पहले अक्सर पूछते हैं।",
            description: "ये answers search engines को आपकी services और page intent के बारे में clearer context भी देते हैं।",
            items: [
                {
                    question: "The Adamant किस तरह के projects handle करता है?",
                    answer: "The Adamant UI/UX design, website development और mobile app experiences पर काम करता है, खासकर उन brands के लिए जो sharper digital presence और stronger first impression चाहते हैं।",
                },
                {
                    question: "क्या वेबसाइट को शुरुआत से ही SEO-friendly बनाया जा सकता है?",
                    answer: "हाँ। Strong metadata, crawlable structure, useful supporting copy, internal anchors और FAQ content को शुरुआत से build किया जा सकता है।",
                },
                {
                    question: "Homepage structure इतना महत्वपूर्ण क्यों है?",
                    answer: "Homepage अक्सर तय करता है कि visitor आगे scroll करेगा या नहीं। Clear hierarchy, focused messaging और visible next steps value को जल्दी समझाते हैं।",
                },
                {
                    question: "क्या design conversions पर development जितना असर डालता है?",
                    answer: "हाँ, जब design clarity बढ़ाता है। बेहतर layout, pacing, contrast और CTA placement hesitation कम करते हैं और credibility बढ़ाते हैं।",
                },
            ],
        },
        contact: {
            kicker: "संपर्क",
            title: "बताइए आप क्या बनाना चाहते हैं।",
            description: "अगर आपका लक्ष्य बेहतर first impression, ज़्यादा clarity या search-friendly foundation बनाना है, तो यहीं से शुरुआत करें। अपना scope, timeline और success की definition साझा करें।",
            highlights: [
                {
                    title: "असल goal बताइए",
                    description: "बताइए कि users को landing के बाद क्या समझना, महसूस करना या करना चाहिए।",
                },
                {
                    title: "Focused reply पाएँ",
                    description: "हम आपके scope के लिए सही design, development और SEO mix shape कर सकते हैं।",
                },
                {
                    title: "Launch speed पर चलें",
                    description: "यह process momentum बनाए रखने के लिए है, खासकर early-stage websites और product ideas के लिए।",
                },
            ],
            briefTitle: "बेहतर brief से पहली reply और sharp होती है।",
            briefDescription: "अगर ये details आपके पास हैं, तो उन्हें शामिल करें ताकि पहला जवाब ज़्यादा specific हो।",
            briefItems: [
                {
                    title: "Business goal",
                    description: "यह page, product या launch आपके लिए क्या हासिल करे?",
                },
                {
                    title: "Launch timing",
                    description: "Target window बताइए ताकि scope उसी pace के अनुसार तय हो।",
                },
                {
                    title: "References",
                    description: "Links, examples या competitors direction जल्दी समझने में मदद करते हैं।",
                },
            ],
            form: {
                fullNameLabel: "पूरा नाम",
                fullNamePlaceholder: "राहुल पटेल",
                emailLabel: "ईमेल पता",
                emailPlaceholder: "rahulpatel@example.com",
                purposeLabel: "उद्देश्य चुनें",
                purposePlaceholder: "उद्देश्य चुनें...",
                descriptionLabel: "विवरण",
                descriptionPlaceholder: "उस page, product या experience के बारे में बताइए जिसे आप चाहते हैं कि users याद रखें।",
                purposeOptions: [
                    {value: "general", label: "सामान्य पूछताछ"},
                    {value: "demo", label: "डेमो का अनुरोध"},
                    {value: "quote", label: "कोट / प्राइसिंग"},
                    {value: "support", label: "तकनीकी सहायता"},
                    {value: "partnership", label: "पार्टनरशिप / सहयोग"},
                    {value: "careers", label: "कैरियर अवसर"},
                    {value: "feedback", label: "फ़ीडबैक / सुझाव"},
                    {value: "other", label: "अन्य"},
                ],
                submitLabel: "प्रोजेक्ट विवरण भेजें",
                submittingLabel: "प्रोजेक्ट विवरण भेजे जा रहे हैं...",
                successLabel: "संदेश दर्ज हो गया है। बटन कुछ सेकंड में वापस आ जाएगा।",
                configError: "EmailJS अभी पूरी तरह configured नहीं है। आगे बढ़ने के लिए template ID और public key जोड़ें।",
                sendError: "अभी संदेश भेजा नहीं जा सका। कृपया फिर से कोशिश करें।",
                successToast: "प्रोजेक्ट विवरण भेज दिया गया।",
            },
        },
        footer: {
            description: "Design-forward websites, product interfaces और mobile experiences जो जल्दी trust बनाते हैं और शुरुआत से search visibility support करते हैं।",
            sections: [
                {
                    title: "नेविगेट करें",
                    links: [
                        {name: "होम", anchor: ""},
                        {name: "सेवाएँ", anchor: "services"},
                        {name: "प्रक्रिया", anchor: "process"},
                        {name: "FAQ", anchor: "faq"},
                        {name: "संपर्क", anchor: "contact"},
                    ],
                },
                {
                    title: "फोकस क्षेत्र",
                    links: [
                        {name: "UI/UX डिज़ाइन", anchor: "services"},
                        {name: "वेबसाइट डेवलपमेंट", anchor: "services"},
                        {name: "मोबाइल ऐप्स", anchor: "services"},
                    ],
                },
            ],
            copyright: "The Adamant. सर्वाधिकार सुरक्षित।",
            tagline: "Clarity, speed और stronger first impressions के लिए designed.",
        },
    },
    es: {
        locale: "es",
        dir: "ltr",
        metadata: {
            title: "The Adamant | Diseno web, desarrollo y SEO",
            description: "The Adamant crea sitios web, sistemas UX y experiencias moviles con una primera impresion mas fuerte, mensajes claros y bases preparadas para SEO.",
        },
        schema: {
            organizationDescription: "The Adamant diseña sitios web, interfaces de producto y experiencias móviles con mensajes claros, rendimiento rápido y bases listas para SEO.",
        },
        navbar: {
            navItems: [
                {name: "Servicios", anchor: "services"},
                {name: "Proceso", anchor: "process"},
                {name: "FAQ", anchor: "faq"},
                {name: "Contacto", anchor: "contact"},
            ],
            startProject: "Iniciar proyecto",
            lightMode: "Modo claro",
            darkMode: "Modo oscuro",
            languageAriaLabel: "Cambiar idioma del sitio",
        },
        hero: {
            kicker: "Diseno, desarrollo y estructura lista para SEO",
            title: "Haz que la primera pantalla sea imposible de ignorar.",
            description: "The Adamant crea sitios web, sistemas UX y experiencias móviles que se ven premium, explican tu oferta con claridad y dan a los motores de búsqueda la estructura que necesitan desde el primer día.",
            primaryCta: "Inicia tu proyecto",
            secondaryCta: "Explorar servicios",
            positioningPoints: [
                "Mensajes claros que explican el valor en segundos",
                "Estructura semántica que ayuda a los motores de búsqueda a entender la página",
                "Layouts responsive que se sienten pulidos en cada dispositivo",
            ],
            previewEyebrowLeft: "Presencia digital lista para lanzar",
            previewEyebrowRight: "De estrategia a entrega",
            floatingBadges: ["Movimiento moderno", "Listo para búsqueda", "Orientado a conversión"],
            featureCards: [
                {
                    title: "Diseño que captura atención",
                    description: "Jerarquía, contraste y motion que guían la vista rápidamente.",
                },
                {
                    title: "Bases SEO",
                    description: "Metadata, secciones semánticas y copy fácil de leer para buscadores.",
                },
                {
                    title: "Ejecución rápida",
                    description: "Impulso de lanzamiento sin layouts pesados ni mensajes vagos.",
                },
            ],
        },
        valueProps: {
            kicker: "Por que funciona",
            title: "Una mejor homepage debe hacer mas que verse bien.",
            description: "Debe guiar la atención, explicar el valor con rapidez y generar suficiente confianza para que una visita nueva quiera quedarse en la página.",
            items: [
                {
                    title: "Captura atención rápido",
                    description: "Una jerarquía más fuerte, mejor copy y visuales más intencionales ayudan a entender la oferta de inmediato.",
                },
                {
                    title: "Integra SEO desde la base",
                    description: "Secciones semánticas, metadata, FAQ e internal links ayudan a mejorar la visibilidad desde el inicio.",
                },
                {
                    title: "Genera confianza antes de la primera llamada",
                    description: "La página se siente más creíble y premium, así más personas siguen explorando y enviando una consulta.",
                },
            ],
        },
        services: {
            kicker: "Servicios",
            title: "Servicios de diseno y desarrollo pensados para convertir interes en accion.",
            description: "Desde UI/UX hasta desarrollo web preparado para SEO y apps móviles, cada servicio se define para que tu marca gane credibilidad y avance con más velocidad.",
            chips: ["Landing pages", "Sitios de marketing", "Interfaces de producto", "Apps móviles multiplataforma"],
            items: [
                {
                    title: "Diseno UI/UX",
                    description: "Disenos limpios, modernos y faciles de usar que conectan y convierten.",
                    detail: "Diseño de landing pages, rediseño web, interfaces responsive, wireframes, user journeys y layouts enfocados en conversión para mejorar confianza, engagement y leads.",
                    image: "/images/img-ui-ux-design.png",
                },
                {
                    title: "Desarrollo Web",
                    description: "Sitios rápidos, escalables y SEO-friendly adaptados a tu negocio.",
                    detail: "Desarrollo web responsive, optimización de rendimiento, fundamentos técnicos de SEO, arquitectura front-end limpia y sitios de negocio pensados para posicionar y convertir mejor.",
                    image: "/images/img-web-dev.png",
                },
                {
                    title: "Desarrollo de Apps Moviles",
                    description: "Apps de alto rendimiento con diseño elegante y funcionalidad fluida.",
                    detail: "Desarrollo móvil multiplataforma, diseño UI para apps, onboarding fluido, experiencias escalables y interfaces fáciles de usar para crecer en Android e iOS.",
                    image: "/images/img-app-dev.png",
                },
            ],
        },
        process: {
            kicker: "Proceso",
            title: "Un camino simple para pasar de una presencia basica a una marca digital mas afinada.",
            description: "Los sitios en etapa temprana mejoran más rápido cuando estrategia, diseño, desarrollo y SEO se tratan como un solo sistema.",
            steps: [
                {
                    number: "01",
                    title: "Aclarar el posicionamiento",
                    description: "Define audiencia, oferta y mensaje para que la página hable con claridad y no suene genérica.",
                },
                {
                    number: "02",
                    title: "Dar forma a la experiencia",
                    description: "Convierte ese posicionamiento en un sistema visual, jerarquía de contenido e interacciones más intencionales.",
                },
                {
                    number: "03",
                    title: "Construir para rendimiento",
                    description: "Desarrolla el sitio con layouts responsive, estructura más limpia y mejoras SEO prácticas desde el inicio.",
                },
                {
                    number: "04",
                    title: "Lanzar con impulso",
                    description: "Refina los últimos detalles para que la página esté lista para atraer, persuadir y convertir a las personas correctas.",
                },
            ],
        },
        faq: {
            kicker: "FAQ",
            title: "Preguntas que la gente suele tener antes de escribir.",
            description: "Estas respuestas también fortalecen la página semánticamente y dan más contexto a los motores de búsqueda.",
            items: [
                {
                    question: "Que tipo de proyectos realiza The Adamant?",
                    answer: "The Adamant se enfoca en diseño UI/UX, desarrollo web y experiencias móviles para marcas que quieren una presencia digital más fuerte y una mejor primera impresión.",
                },
                {
                    question: "Se puede hacer el sitio mas amigable para SEO desde el principio?",
                    answer: "Sí. Metadata sólida, estructura rastreable, copy útil, enlaces internos y FAQ pueden integrarse desde el inicio del proyecto.",
                },
                {
                    question: "Por que la estructura del homepage importa tanto?",
                    answer: "El homepage suele decidir si una persona sigue explorando o se va. Jerarquía clara, mensajes enfocados y siguientes pasos visibles ayudan a entender el valor rápido.",
                },
                {
                    question: "El diseno impacta las conversiones tanto como el desarrollo?",
                    answer: "Sí, cuando el diseño mejora la claridad. Mejor layout, ritmo, contraste y CTAs bien colocados reducen dudas y aumentan la credibilidad.",
                },
            ],
        },
        contact: {
            kicker: "Contacto",
            title: "Cuéntanos que quieres construir.",
            description: "Si el objetivo es mejorar la primera impresión, ganar claridad o crear una base más amigable para búsqueda, este es el lugar para empezar. Comparte alcance, tiempos y cómo se vería el éxito.",
            highlights: [
                {
                    title: "Comparte el objetivo real",
                    description: "Cuéntanos qué deben entender, sentir o hacer las personas cuando lleguen a la página.",
                },
                {
                    title: "Recibe una respuesta enfocada",
                    description: "Podemos definir la mezcla correcta de diseño, desarrollo y bases SEO según tu alcance.",
                },
                {
                    title: "Avanza a ritmo de lanzamiento",
                    description: "El proceso está pensado para mantener el impulso, especialmente en sitios y productos en etapa temprana.",
                },
            ],
            briefTitle: "Un mejor brief genera una respuesta inicial mas precisa.",
            briefDescription: "Si ya tienes estos datos, inclúyelos para que la primera respuesta sea más específica.",
            briefItems: [
                {
                    title: "Objetivo de negocio",
                    description: "Qué debería ayudarte a lograr esta página, producto o lanzamiento?",
                },
                {
                    title: "Fecha de lanzamiento",
                    description: "Comparte el plazo objetivo para ajustar el alcance al ritmo correcto.",
                },
                {
                    title: "Referencias",
                    description: "Links, ejemplos o competidores ayudan a entender la dirección más rápido.",
                },
            ],
            form: {
                fullNameLabel: "Nombre completo",
                fullNamePlaceholder: "Rahul Patel",
                emailLabel: "Correo electrónico",
                emailPlaceholder: "rahulpatel@example.com",
                purposeLabel: "Selecciona el motivo",
                purposePlaceholder: "Selecciona el motivo...",
                descriptionLabel: "Descripción",
                descriptionPlaceholder: "Cuéntanos sobre la página, producto o experiencia que quieres que la gente recuerde.",
                purposeOptions: [
                    {value: "general", label: "Consulta general"},
                    {value: "demo", label: "Solicitar demo"},
                    {value: "quote", label: "Cotización / precios"},
                    {value: "support", label: "Soporte técnico"},
                    {value: "partnership", label: "Alianza / colaboración"},
                    {value: "careers", label: "Oportunidades laborales"},
                    {value: "feedback", label: "Comentarios / sugerencias"},
                    {value: "other", label: "Otro"},
                ],
                submitLabel: "Enviar detalles del proyecto",
                submittingLabel: "Enviando detalles del proyecto...",
                successLabel: "Mensaje recibido. El botón volverá en unos segundos.",
                configError: "EmailJS todavía no está configurado por completo. Agrega el template ID y la public key para continuar.",
                sendError: "No se pudo enviar el mensaje ahora mismo. Inténtalo de nuevo.",
                successToast: "Detalles del proyecto enviados.",
            },
        },
        footer: {
            description: "Sitios web, interfaces de producto y experiencias móviles pensadas para generar confianza rápido y apoyar la visibilidad en búsqueda desde el inicio.",
            sections: [
                {
                    title: "Navegar",
                    links: [
                        {name: "Inicio", anchor: ""},
                        {name: "Servicios", anchor: "services"},
                        {name: "Proceso", anchor: "process"},
                        {name: "FAQ", anchor: "faq"},
                        {name: "Contacto", anchor: "contact"},
                    ],
                },
                {
                    title: "Enfoques",
                    links: [
                        {name: "Diseno UI/UX", anchor: "services"},
                        {name: "Desarrollo web", anchor: "services"},
                        {name: "Apps móviles", anchor: "services"},
                    ],
                },
            ],
            copyright: "The Adamant. Todos los derechos reservados.",
            tagline: "Diseñado para claridad, velocidad y mejores primeras impresiones.",
        },
    },
    fr: {
        locale: "fr",
        dir: "ltr",
        metadata: {
            title: "The Adamant | Design web, developpement et SEO",
            description: "The Adamant conçoit des sites web, des systemes UX et des experiences mobiles avec une meilleure premiere impression, un message plus clair et des bases pretes pour le SEO.",
        },
        schema: {
            organizationDescription: "The Adamant conçoit des sites web, des interfaces produit et des expériences mobiles avec des messages clairs, de bonnes performances et des fondations prêtes pour le SEO.",
        },
        navbar: {
            navItems: [
                {name: "Services", anchor: "services"},
                {name: "Processus", anchor: "process"},
                {name: "FAQ", anchor: "faq"},
                {name: "Contact", anchor: "contact"},
            ],
            startProject: "Demarrer un projet",
            lightMode: "Mode clair",
            darkMode: "Mode sombre",
            languageAriaLabel: "Changer la langue du site",
        },
        hero: {
            kicker: "Design, developpement et structure prete pour le SEO",
            title: "Rendez le premier ecran impossible a ignorer.",
            description: "The Adamant crée des sites web, des systèmes UX et des expériences mobiles qui paraissent premium, expliquent clairement votre offre et donnent aux moteurs de recherche la structure dont ils ont besoin dès le premier jour.",
            primaryCta: "Lancer votre projet",
            secondaryCta: "Voir les services",
            positioningPoints: [
                "Un message clair qui explique la valeur en quelques secondes",
                "Une structure semantique qui aide les moteurs de recherche a comprendre la page",
                "Des layouts responsive qui paraissent soignes sur chaque appareil",
            ],
            previewEyebrowLeft: "Presence digitale prete pour le lancement",
            previewEyebrowRight: "De la strategie a la livraison",
            floatingBadges: ["Motion moderne", "Pret pour la recherche", "Oriente conversion"],
            featureCards: [
                {
                    title: "Design qui capte l'attention",
                    description: "Hiérarchie, contraste et motion qui guident le regard rapidement.",
                },
                {
                    title: "Fondations SEO",
                    description: "Metadata, sections sémantiques et copy lisible par les moteurs.",
                },
                {
                    title: "Execution rapide",
                    description: "Un lancement efficace sans layouts lourds ni message flou.",
                },
            ],
        },
        valueProps: {
            kicker: "Pourquoi cela fonctionne",
            title: "Une meilleure homepage doit faire plus que simplement etre belle.",
            description: "Elle doit guider l'attention, expliquer rapidement la valeur et créer assez de confiance pour qu'une nouvelle visite reste sur la page.",
            items: [
                {
                    title: "Capter l'attention rapidement",
                    description: "Une meilleure hiérarchie, un copy plus clair et des visuels plus intentionnels aident à comprendre l'offre immédiatement.",
                },
                {
                    title: "Integrer le SEO dans la base",
                    description: "Des sections sémantiques, une metadata solide, une FAQ et des liens internes améliorent la visibilité dès le départ.",
                },
                {
                    title: "Creer la confiance avant le premier appel",
                    description: "La page paraît plus crédible et premium, ce qui encourage les personnes à continuer, cliquer et envoyer une demande.",
                },
            ],
        },
        services: {
            kicker: "Services",
            title: "Des services de design et de developpement pensés pour transformer l'interet en action.",
            description: "Du design UI/UX au développement web prêt pour le SEO et aux apps mobiles, chaque service est pensé pour rendre votre présence plus crédible et plus performante.",
            chips: ["Landing pages", "Sites marketing", "Interfaces produit", "Apps mobiles multiplateformes"],
            items: [
                {
                    title: "Design UI/UX",
                    description: "Des designs propres, modernes et faciles a utiliser qui engagent et convertissent.",
                    detail: "Design de landing pages, refonte de site, interfaces responsive, wireframes, parcours utilisateur et layouts orientés conversion pour renforcer la confiance, l'engagement et les leads.",
                    image: "/images/img-ui-ux-design.png",
                },
                {
                    title: "Developpement Web",
                    description: "Des sites rapides, evolutifs et SEO-friendly adaptes a votre activite.",
                    detail: "Développement web responsive, optimisation des performances, fondations techniques SEO, architecture front-end propre et sites business conçus pour mieux se positionner et convertir davantage.",
                    image: "/images/img-web-dev.png",
                },
                {
                    title: "Developpement d'Apps Mobiles",
                    description: "Des applications performantes avec un design elegant et une experience fluide.",
                    detail: "Développement mobile multiplateforme, design UI d'application, onboarding fluide, expériences évolutives et interfaces simples pour Android et iOS.",
                    image: "/images/img-app-dev.png",
                },
            ],
        },
        process: {
            kicker: "Processus",
            title: "Un chemin simple pour passer d'une presence basique a une marque digitale plus nette.",
            description: "Les sites en phase de lancement progressent plus vite lorsque stratégie, design, développement et SEO sont traités comme un seul système.",
            steps: [
                {
                    number: "01",
                    title: "Clarifier le positionnement",
                    description: "Définissez l'audience, l'offre et le message afin que la page parle avec clarté au lieu de sembler générique.",
                },
                {
                    number: "02",
                    title: "Structurer l'experience",
                    description: "Transformez ce positionnement en système visuel, hiérarchie de contenu et interactions cohérentes.",
                },
                {
                    number: "03",
                    title: "Construire pour la performance",
                    description: "Développez le site avec des layouts responsive, une structure plus propre et des améliorations SEO pratiques déjà intégrées.",
                },
                {
                    number: "04",
                    title: "Lancer avec elan",
                    description: "Affinez les derniers points pour que la page soit prête à attirer, convaincre et convertir les bons visiteurs.",
                },
            ],
        },
        faq: {
            kicker: "FAQ",
            title: "Les questions que les gens se posent souvent avant de vous contacter.",
            description: "Ces réponses renforcent aussi la page sémantiquement et donnent plus de contexte aux moteurs de recherche.",
            items: [
                {
                    question: "Quels types de projets The Adamant prend-il en charge ?",
                    answer: "The Adamant se concentre sur le design UI/UX, le développement web et les expériences mobiles pour les marques qui veulent une présence digitale plus forte et une meilleure première impression.",
                },
                {
                    question: "Peut-on rendre le site plus SEO-friendly des le depart ?",
                    answer: "Oui. Une metadata solide, une structure explorable, un copy utile, des liens internes et une FAQ peuvent être intégrés très tôt dans le projet.",
                },
                {
                    question: "Pourquoi la structure de la homepage compte-t-elle autant ?",
                    answer: "La homepage décide souvent si une nouvelle visite continue de faire défiler ou quitte la page. Une hiérarchie claire et des prochains pas visibles font comprendre la valeur plus vite.",
                },
                {
                    question: "Le design influence-t-il les conversions autant que le developpement ?",
                    answer: "Oui, lorsque le design améliore la clarté. Un meilleur layout, un bon rythme, du contraste et des appels à l'action bien placés réduisent l'hésitation et renforcent la crédibilité.",
                },
            ],
        },
        contact: {
            kicker: "Contact",
            title: "Dites-nous ce que vous voulez construire.",
            description: "Si l'objectif est de créer une meilleure première impression, d'améliorer la clarté ou de poser une base plus solide pour la recherche, c'est le bon point de départ. Partagez votre scope, votre timing et votre définition du succès.",
            highlights: [
                {
                    title: "Partagez le vrai objectif",
                    description: "Expliquez ce que les personnes doivent comprendre, ressentir ou faire lorsqu'elles arrivent sur la page.",
                },
                {
                    title: "Recevez une reponse ciblee",
                    description: "Nous pouvons définir la bonne combinaison entre design, développement et bases SEO selon votre scope.",
                },
                {
                    title: "Avancez au rythme du lancement",
                    description: "Le processus est pensé pour garder de l'élan, surtout pour les sites et produits en phase de lancement.",
                },
            ],
            briefTitle: "Un meilleur brief permet une premiere reponse plus precise.",
            briefDescription: "Si vous avez déjà ces informations, ajoutez-les pour recevoir une réponse initiale plus utile.",
            briefItems: [
                {
                    title: "Objectif business",
                    description: "Que doit vous apporter cette page, ce produit ou ce lancement ?",
                },
                {
                    title: "Timing de lancement",
                    description: "Partagez la fenêtre visée pour ajuster le scope au bon rythme.",
                },
                {
                    title: "References",
                    description: "Des liens, exemples ou concurrents aident à comprendre la direction plus vite.",
                },
            ],
            form: {
                fullNameLabel: "Nom complet",
                fullNamePlaceholder: "Rahul Patel",
                emailLabel: "Adresse email",
                emailPlaceholder: "rahulpatel@example.com",
                purposeLabel: "Selectionnez l'objectif",
                purposePlaceholder: "Selectionnez l'objectif...",
                descriptionLabel: "Description",
                descriptionPlaceholder: "Parlez-nous de la page, du produit ou de l'expérience que vous voulez rendre mémorable.",
                purposeOptions: [
                    {value: "general", label: "Demande générale"},
                    {value: "demo", label: "Demander une démo"},
                    {value: "quote", label: "Devis / tarifs"},
                    {value: "support", label: "Support technique"},
                    {value: "partnership", label: "Partenariat / collaboration"},
                    {value: "careers", label: "Opportunités de carrière"},
                    {value: "feedback", label: "Retours / suggestions"},
                    {value: "other", label: "Autre"},
                ],
                submitLabel: "Envoyer les details du projet",
                submittingLabel: "Envoi des details du projet...",
                successLabel: "Message reçu. Le bouton reviendra dans quelques secondes.",
                configError: "EmailJS n'est pas encore entièrement configuré. Ajoutez le template ID et la public key pour continuer.",
                sendError: "Impossible d'envoyer le message pour le moment. Veuillez réessayer.",
                successToast: "Détails du projet envoyés.",
            },
        },
        footer: {
            description: "Des sites web, interfaces produit et expériences mobiles conçus pour créer rapidement la confiance et soutenir la visibilité dans les moteurs de recherche dès le départ.",
            sections: [
                {
                    title: "Navigation",
                    links: [
                        {name: "Accueil", anchor: ""},
                        {name: "Services", anchor: "services"},
                        {name: "Processus", anchor: "process"},
                        {name: "FAQ", anchor: "faq"},
                        {name: "Contact", anchor: "contact"},
                    ],
                },
                {
                    title: "Axes",
                    links: [
                        {name: "Design UI/UX", anchor: "services"},
                        {name: "Développement web", anchor: "services"},
                        {name: "Apps mobiles", anchor: "services"},
                    ],
                },
            ],
            copyright: "The Adamant. Tous droits réservés.",
            tagline: "Pensé pour la clarté, la vitesse et une meilleure première impression.",
        },
    },
};

export function getSiteCopy(locale: SiteLocale): SiteCopy {
    return siteCopyMap[locale] ?? siteCopyMap[DEFAULT_SITE_LOCALE];
}
