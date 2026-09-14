"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "hi" | "ta" | "mr" | "te";

interface Translations {
    [key: string]: {
        en: string;
        hi: string;
        ta: string;
        mr: string;
        te: string;
    };
}

const translations: Translations = {
    // Navigation & Sidebar
    "nav.navigation": { en: "Navigation", hi: "नेविगेशन", ta: "வழிகாட்டல்", mr: "नेव्हिगेशन", te: "నావిగేషన్" },
    "nav.dashboard": { en: "Dashboard", hi: "डैशबोर्ड", ta: "முகப்பு", mr: "डॅशबोर्ड", te: "డ్యాష్‌బోర్డ్" },
    "nav.schemes": { en: "Browse Schemes", hi: "योजनाएं खोजें", ta: "திட்டங்களை தேடுங்கள்", mr: "योजना शोधा", te: "పథకాలను శోధించండి" },
    "nav.ai-finder": { en: "AI Finder", hi: "एआई खोजकर्ता", ta: "AI திட்டம் தேடல்", mr: "एआय शोध", te: "AI ఫైండర్" },
    "nav.eligibility": { en: "My Eligibility", hi: "मेरी पात्रता", ta: "எனது தகுதி", mr: "माझी पात्रता", te: "నా అర్హత" },
    "nav.applications": { en: "My Applications", hi: "मेरे आवेदन", ta: "எனது விண்ணப்பங்கள்", mr: "माझे अर्ज", te: "నా దరఖాస్తులు" },
    "nav.documents": { en: "Document Vault", hi: "दस्तावेज़ वॉल्ट", ta: "ஆவணப் பெட்டகம்", mr: "दस्तऐवज वॉल्ट", te: "పత్రాల వాల్ట్" },
    "nav.centers": { en: "Find CSC Centers", hi: "सीएससी केंद्र खोजें", ta: "CSC மையங்களைக் கண்டறியவும்", mr: "सीएससी केंद्र शोधा", te: "CSC కేంద్రాలు" },
    "nav.whatsapp-bot": { en: "WhatsApp Gateway", hi: "व्हाट्सएप गेटवे", ta: "வாட்ஸ்அப் நுழைவாயில்", mr: "व्हॉट्सॲप गेटवे", te: "వాట్సాప్ గేట్‌వే" },
    "nav.grievances": { en: "My Grievances", hi: "मेरी शिकायतें", ta: "எனது குறைகள்", mr: "माझ्या तक्रारी", te: "నా ఫిర్యాదులు" },
    "nav.chat": { en: "AI Assistant", hi: "एआई सहायक", ta: "AI உதவியாளர்", mr: "एआय सहाय्यक", te: "AI సహాయకుడు" },
    "nav.announcements": { en: "Announcements", hi: "घोषणाएं", ta: "அறிவிப்புகள்", mr: "घोषणा", te: "ప్రకటనలు" },
    "nav.profile": { en: "Edit Profile", hi: "प्रोफ़ाइल संपादित करें", ta: "சுயவிவரம் திருத்தவும்", mr: "प्रोफाइल संपादित करा", te: "ప్రొఫైల్ సవరణ" },
    "nav.admin_panel": { en: "Admin Panel", hi: "व्यवस्थापक पैनल", ta: "நிர்வாகக் குழு", mr: "प्रशासक पॅनेल", te: "అడ్మిన్ ప్యానెల్" },
    "nav.quick_access": { en: "Quick Access", hi: "त्वरित पहुंच", ta: "விரைவு அணுகல்", mr: "त्वरित प्रवेश", te: "త్వరిత ప్రాప్యత" },
    "nav.my_account": { en: "My Account", hi: "मेरा खाता", ta: "எனது கணக்கு", mr: "माझे खाते", te: "నా ఖాతా" },
    "nav.sign_out": { en: "Sign Out", hi: "साइन आउट", ta: "வெளியேறு", mr: "साइन आउट करा", te: "లాగ్ అవుట్" },

    // Admin Navigation
    "nav.stats": { en: "Platform Stats", hi: "प्लेटफ़ॉर्म आंकड़े", ta: "தள புள்ளிவிவரங்கள்", mr: "प्लॅटफॉर्म आकडेवारी", te: "ప్లాట్‌ఫామ్ గణాంకాలు" },
    "nav.users": { en: "Manage Users", hi: "उपयोगकर्ता प्रबंधन", ta: "பயனர்களை நிர்வகிக்கவும்", mr: "वापरकर्ते व्यवस्थापित करा", te: "వినియోగదారుల నిర్వహణ" },
    "nav.manage_schemes": { en: "Manage Schemes", hi: "योजना प्रबंधन", ta: "திட்டங்களை நிர்வகிக்கவும்", mr: "योजना व्यवस्थापित करा", te: "పథకాల నిర్వహణ" },
    "nav.manage_applications": { en: "Manage Applications", hi: "आवेदन प्रबंधन", ta: "விண்ணப்பங்களை நிர்வகிக்கவும்", mr: "अर्ज व्यवस्थापित करा", te: "దరఖాస్తుల నిర్వహణ" },
    "nav.manage_grievances": { en: "Manage Grievances", hi: "शिकायत प्रबंधन", ta: "குறைதீர்ப்பு நிர்வாகம்", mr: "तक्रार निवारण", te: "ఫిర్యాదుల పరిష్కారం" },

    // Schemes Banner
    "schemes.banner_tag": { en: "National Welfare Directory", hi: "राष्ट्रीय कल्याण निर्देशिका", ta: "தேசிய நல அடைவு", mr: "राष्ट्रीय कल्याण निर्देशिका", te: "జాతీయ సంక్షేమ డైరెక్టరీ" },
    "schemes.banner_title": { en: "Browse Government Schemes", hi: "सरकारी योजनाएं देखें", ta: "அரசுத் திட்டங்களை ஆராயுங்கள்", mr: "सरकारी योजना शोधा", te: "ప్రభుత్వ పథకాలను బ్రౌజ్ చేయండి" },
    "schemes.banner_desc": { en: "Explore and filter official Central and State Government welfare programs", hi: "आधिकारिक केंद्र और राज्य सरकार के कल्याणकारी कार्यक्रमों को खोजें और फ़िल्टर करें", ta: "அதிகாரப்பூர்வ மத்திய மற்றும் மாநில அரசு நலத்திட்டங்களை கண்டறிந்து வடிகட்டவும்", mr: "अधिकृत केंद्र आणि राज्य सरकारच्या कल्याणकारी योजना शोधा आणि फिल्टर करा", te: "అధికారిక కేంద్ర మరియు రాష్ట్ర ప్రభుత్వ సంక్షేమ పథకాలను అన్వేషించండి మరియు ఫిల్టర్ చేయండి" },
    "schemes.schemes_available": { en: "Schemes Available", hi: "योजनाएं उपलब्ध", ta: "திட்டங்கள் கிடைக்கின்றன", mr: "योजना उपलब्ध", te: "అందుబాటులో ఉన్న పథకాలు" },

    // Schemes Page & Filters
    "filters.title": { en: "Filters", hi: "फ़िल्टर", ta: "வடிகட்டிகள்", mr: "फिल्टर", te: "ఫిల్టర్లు" },
    "filters.reset": { en: "Reset", hi: "रीसेट करें", ta: "மீட்டமை", mr: "रीसेट करा", te: "రీసెట్" },
    "filters.reset_all": { en: "Reset All Filters", hi: "सभी फ़िल्टर रीसेट करें", ta: "அனைத்து வடிகட்டிகளையும் மீட்டமை", mr: "सर्व फिल्टर रीसेट करा", te: "అన్ని ఫిల్టర్లను రీసెట్ చేయండి" },
    "filters.state": { en: "State / UT", hi: "राज्य / केंद्र शासित प्रदेश", ta: "மாநிலம் / யூனியன் பிரதேசம்", mr: "राज्य / केंद्रशासित प्रदेश", te: "రాష్ట్రం / కేంద్రపాలిత ప్రాంతం" },
    "filters.all_states": { en: "All States & UTs", hi: "सभी राज्य और केंद्र शासित प्रदेश", ta: "அனைத்து மாநிலங்கள் & யூனியன் பிரதேசங்கள்", mr: "सर्व राज्ये आणि केंद्रशासित प्रदेश", te: "అన్ని రాష్ట్రాలు & కేంద్రపాలిత ప్రాంతాలు" },
    "filters.level": { en: "Scheme Level", hi: "योजना स्तर", ta: "திட்ட நிலை", mr: "योजना स्तर", te: "పథకం స్థాయి" },
    "filters.all": { en: "All", hi: "सभी", ta: "அனைத்தும்", mr: "सर्व", te: "అన్నీ" },
    "filters.central": { en: "Central", hi: "केंद्रीय", ta: "மத்திய அரசு", mr: "केंद्रीय", te: "కేంద్ర" },
    "filters.state_level": { en: "State", hi: "राज्य", ta: "மாநில அரசு", mr: "राज्य", te: "రాష్ట్ర" },
    "filters.gender": { en: "Beneficiary Gender", hi: "लाभार्थी लिंग", ta: "பயனாளி பாலினம்", mr: "लाभार्थी लिंग", te: "లబ్ధిదారు లింగం" },
    "filters.all_genders": { en: "All Genders", hi: "सभी लिंग", ta: "அனைத்து பாலினங்களும்", mr: "सर्व लिंग", te: "అన్ని లింగాలు" },
    "filters.women_only": { en: "Women Only", hi: "केवल महिलाएं", ta: "பெண்கள் மட்டும்", mr: "फक्त महिला", te: "మహిళలకు మాత్రమే" },
    "filters.men": { en: "Men", hi: "पुरुष", ta: "ஆண்கள்", mr: "पुरुष", te: "పురుషులు" },
    "filters.transgender": { en: "Transgender", hi: "ट्रांसजेंडर", ta: "திருநங்கைகள்", mr: "तृतीयपंथी", te: "ట్రాన్స్‌జెండర్" },
    "filters.categories": { en: "Categories", hi: "श्रेणियां", ta: "பிரிவுகள்", mr: "श्रेण्या", te: "విభాగాలు" },
    "filters.all_categories": { en: "All Categories", hi: "सभी श्रेणियां", ta: "அனைத்துப் பிரிவுகளும்", mr: "सर्व श्रेण्या", te: "అన్ని విభాగాలు" },
    "filters.search_placeholder": { en: "Search 4,700+ schemes by keyword, ministry, benefit, or qualification…", hi: "4,700+ योजनाओं में कीवर्ड, मंत्रालय, लाभ या योग्यता द्वारा खोजें…", ta: "4,700+ திட்டங்களை திறவுச்சொல், அமைச்சகம் அல்லது பயன் மூலம் தேடுங்கள்…", mr: "कीवर्ड, मंत्रालय, लाभ किंवा पात्रतेनुसार 4,700+ योजना शोधा…", te: "కీవర్డ్, మంత్రిత్వ శాఖ లేదా ప్రయోజనం ద్వారా 4,700+ పథకాలను శోధించండి…" },
    "filters.no_schemes_found": { en: "No matching schemes found", hi: "कोई मेल खाती योजना नहीं मिली", ta: "பொருந்தும் திட்டங்கள் எதுவும் கிடைக்கவில்லை", mr: "कोणतीही जुळणारी योजना सापडली नाही", te: "సరిపోలే పథకాలు ఏవీ కనుగొనబడలేదు" },
    "filters.no_schemes_desc": { en: "Try adjusting your search terms, changing the state filter, or clearing your selected category.", hi: "अपने खोज शब्दों को समायोजित करने, राज्य फ़िल्टर बदलने या चयनित श्रेणी को हटाने का प्रयास करें।", ta: "உங்கள் தேடல் சொற்களை மாற்றவும், மாநில வடிகட்டியை மாற்றவும் அல்லது வகையை அழிக்கவும்.", mr: "तुमचे शोध शब्द बदलून पहा, राज्य फिल्टर बदला किंवा निवडलेली श्रेणी हटवा.", te: "మీ శోధన పదాలను సర్దుబాటు చేయడానికి, రాష్ట్ర ఫిల్టర్‌ను మార్చడానికి లేదా ఎంచుకున్న విభాగాన్ని తీసివేయడానికి ప్రయత్నించండి." },

    // Scheme Card & Badges
    "card.view_details": { en: "View Details", hi: "विवरण देखें", ta: "விவரங்களைக் காண்க", mr: "तपशील पहा", te: "వివరాలు చూడండి" },
    "card.portal": { en: "Portal", hi: "पोर्टल", ta: "போர்டல்", mr: "पोर्टल", te: "పోర్టల్" },
    "card.central_govt": { en: "Central Govt", hi: "केंद्र सरकार", ta: "மத்திய அரசு", mr: "केंद्र सरकार", te: "కేంద్ర ప్రభుత్వం" },
    "card.state_welfare": { en: "State Welfare", hi: "राज्य कल्याण", ta: "மாநில நலத்திட்டம்", mr: "राज्य कल्याण", te: "రాష్ట్ర సంక్షేమం" },
    "badge.eligible": { en: "Eligible & Verified", hi: "पात्र और सत्यापित", ta: "தகுதியுடையது & சரிபார்க்கப்பட்டது", mr: "पात्र आणि पडताळणीकृत", te: "అర్హత & ధృవీకరించబడింది" },
    "badge.docs_pending": { en: "Documents Pending", hi: "दस्तावेज़ लंबित", ta: "ஆவணங்கள் நிலுவையில் உள்ளன", mr: "दस्तऐवज प्रलंबित", te: "పత్రాలు పెండింగ్‌లో ఉన్నాయి" },
    "badge.not_eligible": { en: "Not Eligible", hi: "पात्र नहीं", ta: "தகுதியற்றது", mr: "पात्र नाही", te: "అర్హత లేదు" },
    "badge.incomplete": { en: "Profile Incomplete", hi: "अपूर्ण प्रोफ़ाइल", ta: "முழுமையடையாத சுயவிவரம்", mr: "अपूर्ण प्रोफाइल", te: "ప్రొఫైల్ అసంపూర్ణం" },

    // Pagination & General
    "pagination.prev": { en: "Previous", hi: "पिछला", ta: "முந்தைய", mr: "मागील", te: "మునుపటి" },
    "pagination.next": { en: "Next", hi: "अगला", ta: "அடுத்தது", mr: "पुढील", te: "తరువాతి" },
    "pagination.showing": { en: "Showing", hi: "दिखाया जा रहा है", ta: "காண்பிக்கப்படுகிறது", mr: "दाखवत आहे", te: "చూపిస్తోంది" },
    "pagination.of": { en: "of", hi: "का", ta: "இல்", mr: "पैकी", te: "లో" },
    "pagination.schemes": { en: "schemes", hi: "योजनाएं", ta: "திட்டங்கள்", mr: "योजना", te: "పథకాలు" },
    "pagination.page": { en: "Page", hi: "पृष्ठ", ta: "பக்கம்", mr: "पृष्ठ", te: "పేజీ" },
    "pagination.for": { en: "for", hi: "के लिए", ta: "க்கான", mr: "साठी", te: "కోసం" },

    // Category Translations
    "category.Agriculture": { en: "Agriculture", hi: "कृषि", ta: "வேளாண்மை", mr: "कृषी", te: "వ్యవసాయం" },
    "category.Education": { en: "Education", hi: "शिक्षा", ta: "கல்வி", mr: "शिक्षण", te: "విద్య" },
    "category.Health": { en: "Health", hi: "स्वास्थ्य", ta: "சுகாதாரம்", mr: "आरोग्य", te: "ఆరోగ్యం" },
    "category.Housing": { en: "Housing", hi: "आवास", ta: "வீட்டுவசதி", mr: "गृहनिर्माण", te: "గృహనిర్మాణం" },
    "category.Women & Child": { en: "Women & Child", hi: "महिला एवं बाल विकास", ta: "பெண்கள் மற்றும் குழந்தைகள்", mr: "महिला व बाल विकास", te: "మహిళలు & శిశు సంక్షేమం" },
    "category.Employment": { en: "Employment", hi: "रोजगार", ta: "வேலைவாய்ப்பு", mr: "रोजगार", te: "ఉపాధి" },
    "category.Social Security": { en: "Social Security", hi: "सामाजिक सुरक्षा", ta: "சமூக பாதுகாப்பு", mr: "सामाजिक सुरक्षा", te: "సామాజిక భద్రత" },
    "category.Financial Inclusion": { en: "Financial Inclusion", hi: "वित्तीय समावेशन", ta: "நிதி உள்ளடக்கம்", mr: "आर्थिक समावेशन", te: "ఆర్థిక చేరిక" },
    "category.General": { en: "General Welfare", hi: "सामान्य कल्याण", ta: "பொது நலன்", mr: "सामान्य कल्याण", te: "సాధారణ సంక్షేమం" },
    "category.Agriculture, Rural & Environment": { en: "Agriculture, Rural & Environment", hi: "कृषि, ग्रामीण और पर्यावरण", ta: "விவசாயம், கிராமப்புறம் & சுற்றுச்சூழல்", mr: "कृषी, ग्रामीण आणि पर्यावरण", te: "వ్యవసాయం, గ్రామీణ & పర్యావరణం" },
    "category.Education & Learning": { en: "Education & Learning", hi: "शिक्षा और ज्ञान", ta: "கல்வி மற்றும் கற்றல்", mr: "शिक्षण आणि अध्ययन", te: "విద్య మరియు అభ్యాసం" },
    "category.Health & Wellness": { en: "Health & Wellness", hi: "स्वास्थ्य और कल्याण", ta: "சுகாதாரம் மற்றும் நல்வாழ்வு", mr: "आरोग्य आणि कल्याण", te: "ఆరోగ్యం మరియు శ్రేయస్సు" },
    "category.Banking, Financial Services and Insurance": { en: "Banking, Financial Services and Insurance", hi: "बैंकिंग, वित्तीय सेवाएं और बीमा", ta: "வங்கி, நிதி சேவைகள் & காப்பீடு", mr: "बँकिंग, वित्तीय सेवा आणि विमा", te: "బ్యాంకింగ్, ఆర్థిక సేవలు & బీమా" },
    "category.Social welfare & Empowerment": { en: "Social welfare & Empowerment", hi: "समाज कल्याण एवं सशक्तिकरण", ta: "சமூக நலன் & அதிகாரமளித்தல்", mr: "समाजकल्याण आणि सक्षमीकरण", te: "సామాజిక సంక్షేమం & సాధికారత" },
    "category.Business & Entrepreneurship": { en: "Business & Entrepreneurship", hi: "व्यापार और उद्यमिता", ta: "வணிகம் மற்றும் தொழில்முனைவு", mr: "व्यवसाय आणि उद्योजकता", te: "వ్యాపారం & వ్యవస్థాపకత" },
    "category.Housing & Shelter": { en: "Housing & Shelter", hi: "आवास और आश्रय", ta: "வீட்டுவசதி & தங்குமிடம்", mr: "गृहनिर्माण आणि निवारा", te: "గృహనిర్మాణం & ఆశ్రయం" },
    "category.Public Safety, Law & Justice": { en: "Public Safety, Law & Justice", hi: "सार्वजनिक सुरक्षा, कानून और न्याय", ta: "பொது பாதுகாப்பு, சட்டம் & நீதி", mr: "सार्वजनिक सुरक्षा, कायदा आणि न्याय", te: "ప్రజా భద్రత, చట్టం & న్యాయం" },
    "category.Skills & Employment": { en: "Skills & Employment", hi: "कौशल और रोजगार", ta: "திறன்கள் மற்றும் வேலைவாய்ப்பு", mr: "कौशल्ये आणि रोजगार", te: "నైపుణ్యాలు & ఉపాధి" },
    "category.Science, IT & Communications": { en: "Science, IT & Communications", hi: "विज्ञान, आईटी और संचार", ta: "அறிவியல், தகவல் தொழில்நுட்பம் & தகவல் தொடர்பு", mr: "विज्ञान, आयटी आणि दळणवळण", te: "సైన్స్, ఐటీ & కమ్యూనికేషన్స్" },
    "category.Sports & Culture": { en: "Sports & Culture", hi: "खेल और संस्कृति", ta: "விளையாட்டு மற்றும் கலாச்சாரம்", mr: "क्रीडा आणि संस्कृती", te: "క్రీడలు & సంస్కృతి" },
    "category.Travel & Tourism": { en: "Travel & Tourism", hi: "यात्रा और पर्यटन", ta: "பயணம் மற்றும் சுற்றுலா", mr: "प्रवास आणि पर्यटन", te: "ప్రయాణం & పర్యాటకం" },
    "category.Utility & Sanitation": { en: "Utility & Sanitation", hi: "उपयोगिता और स्वच्छता", ta: "பயன்பாடு மற்றும் சுகாதாரம்", mr: "उपयुक्तता आणि स्वच्छता", te: "యుటిలిటీ & పారిశుధ్యం" },

    // Indian States & UTs
    "state.All States & UTs": { en: "All States & UTs", hi: "सभी राज्य और केंद्र शासित प्रदेश", ta: "அனைத்து மாநிலங்கள் & யூனியன் பிரதேசங்கள்", mr: "सर्व राज्ये आणि केंद्रशासित प्रदेश", te: "అన్ని రాష్ట్రాలు & కేంద్రపాలిత ప్రాంతాలు" },
    "state.Central": { en: "Central", hi: "केंद्रीय (अखिल भारतीय)", ta: "மத்திய அரசு (அனைத்து இந்தியா)", mr: "केंद्रीय (अखिल भारतीय)", te: "కేంద్ర (అఖిల భారత)" },
    "state.Andhra Pradesh": { en: "Andhra Pradesh", hi: "आंध्र प्रदेश", ta: "ஆந்திரப் பிரதேசம்", mr: "आंध्र प्रदेश", te: "ఆంధ్రప్రదేశ్" },
    "state.Arunachal Pradesh": { en: "Arunachal Pradesh", hi: "अरुणाचल प्रदेश", ta: "அருணாச்சலப் பிரதேசம்", mr: "अरुणाचल प्रदेश", te: "అరుణాచల్ ప్రదేశ్" },
    "state.Assam": { en: "Assam", hi: "असम", ta: "அசாம்", mr: "आसाम", te: "అస్సాం" },
    "state.Bihar": { en: "Bihar", hi: "बिहार", ta: "பீகார்", mr: "बिहार", te: "బీహార్" },
    "state.Chhattisgarh": { en: "Chhattisgarh", hi: "छत्तीसगढ़", ta: "சத்தீஸ்கர்", mr: "छत्तीसगड", te: "ఛత్తీస్‌గఢ్" },
    "state.Delhi": { en: "Delhi", hi: "दिल्ली", ta: "தில்லி", mr: "दिल्ली", te: "ఢిల్లీ" },
    "state.Goa": { en: "Goa", hi: "गोवा", ta: "கோவா", mr: "गोवा", te: "గోవా" },
    "state.Gujarat": { en: "Gujarat", hi: "गुजरात", ta: "குஜராத்", mr: "गुजरात", te: "గుజరాత్" },
    "state.Haryana": { en: "Haryana", hi: "हरियाणा", ta: "ஹரியானா", mr: "हरियाणा", te: "హర్యానా" },
    "state.Himachal Pradesh": { en: "Himachal Pradesh", hi: "हिमाचल प्रदेश", ta: "இமாச்சலப் பிரதேசம்", mr: "हिमाचल प्रदेश", te: "హిమాచల్ ప్రదేశ్" },
    "state.Jammu and Kashmir": { en: "Jammu and Kashmir", hi: "जम्मू और कश्मीर", ta: "ஜம்மு மற்றும் காஷ்மீர்", mr: "जम्मू आणि काश्मीर", te: "జమ్మూ కాశ్మీర్" },
    "state.Jharkhand": { en: "Jharkhand", hi: "झारखंड", ta: "ஜார்கண்ட்", mr: "झारखंड", te: "జార్ఖండ్" },
    "state.Karnataka": { en: "Karnataka", hi: "कर्नाटक", ta: "கர்நாடகா", mr: "कर्नाटक", te: "కర్ణాటక" },
    "state.Kerala": { en: "Kerala", hi: "केरल", ta: "கேரளா", mr: "केरळ", te: "కేరళ" },
    "state.Ladakh": { en: "Ladakh", hi: "लद्दाख", ta: "லடாக்", mr: "लडाख", te: "లడఖ్" },
    "state.Madhya Pradesh": { en: "Madhya Pradesh", hi: "मध्य प्रदेश", ta: "மத்தியப் பிரதேசம்", mr: "मध्य प्रदेश", te: "మధ్యప్రదేశ్" },
    "state.Maharashtra": { en: "Maharashtra", hi: "महाराष्ट्र", ta: "மகாராஷ்டிரா", mr: "महाराष्ट्र", te: "మహారాష్ట్ర" },
    "state.Manipur": { en: "Manipur", hi: "मणिपुर", ta: "மணிப்பூர்", mr: "मणिपूर", te: "మణిపూర్" },
    "state.Meghalaya": { en: "Meghalaya", hi: "मेघालय", ta: "மேகாலயா", mr: "मेघालय", te: "మేఘాలయ" },
    "state.Mizoram": { en: "Mizoram", hi: "मिजोरम", ta: "மிசோரம்", mr: "मिझोराम", te: "మిజోరం" },
    "state.Nagaland": { en: "Nagaland", hi: "नागालैंड", ta: "நாகாலாந்து", mr: "नागालँड", te: "నాగాలాండ్" },
    "state.Odisha": { en: "Odisha", hi: "ओडिशा", ta: "ஒடிசா", mr: "ओडिशा", te: "ఒడిశా" },
    "state.Punjab": { en: "Punjab", hi: "पंजाब", ta: "பஞ்சாப்", mr: "पंजाब", te: "పంజాబ్" },
    "state.Rajasthan": { en: "Rajasthan", hi: "राजस्थान", ta: "ராஜஸ்தான்", mr: "राजस्थान", te: "రాజస్థాన్" },
    "state.Sikkim": { en: "Sikkim", hi: "सिक्किम", ta: "சிக்கிம்", mr: "सिक्कीम", te: "సిక్కిం" },
    "state.Tamil Nadu": { en: "Tamil Nadu", hi: "तमिलनाडु", ta: "தமிழ்நாடு", mr: "तमिळनाडू", te: "తమిళనాడు" },
    "state.Telangana": { en: "Telangana", hi: "तेलंगाना", ta: "தெலுங்கானா", mr: "तेलंगणा", te: "తెలంగాణ" },
    "state.Tripura": { en: "Tripura", hi: "त्रिपुरा", ta: "திரிபுரா", mr: "त्रिपुरा", te: "త్రిపుర" },
    "state.Uttar Pradesh": { en: "Uttar Pradesh", hi: "उत्तर प्रदेश", ta: "உத்தரப் பிரதேசம்", mr: "उत्तर प्रदेश", te: "ఉత్తరప్రదేశ్" },
    "state.Uttarakhand": { en: "Uttarakhand", hi: "उत्तराखंड", ta: "உத்தரகண்ட்", mr: "उत्तराखंड", te: "ఉత్తరాఖండ్" },
    "state.West Bengal": { en: "West Bengal", hi: "पश्चिम बंगाल", ta: "மேற்கு வங்காளம்", mr: "पश्चिम बंगाल", te: "పశ్చిమ బెంగాల్" },
    
    // Chatbot
    "chat.placeholder": { en: "Ask SBMS Assistant about government schemes...", hi: "SBMS असिस्टेंट से सरकारी योजनाओं के बारे में पूछें...", ta: "அரசுத் திட்டங்களைப் பற்றி SBMS உதவியாளரிடம் கேளுங்கள்...", mr: "SBMS असिस्टंटला सरकारी योजनांबद्दल विचारा...", te: "ప్రభుత్వ పథకాల గురించి SBMS సహాయకుడిని అడగండి..." },
    "chat.listening": { en: "Listening...", hi: "सुन रहा हूँ...", ta: "கேட்கிறது...", mr: "ऐकत आहे...", te: "వింటోంది..." },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");

    // Load persisted language from localStorage if available
    useEffect(() => {
        const savedLang = localStorage.getItem("sbms_language") as Language;
        if (savedLang && ["en", "hi", "ta", "mr", "te"].includes(savedLang)) {
            setLanguage(savedLang);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        try {
            localStorage.setItem("sbms_language", lang);
        } catch (e) {}
    };

    const t = (key: string, fallback?: string): string => {
        const entry = translations[key];
        if (entry && entry[language]) return entry[language];
        return fallback || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
