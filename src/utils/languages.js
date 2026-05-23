// languages.js
// All supported languages and their UI translations

export const LANGUAGES = [
  { code: 'en', name: 'English',    nativeName: 'English',    flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi',      nativeName: 'हिन्दी',      flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil',      nativeName: 'தமிழ்',       flag: '🇮🇳' },
  { code: 'te', name: 'Telugu',     nativeName: 'తెలుగు',      flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi',    nativeName: 'मराठी',       flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali',    nativeName: 'বাংলা',       flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada',    nativeName: 'ಕನ್ನಡ',       flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati',   nativeName: 'ગુજરાતી',     flag: '🇮🇳' },
]

// UI text translations for each language
// These are used for static UI elements
export const UI_TEXT = {
  en: {
    appTagline: 'AI Emergency Assistant',
    chatPlaceholder: 'Describe your emergency...',
    chatTitle: 'RoadSOS Assistant',
    chatSubtitle: 'Describe your emergency and I\'ll guide you instantly.',
    emergencyTitle: 'Emergency Services',
    servicesTitle: 'Nearby Services',
    settingsTitle: 'Settings',
    sendButton: 'Send',
    quickActions: [
      { icon: '🚑', label: 'Ambulance needed' },
      { icon: '🚔', label: 'Report accident' },
      { icon: '🔧', label: 'Vehicle breakdown' },
      { icon: '🏥', label: 'Find hospital' },
    ],
    offlineMessage: 'Offline mode — AI chat unavailable',
    offlineSubtext: 'Emergency numbers still work.',
    languageLabel: 'Language',
  },

  hi: {
    appTagline: 'AI आपातकालीन सहायक',
    chatPlaceholder: 'अपनी आपात स्थिति बताएं...',
    chatTitle: 'RoadSOS सहायक',
    chatSubtitle: 'अपनी आपात स्थिति बताएं और मैं तुरंत मदद करूंगा।',
    emergencyTitle: 'आपातकालीन सेवाएं',
    servicesTitle: 'नजदीकी सेवाएं',
    settingsTitle: 'सेटिंग्स',
    sendButton: 'भेजें',
    quickActions: [
      { icon: '🚑', label: 'एम्बुलेंस चाहिए' },
      { icon: '🚔', label: 'दुर्घटना रिपोर्ट' },
      { icon: '🔧', label: 'वाहन खराब' },
      { icon: '🏥', label: 'अस्पताल खोजें' },
    ],
    offlineMessage: 'ऑफलाइन मोड — AI चैट उपलब्ध नहीं',
    offlineSubtext: 'आपातकालीन नंबर अभी भी काम करते हैं।',
    languageLabel: 'भाषा',
  },

  ta: {
    appTagline: 'AI அவசர உதவியாளர்',
    chatPlaceholder: 'உங்கள் அவசரநிலையை விவரிக்கவும்...',
    chatTitle: 'RoadSOS உதவியாளர்',
    chatSubtitle: 'உங்கள் அவசரநிலையை விவரிக்கவும், நான் உடனே வழிகாட்டுகிறேன்.',
    emergencyTitle: 'அவசர சேவைகள்',
    servicesTitle: 'அருகிலுள்ள சேவைகள்',
    settingsTitle: 'அமைப்புகள்',
    sendButton: 'அனுப்பு',
    quickActions: [
      { icon: '🚑', label: 'ஆம்புலன்ஸ் தேவை' },
      { icon: '🚔', label: 'விபத்து புகார்' },
      { icon: '🔧', label: 'வாகன கோளாறு' },
      { icon: '🏥', label: 'மருத்துவமனை கண்டுபிடி' },
    ],
    offlineMessage: 'ஆஃப்லைன் பயன்முறை — AI அரட்டை இல்லை',
    offlineSubtext: 'அவசர எண்கள் இன்னும் வேலை செய்கின்றன.',
    languageLabel: 'மொழி',
  },

  te: {
    appTagline: 'AI అత్యవసర సహాయకుడు',
    chatPlaceholder: 'మీ అత్యవసర పరిస్థితిని వివరించండి...',
    chatTitle: 'RoadSOS సహాయకుడు',
    chatSubtitle: 'మీ అత్యవసర పరిస్థితిని వివరించండి, నేను వెంటనే మార్గనిర్దేశం చేస్తాను.',
    emergencyTitle: 'అత్యవసర సేవలు',
    servicesTitle: 'సమీప సేవలు',
    settingsTitle: 'సెట్టింగ్‌లు',
    sendButton: 'పంపు',
    quickActions: [
      { icon: '🚑', label: 'అంబులెన్స్ కావాలి' },
      { icon: '🚔', label: 'ప్రమాదం నివేదించు' },
      { icon: '🔧', label: 'వాహనం చెడిపోయింది' },
      { icon: '🏥', label: 'ఆసుపత్రి కనుగొనండి' },
    ],
    offlineMessage: 'ఆఫ్‌లైన్ మోడ్ — AI చాట్ అందుబాటులో లేదు',
    offlineSubtext: 'అత్యవసర నంబర్లు ఇంకా పని చేస్తున్నాయి.',
    languageLabel: 'భాష',
  },

  mr: {
    appTagline: 'AI आणीबाणी सहाय्यक',
    chatPlaceholder: 'तुमची आणीबाणी सांगा...',
    chatTitle: 'RoadSOS सहाय्यक',
    chatSubtitle: 'तुमची आणीबाणी सांगा आणि मी लगेच मदत करेन.',
    emergencyTitle: 'आणीबाणी सेवा',
    servicesTitle: 'जवळच्या सेवा',
    settingsTitle: 'सेटिंग्ज',
    sendButton: 'पाठवा',
    quickActions: [
      { icon: '🚑', label: 'रुग्णवाहिका हवी' },
      { icon: '🚔', label: 'अपघात नोंदवा' },
      { icon: '🔧', label: 'वाहन बिघडले' },
      { icon: '🏥', label: 'रुग्णालय शोधा' },
    ],
    offlineMessage: 'ऑफलाइन मोड — AI चॅट उपलब्ध नाही',
    offlineSubtext: 'आणीबाणी क्रमांक अजूनही कार्यरत आहेत.',
    languageLabel: 'भाषा',
  },

  bn: {
    appTagline: 'AI জরুরি সহকারী',
    chatPlaceholder: 'আপনার জরুরি পরিস্থিতি বর্ণনা করুন...',
    chatTitle: 'RoadSOS সহকারী',
    chatSubtitle: 'আপনার জরুরি পরিস্থিতি বলুন এবং আমি তাৎক্ষণিক সাহায্য করব।',
    emergencyTitle: 'জরুরি সেবা',
    servicesTitle: 'নিকটবর্তী সেবা',
    settingsTitle: 'সেটিংস',
    sendButton: 'পাঠান',
    quickActions: [
      { icon: '🚑', label: 'অ্যাম্বুলেন্স দরকার' },
      { icon: '🚔', label: 'দুর্ঘটনা রিপোর্ট' },
      { icon: '🔧', label: 'যানবাহন বিকল' },
      { icon: '🏥', label: 'হাসপাতাল খুঁজুন' },
    ],
    offlineMessage: 'অফলাইন মোড — AI চ্যাট অনুপলব্ধ',
    offlineSubtext: 'জরুরি নম্বরগুলি এখনও কাজ করছে।',
    languageLabel: 'ভাষা',
  },

  kn: {
    appTagline: 'AI ತುರ್ತು ಸಹಾಯಕ',
    chatPlaceholder: 'ನಿಮ್ಮ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯನ್ನು ವಿವರಿಸಿ...',
    chatTitle: 'RoadSOS ಸಹಾಯಕ',
    chatSubtitle: 'ನಿಮ್ಮ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯನ್ನು ಹೇಳಿ, ನಾನು ತಕ್ಷಣ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತೇನೆ.',
    emergencyTitle: 'ತುರ್ತು ಸೇವೆಗಳು',
    servicesTitle: 'ಹತ್ತಿರದ ಸೇವೆಗಳು',
    settingsTitle: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    sendButton: 'ಕಳುಹಿಸು',
    quickActions: [
      { icon: '🚑', label: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ಬೇಕು' },
      { icon: '🚔', label: 'ಅಪಘಾತ ವರದಿ' },
      { icon: '🔧', label: 'ವಾಹನ ಕೆಟ್ಟಿದೆ' },
      { icon: '🏥', label: 'ಆಸ್ಪತ್ರೆ ಹುಡುಕಿ' },
    ],
    offlineMessage: 'ಆಫ್‌ಲೈನ್ ಮೋಡ್ — AI ಚಾಟ್ ಲಭ್ಯವಿಲ್ಲ',
    offlineSubtext: 'ತುರ್ತು ಸಂಖ್ಯೆಗಳು ಇನ್ನೂ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತವೆ.',
    languageLabel: 'ಭಾಷೆ',
  },

  gu: {
    appTagline: 'AI કટોકટી સહાયક',
    chatPlaceholder: 'તમારી કટોકટી વર્ણવો...',
    chatTitle: 'RoadSOS સહાયક',
    chatSubtitle: 'તમારી કટોકટી જણાવો અને હું તરત જ માર્ગદર્શન આપીશ.',
    emergencyTitle: 'કટોકટી સેવાઓ',
    servicesTitle: 'નજીકની સેવાઓ',
    settingsTitle: 'સેટિંગ્સ',
    sendButton: 'મોકલો',
    quickActions: [
      { icon: '🚑', label: 'એમ્બ્યુલન્સ જોઈએ' },
      { icon: '🚔', label: 'અકસ્માત નોંધો' },
      { icon: '🔧', label: 'વાહન બગડ્યું' },
      { icon: '🏥', label: 'હોસ્પિટલ શોધો' },
    ],
    offlineMessage: 'ઑફલાઇન મોડ — AI ચેટ અનુપલબ્ધ',
    offlineSubtext: 'કટોકટી નંબરો હજી કાર્યરત છે.',
    languageLabel: 'ભાષા',
  },
}

// Get UI text for a language code — falls back to English
export function getUIText(langCode) {
  return UI_TEXT[langCode] || UI_TEXT['en']
}

// Get language name from code
export function getLanguage(langCode) {
  return LANGUAGES.find((l) => l.code === langCode) || LANGUAGES[0]
}