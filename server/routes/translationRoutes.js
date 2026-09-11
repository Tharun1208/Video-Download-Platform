import express from "express";
import axios from "axios";

const router = express.Router();

const TRANSLATION_SERVER_URL =
  process.env.TRANSLATION_API_URL ||
  "http://127.0.0.1:5002";

// Comprehensive mapping for 2-letter ISO language codes
const LANG_CODE_MAP = {
  tel_telu: "te",
  tam_taml: "ta",
  kan_knda: "kn",
  hin_deva: "hi",
  mal_mlym: "ml",
  mar_deva: "mr",
  ben_beng: "bn",
  guj_gujr: "gu",
  pan_guru: "pa",
  urd_arab: "ur",
  ory_orya: "or",
  asm_beng: "as",
  npi_deva: "ne",
  spa_latn: "es",
  fra_latn: "fr",
  deu_latn: "de",
  ita_latn: "it",
  por_latn: "pt",
  rus_cyrl: "ru",
  jpn_jpan: "ja",
  kor_hang: "ko",
  zho_hans: "zh",
  arb_arab: "ar",
  eng_latn: "en",
  telegu: "te",
  telugu: "te",
  tamil: "ta",
  tamizh: "ta",
  thamizh: "ta",
  kannada: "kn",
  kannad: "kn",
  hindi: "hi",
  malayalam: "ml",
  malyalam: "ml",
  marathi: "mr",
  bengali: "bn",
  bangla: "bn",
  gujarati: "gu",
  gujrati: "gu",
  punjabi: "pa",
  urdu: "ur",
  odia: "or",
  oriya: "or",
  assamese: "as",
  nepali: "ne",
  spanish: "es",
  french: "fr",
  german: "de",
  italian: "it",
  portuguese: "pt",
  russian: "ru",
  japanese: "ja",
  korean: "ko",
  chinese: "zh",
  arabic: "ar",
  english: "en",
  te: "te",
  ta: "ta",
  kn: "kn",
  hi: "hi",
  ml: "ml",
  mr: "mr",
  bn: "bn",
  gu: "gu",
  pa: "pa",
  ur: "ur",
  or: "or",
  as: "as",
  ne: "ne",
  es: "es",
  fr: "fr",
  de: "de",
  it: "it",
  pt: "pt",
  ru: "ru",
  ja: "ja",
  ko: "ko",
  zh: "zh",
  ar: "ar",
  en: "en",
};

const normalizeLang = (val, defaultVal = "en") => {
  if (!val) return defaultVal;
  const s = String(val).trim().toLowerCase();
  if (LANG_CODE_MAP[s]) return LANG_CODE_MAP[s];
  const prefix = s.split(/[-_]/)[0];
  if (LANG_CODE_MAP[prefix]) return LANG_CODE_MAP[prefix];
  if (prefix.length === 2) return prefix;
  return s;
};

// GET /api/translate - Service status and interactive test UI
router.get("/", (req, res) => {
  if (req.headers.accept && req.headers.accept.includes("text/html")) {
    return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Translation Service Status</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px 20px; display: flex; justify-content: center; }
    .card { background: #1e293b; border-radius: 16px; padding: 32px; max-width: 600px; width: 100%; border: 1px solid #334155; }
    h1 { margin-top: 0; color: #38bdf8; }
    textarea, select { width: 100%; box-sizing: border-box; background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 12px; color: white; margin-top: 6px; }
    button { width: 100%; margin-top: 18px; background: #2563eb; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .out { margin-top: 20px; background: #0f172a; border: 1px solid #334155; padding: 16px; border-radius: 8px; color: #4ade80; min-height: 50px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🌐 Translation Service Active</h1>
    <label>Text to translate:</label>
    <textarea id="txt" rows="3">Hello friend, welcome to VideoVault!</textarea>
    <label style="display:block; margin-top: 12px;">Target Language:</label>
    <select id="lang">
      <option value="te" selected>Telugu (తెలుగు)</option>
      <option value="ta">Tamil (தமிழ்)</option>
      <option value="kn">Kannada (ಕನ್ನಡ)</option>
      <option value="hi">Hindi (हिन्दी)</option>
      <option value="ml">Malayalam (മലയാളം)</option>
      <option value="mr">Marathi (मराठी)</option>
      <option value="bn">Bengali (বাংলা)</option>
      <option value="es">Spanish (Español)</option>
      <option value="en">English</option>
    </select>
    <button onclick="doTranslate()">Translate Now</button>
    <div id="out" class="out">Output will appear here...</div>
  </div>
  <script>
    async function doTranslate() {
      const text = document.getElementById('txt').value;
      const target = document.getElementById('lang').value;
      const out = document.getElementById('out');
      out.innerText = 'Translating...';
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ text, target_language: target })
        });
        const data = await res.json();
        out.innerText = data.translation || data.translatedText || JSON.stringify(data);
      } catch(e) {
        out.innerText = 'Error: ' + e.message;
      }
    }
  </script>
</body>
</html>`);
  }
  return res.status(200).json({
    success: true,
    message: "Translation service is active. Send POST requests to /api/translate",
    upstream: TRANSLATION_SERVER_URL,
  });
});

router.post("/", async (req, res) => {
  try {
    const {
      text,
      q,
      targetLanguage,
      target_language,
      target,
      sourceLanguage = "auto",
      source_language,
      source,
    } = req.body;

    const queryText = (text || q || "").trim();
    const rawTarget = targetLanguage || target_language || target;
    const rawSource = sourceLanguage || source_language || source || "auto";

    if (!queryText) {
      return res.status(400).json({
        success: false,
        message: "Text is required.",
      });
    }

    if (!rawTarget) {
      return res.status(400).json({
        success: false,
        message: "Target language is required.",
      });
    }

    const normTarget = normalizeLang(rawTarget, "en");
    const normSource = rawSource === "auto" ? "auto" : normalizeLang(rawSource, "auto");

    // Tier 1: Try local Python server (port 5002) if running
    try {
      const response = await axios.post(
        `${TRANSLATION_SERVER_URL}/translate`,
        {
          text: queryText,
          target_language: normTarget,
          target: normTarget,
          source_language: normSource,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 8000,
        }
      );

      const translated =
        response.data?.translation || response.data?.translatedText;

      if (translated && translated.trim() && translated.trim() !== queryText) {
        return res.status(200).json({
          success: true,
          translation: translated.trim(),
          translatedText: translated.trim(),
          original_text: queryText,
          target_language: normTarget,
          source_language: response.data?.source_language || normSource,
          model: response.data?.model || "indictrans2",
        });
      }
    } catch {
      // Local server down or slow, seamlessly continue to web fallbacks
    }

    // Tier 2: MyMemory API (Very reliable for Telugu, Tamil, and other Indian languages)
    try {
      const srcPair = normSource === "auto" ? "en" : normSource;
      const pair = `${srcPair}|${normTarget}`;
      const fallbackUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(queryText)}&langpair=${pair}`;
      const fbRes = await axios.get(fallbackUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
        timeout: 7000,
      });

      const fbText = fbRes.data?.responseData?.translatedText;
      if (
        fbText &&
        !fbText.toLowerCase().startsWith("invalid") &&
        !fbText.includes("PLEASE SELECT TWO") &&
        fbText.trim().length > 0
      ) {
        return res.status(200).json({
          success: true,
          translation: fbText.trim(),
          translatedText: fbText.trim(),
          original_text: queryText,
          target_language: normTarget,
          source_language: normSource,
          model: "mymemory",
        });
      }
    } catch (fbErr) {
      console.warn("MyMemory API note:", fbErr.message);
    }

    // Tier 3: Google Translate Multi-Client API
    for (const client of ["dict-chrome-ex", "gtx", "at"]) {
      try {
        const srcCode = normSource === "auto" ? "auto" : normSource;
        const encoded = encodeURIComponent(queryText);
        const googleUrl = `https://translate.googleapis.com/translate_a/single?client=${client}&sl=${srcCode}&tl=${normTarget}&dt=t&q=${encoded}`;
        const gRes = await axios.get(googleUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          },
          timeout: 6000,
        });

        if (Array.isArray(gRes.data) && Array.isArray(gRes.data[0])) {
          const parts = gRes.data[0]
            .filter((p) => Array.isArray(p) && p[0])
            .map((p) => p[0]);
          const joined = parts.join("").trim();
          if (joined) {
            return res.status(200).json({
              success: true,
              translation: joined,
              translatedText: joined,
              original_text: queryText,
              target_language: normTarget,
              source_language: normSource,
              model: `google-${client}`,
            });
          }
        }
      } catch {
        // try next
      }
    }

    // Tier 4: Lingva Translate API
    try {
      const srcCode = normSource === "auto" ? "auto" : normSource;
      const encoded = encodeURIComponent(queryText);
      const lingvaUrl = `https://lingva.ml/api/v1/${srcCode}/${normTarget}/${encoded}`;
      const lRes = await axios.get(lingvaUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
        timeout: 5000,
      });
      if (lRes.data && lRes.data.translation) {
        return res.status(200).json({
          success: true,
          translation: lRes.data.translation.trim(),
          translatedText: lRes.data.translation.trim(),
          original_text: queryText,
          target_language: normTarget,
          source_language: normSource,
          model: "lingva",
        });
      }
    } catch {
      // ignore
    }

    return res.status(200).json({
      success: true,
      translation: queryText,
      translatedText: queryText,
      original_text: queryText,
      target_language: normTarget,
      source_language: normSource,
      model: "original-text",
    });
  } catch (error) {
    console.error("Translation route error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Translation service encountered an error.",
      error: error.message,
    });
  }
});

export default router;