export const LANGUAGES_LIST = [
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", type: "indian", badge: "KN" },
  { code: "hi", name: "Hindi", native: "हिन्दी", type: "indian", badge: "HI" },
  { code: "en", name: "English", native: "English", type: "global", badge: "EN" },
  { code: "ta", name: "Tamil", native: "தமிழ்", type: "indian", badge: "TA" },
  { code: "te", name: "Telugu", native: "తెలుగు", type: "indian", badge: "TE" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", type: "indian", badge: "ML" },
  { code: "mr", name: "Marathi", native: "मराठी", type: "indian", badge: "MR" },
  { code: "bn", name: "Bengali", native: "বাংলা", type: "indian", badge: "BN" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", type: "indian", badge: "GU" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", type: "indian", badge: "PA" },
  { code: "ur", name: "Urdu", native: "اردو", type: "indian", badge: "UR" },
  { code: "es", name: "Spanish", native: "Español", type: "global", badge: "ES" },
  { code: "fr", name: "French", native: "Français", type: "global", badge: "FR" },
  { code: "de", name: "German", native: "Deutsch", type: "global", badge: "DE" },
  { code: "it", name: "Italian", native: "Italiano", type: "global", badge: "IT" },
  { code: "pt", name: "Portuguese", native: "Português", type: "global", badge: "PT" },
  { code: "ru", name: "Russian", native: "Русский", type: "global", badge: "RU" },
  { code: "ja", name: "Japanese", native: "日本語", type: "global", badge: "JA" },
  { code: "ko", name: "Korean", native: "한국어", type: "global", badge: "KO" },
  { code: "zh", name: "Chinese", native: "中文", type: "global", badge: "ZH" },
  { code: "ar", name: "Arabic", native: "العربية", type: "global", badge: "AR" },
];

export const getLanguageObj = (code) => {
  if (code === "auto") {
    return { code: "auto", name: "Auto", native: "Any Language", type: "auto", badge: "AUTO" };
  }
  return (
    LANGUAGES_LIST.find((l) => l.code === code) || {
      code,
      name: code ? code.toUpperCase() : "Language",
      native: code ? code.toUpperCase() : "",
      badge: code ? code.toUpperCase() : "LANG",
    }
  );
};
