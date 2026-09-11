import sys
import io

# Force UTF-8 stdout/stderr for Windows console support with Indian/Unicode languages
if hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "buffer"):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from IndicTransToolkit import IndicProcessor
from langdetect import detect, DetectorFactory
import gc
DetectorFactory.seed = 0
app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
CORS(app, resources={r"/*": {"origins": "*"}}, methods=["GET", "POST", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
EN_INDIC_MODEL = "ai4bharat/indictrans2-en-indic-dist-200M"
INDIC_EN_MODEL = "ai4bharat/indictrans2-indic-en-dist-200M"
INDIC_INDIC_MODEL = "ai4bharat/indictrans2-indic-indic-dist-320M"
print("==============================================")
print("IndicTrans2 Translation Server")
print("==============================================")
print("Device:", DEVICE)
print("English -> Indic:", EN_INDIC_MODEL)
print("Indic -> English:", INDIC_EN_MODEL)
print("Indic -> Indic:", INDIC_INDIC_MODEL)
print("==============================================")
LANGUAGES = {
    "en": "eng_Latn",
    "kn": "kan_Knda",
    "hi": "hin_Deva",
    "ta": "tam_Taml",
    "te": "tel_Telu",
    "ml": "mal_Mlym",
    "mr": "mar_Deva",
    "bn": "ben_Beng",
    "gu": "guj_Gujr",
    "pa": "pan_Guru",
    "ur": "urd_Arab",
    "or": "ory_Orya",
    "as": "asm_Beng",
    "ne": "npi_Deva",
    "es": "spa_Latn",
    "fr": "fra_Latn",
    "de": "deu_Latn",
    "it": "ita_Latn",
    "pt": "por_Latn",
    "ru": "rus_Cyrl",
    "ja": "jpn_Jpan",
    "ko": "kor_Hang",
    "zh": "zho_Hans",
    "ar": "arb_Arab"
}
LANGUAGE_NAMES = {
    "en": "English",
    "kn": "Kannada",
    "hi": "Hindi",
    "ta": "Tamil",
    "te": "Telugu",
    "ml": "Malayalam",
    "mr": "Marathi",
    "bn": "Bengali",
    "gu": "Gujarati",
    "pa": "Punjabi",
    "ur": "Urdu",
    "or": "Odia",
    "as": "Assamese",
    "ne": "Nepali",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "ru": "Russian",
    "ja": "Japanese",
    "ko": "Korean",
    "zh": "Chinese",
    "ar": "Arabic"
}
LANGUAGE_ALIASES = {
    "english": "en",
    "kannada": "kn",
    "kannad": "kn",
    "hindi": "hi",
    "tamil": "ta",
    "tamizh": "ta",
    "thamizh": "ta",
    "telugu": "te",
    "telegu": "te",
    "malayalam": "ml",
    "malyalam": "ml",
    "marathi": "mr",
    "bengali": "bn",
    "gujarati": "gu",
    "punjabi": "pa",
    "urdu": "ur",
    "odia": "or",
    "oriya": "or",
    "assamese": "as",
    "nepali": "ne",
    "spanish": "es",
    "french": "fr",
    "german": "de",
    "italian": "it",
    "portuguese": "pt",
    "russian": "ru",
    "japanese": "ja",
    "korean": "ko",
    "chinese": "zh",
    "arabic": "ar"
}
LANGDETECT_TO_FRONTEND = {
    "en": "en",
    "kn": "kn",
    "hi": "hi",
    "ta": "ta",
    "te": "te",
    "ml": "ml",
    "mr": "mr",
    "bn": "bn",
    "gu": "gu",
    "pa": "pa",
    "ur": "ur",
    "or": "or",
    "as": "as",
    "ne": "ne"
}
MODEL_CACHE = {}
TOKENIZER_CACHE = {}
PROCESSOR = IndicProcessor(inference=True)
def normalize_language(language):
    if language is None:
        return None
    value = str(language).strip()
    if not value:
        return None
    value_lower = value.lower()
    if value_lower in LANGUAGES:
        return value_lower
    if value_lower in LANGUAGE_ALIASES:
        return LANGUAGE_ALIASES[value_lower]
    for code, indic_code in LANGUAGES.items():
        if value_lower == indic_code.lower():
            return code
    if "-" in value_lower:
        short_code = value_lower.split("-")[0]
        if short_code in LANGUAGES:
            return short_code
    return None
def contains_range(text, start, end):
    return any(start <= ord(char) <= end for char in text)
def script_scores(text):
    scores = {
        "kn": 0,
        "hi": 0,
        "ta": 0,
        "te": 0,
        "ml": 0,
        "mr": 0,
        "bn": 0,
        "gu": 0,
        "pa": 0,
        "ur": 0,
        "or": 0,
        "as": 0,
        "ne": 0,
        "en": 0
    }
    letters = [char for char in text if char.isalpha()]
    if letters:
        scores["en"] = sum(("A" <= char <= "Z") or ("a" <= char <= "z") for char in letters)
    for char in text:
        code = ord(char)
        if 0x0C80 <= code <= 0x0CFF:
            scores["kn"] += 3
        elif 0x0900 <= code <= 0x097F:
            scores["hi"] += 2
            scores["mr"] += 2
            scores["ne"] += 2
        elif 0x0B80 <= code <= 0x0BFF:
            scores["ta"] += 3
        elif 0x0C00 <= code <= 0x0C7F:
            scores["te"] += 3
        elif 0x0D00 <= code <= 0x0D7F:
            scores["ml"] += 3
        elif 0x0980 <= code <= 0x09FF:
            scores["bn"] += 3
            scores["as"] += 2
        elif 0x0A80 <= code <= 0x0AFF:
            scores["gu"] += 3
        elif 0x0A00 <= code <= 0x0A7F:
            scores["pa"] += 3
        elif 0x0600 <= code <= 0x06FF:
            scores["ur"] += 3
        elif 0x0B00 <= code <= 0x0B7F:
            scores["or"] += 3
    return scores
def detect_source_language(text, requested_source=None):
    explicit = normalize_language(requested_source)
    if explicit:
        return explicit, 1.0, "explicit"
    cleaned = str(text).strip()
    if not cleaned:
        return None, 0.0, "empty"
    scores = script_scores(cleaned)
    latin_score = scores["en"]
    indic_scores = {key: value for key, value in scores.items() if key != "en"}
    strongest_indic = max(indic_scores, key=indic_scores.get)
    strongest_score = indic_scores[strongest_indic]
    total_letters = max(sum(scores.values()), 1)
    if latin_score > 0 and strongest_score == 0:
        return "en", 0.99, "latin-script"
    if strongest_score > 0:
        if strongest_indic in ["hi", "mr", "ne"]:
            try:
                detected = detect(cleaned)
                detected_code = LANGDETECT_TO_FRONTEND.get(detected)
                if detected_code in ["hi", "mr", "ne"]:
                    return detected_code, 0.85, "script+langdetect"
            except Exception:
                pass
        return strongest_indic, min(0.99, strongest_score / total_letters), "unicode-script"
    try:
        detected = detect(cleaned)
        detected_code = LANGDETECT_TO_FRONTEND.get(detected)
        if detected_code:
            return detected_code, 0.70, "langdetect"
    except Exception:
        pass
    return "en", 0.50, "fallback"
def load_model(model_name):
    if model_name in MODEL_CACHE and model_name in TOKENIZER_CACHE:
        return TOKENIZER_CACHE[model_name], MODEL_CACHE[model_name]
    print("==============================================")
    print("Loading model:", model_name)
    print("==============================================")
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name, trust_remote_code=True)
    model.to(DEVICE)
    TOKENIZER_CACHE[model_name] = tokenizer
    MODEL_CACHE[model_name] = model
    return tokenizer, model

import urllib.request
import urllib.parse
import json

def fallback_translate(text, src_code="auto", tgt_code="en"):
    src = src_code if src_code and src_code != "auto" else "auto"
    tgt = tgt_code if tgt_code else "en"
    cleaned_text = str(text).strip()
    if not cleaned_text:
        return ""

    src_norm = normalize_language(src) or src or "auto"
    tgt_norm = normalize_language(tgt) or tgt or "en"

    if src_norm == tgt_norm:
        return cleaned_text

    # Tier 1: Google Translate Multi-Client API (Fast, reliable, handles Indic Unicode scripts)
    for client in ["dict-chrome-ex", "at", "gtx"]:
        try:
            encoded = urllib.parse.quote(cleaned_text)
            url = f"https://translate.googleapis.com/translate_a/single?client={client}&sl={src_norm}&tl={tgt_norm}&dt=t&q={encoded}"
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                    "Accept": "*/*",
                }
            )
            with urllib.request.urlopen(req, timeout=7) as response:
                raw = response.read().decode("utf-8")
                data = json.loads(raw)
                if data and isinstance(data, list) and len(data) > 0 and isinstance(data[0], list):
                    parts = [part[0] for part in data[0] if part and len(part) > 0 and part[0]]
                    result = "".join(parts).strip()
                    if result:
                        print(f"Translation successful via Google ({client}) [{src_norm}->{tgt_norm}]")
                        return result
        except Exception as err_g:
            print(f"Google API ({client}) note: {err_g}")
            continue

    # Tier 2: Lingva Translate API
    try:
        encoded = urllib.parse.quote(cleaned_text)
        url = f"https://lingva.ml/api/v1/{src_norm}/{tgt_norm}/{encoded}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode("utf-8"))
            if data and data.get("translation"):
                res = data["translation"].strip()
                if res:
                    print(f"Translation successful via Lingva [{src_norm}->{tgt_norm}]")
                    return res
    except Exception as err_l:
        print("Lingva fallback note:", err_l)

    # Tier 3: MyMemory API (Filtered)
    try:
        pair = f"{src_norm}|{tgt_norm}"
        encoded = urllib.parse.quote(cleaned_text)
        url = f"https://api.mymemory.translated.net/get?q={encoded}&langpair={pair}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=6) as response:
            data = json.loads(response.read().decode("utf-8"))
            if data and "responseData" in data and data["responseData"].get("translatedText"):
                res_txt = data["responseData"]["translatedText"].strip()
                if res_txt and not res_txt.lower().startswith("invalid") and "PLEASE SELECT" not in res_txt:
                    print(f"Translation via MyMemory [{pair}]")
                    return res_txt
    except Exception as err_m:
        print("MyMemory fallback note:", err_m)

    return cleaned_text


def translate_with_model(text, src_lang, tgt_lang, model_name, src_code=None, tgt_code=None):
    if model_name in MODEL_CACHE and model_name in TOKENIZER_CACHE:
        try:
            tokenizer = TOKENIZER_CACHE[model_name]
            model = MODEL_CACHE[model_name]
            batch = PROCESSOR.preprocess_batch([text], src_lang=src_lang, tgt_lang=tgt_lang)
            inputs = tokenizer(batch, return_tensors="pt", padding=True, truncation=True, max_length=256)
            inputs = {key: value.to(DEVICE) for key, value in inputs.items()}
            with torch.no_grad():
                generated_tokens = model.generate(**inputs, max_length=256, num_beams=5, early_stopping=True)
            decoded = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)
            translations = PROCESSOR.postprocess_batch(decoded, lang=tgt_lang)
            if translations and translations[0].strip():
                return translations[0].strip()
        except Exception as e:
            print("IndicTrans2 cached inference note:", e)

    return fallback_translate(text, src_code or "auto", tgt_code or "en")

def choose_model(src_code, tgt_code):
    if src_code == "en" and tgt_code != "en":
        return EN_INDIC_MODEL
    if src_code != "en" and tgt_code == "en":
        return INDIC_EN_MODEL
    if src_code != "en" and tgt_code != "en":
        return INDIC_INDIC_MODEL
    return None
HTML_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IndicTrans2 Translation Service</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: #0b0f19; color: #f1f5f9; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { background: #151d30; border: 1px solid #1e293b; border-radius: 16px; width: 100%; max-width: 640px; padding: 28px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6); }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #22304d; }
    .title { font-size: 20px; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 8px; }
    .badge { font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; background: #059669; color: white; }
    label { display: block; font-size: 13px; font-weight: 600; color: #94a3b8; margin: 16px 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; }
    textarea, select { width: 100%; background: #0a0e1a; border: 1px solid #22304d; border-radius: 10px; padding: 12px 14px; color: #f8fafc; font-size: 15px; outline: none; transition: border-color 0.2s; }
    textarea:focus, select:focus { border-color: #38bdf8; }
    button { width: 100%; margin-top: 20px; background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; border: none; border-radius: 10px; padding: 13px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.1s, opacity 0.2s; }
    button:hover { opacity: 0.95; }
    button:active { transform: translateY(1px); }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .result-box { margin-top: 20px; background: #0a0e1a; border: 1px solid #22304d; border-radius: 10px; padding: 16px; min-height: 80px; }
    .result-text { font-size: 17px; color: #34d399; font-weight: 500; word-break: break-word; line-height: 1.5; }
    .meta { font-size: 12px; color: #64748b; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="title">🌐 IndicTrans2 Translation Server</div>
      <span class="badge">Online (Port 5002)</span>
    </div>
    <p style="color: #94a3b8; font-size: 14px;">Instant translation across 22+ Indian and global languages.</p>
    
    <label>Text to translate</label>
    <textarea id="srcText" rows="3" placeholder="Enter text here...">Hello, this is a test translation!</textarea>
    
    <label>Target language</label>
    <select id="tgtLang">
      <option value="kn">Kannada (ಕನ್ನಡ)</option>
      <option value="hi" selected>Hindi (हिन्दी)</option>
      <option value="ta">Tamil (தமிழ்)</option>
      <option value="te">Telugu (తెలుగు)</option>
      <option value="ml">Malayalam (മലയാളം)</option>
      <option value="mr">Marathi (मराठी)</option>
      <option value="bn">Bengali (বাংলা)</option>
      <option value="gu">Gujarati (ગુજરાતી)</option>
      <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
      <option value="ur">Urdu (اردو)</option>
      <option value="or">Odia (ଓଡ଼ିଆ)</option>
      <option value="as">Assamese (অসমীয়া)</option>
      <option value="es">Spanish (Español)</option>
      <option value="fr">French (Français)</option>
      <option value="de">German (Deutsch)</option>
      <option value="ja">Japanese (日本語)</option>
      <option value="ko">Korean (한국어)</option>
      <option value="zh">Chinese (中文)</option>
      <option value="ar">Arabic (العربية)</option>
      <option value="en">English</option>
    </select>
    
    <button id="transBtn" onclick="runTranslate()">Translate Text</button>
    
    <label>Translated Result</label>
    <div class="result-box">
      <div id="resultText" class="result-text">Click "Translate Text" above to test.</div>
      <div id="resultMeta" class="meta"></div>
    </div>
  </div>

  <script>
    async function runTranslate() {
      const text = document.getElementById('srcText').value.trim();
      const target = document.getElementById('tgtLang').value;
      const btn = document.getElementById('transBtn');
      const out = document.getElementById('resultText');
      const meta = document.getElementById('resultMeta');
      
      if (!text) {
        out.innerText = "Please enter some text first.";
        return;
      }
      
      btn.disabled = true;
      btn.innerText = "Translating...";
      out.style.color = "#94a3b8";
      out.innerText = "Processing translation...";
      meta.innerText = "";
      
      try {
        const res = await fetch('/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, target_language: target })
        });
        const data = await res.json();
        if (data.success && data.translation) {
          out.style.color = "#34d399";
          out.innerText = data.translation;
          meta.innerText = 'Detected: ' + (data.source_language_name || data.source_language || 'Auto') + ' | Model: ' + (data.model || 'IndicTrans2');
        } else {
          out.style.color = "#f87171";
          out.innerText = data.message || "Translation failed.";
        }
      } catch (err) {
        out.style.color = "#f87171";
        out.innerText = "Error: " + err.message;
      } finally {
        btn.disabled = false;
        btn.innerText = "Translate Text";
      }
    }
  </script>
</body>
</html>"""

@app.route("/", methods=["GET"])
def home():
    if "text/html" in request.headers.get("Accept", ""):
        from flask import Response
        return Response(HTML_PAGE, mimetype="text/html")
    return jsonify({
        "success": True,
        "message": "IndicTrans2 Translation API is running",
        "device": str(DEVICE),
        "models": {
            "en_indic": EN_INDIC_MODEL,
            "indic_en": INDIC_EN_MODEL,
            "indic_indic": INDIC_INDIC_MODEL
        },
        "supported_languages": LANGUAGE_NAMES
    })
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "status": "healthy",
        "device": str(DEVICE),
        "loaded_models": list(MODEL_CACHE.keys()),
        "supported_languages": LANGUAGE_NAMES
    })
@app.route("/languages", methods=["GET"])
def languages():
    result = []
    for code, name in LANGUAGE_NAMES.items():
        result.append({
            "code": code,
            "name": name,
            "indic_code": LANGUAGES[code]
        })
    return jsonify({
        "success": True,
        "languages": result
    })
@app.route("/detect", methods=["POST"])
def detect_language():
    try:
        data = request.get_json(silent=True) or request.form.to_dict() or {}
        if not data:
            return jsonify({"success": False, "message": "Request body is required."}), 400
        text = str(data.get("text", "")).strip()
        if not text:
            return jsonify({"success": False, "message": "Text is required."}), 400
        source, confidence, method = detect_source_language(text)
        return jsonify({
            "success": True,
            "language": source,
            "language_name": LANGUAGE_NAMES.get(source, source),
            "indic_code": LANGUAGES.get(source),
            "confidence": confidence,
            "method": method
        })
    except Exception as e:
        return jsonify({"success": False, "message": "Language detection failed.", "error": str(e)}), 500
@app.route("/translate", methods=["GET", "POST"])
def translate():
    if request.method == "GET":
        from flask import Response
        if "text/html" in request.headers.get("Accept", ""):
            return Response(HTML_PAGE, mimetype="text/html")
        return jsonify({
            "success": True,
            "message": "Send a POST request with JSON body { text, target_language } to translate.",
            "available_endpoints": ["/translate", "/languages", "/detect", "/health"],
            "example": {
                "text": "Hello world",
                "target_language": "hi"
            }
        })
    try:
        data = request.get_json(silent=True) or request.form.to_dict() or {}
        if not data:
            return jsonify({
                "success": False,
                "message": "Request body is required."
            }), 400
        text = data.get("text")
        if text is None:
            return jsonify({
                "success": False,
                "message": "Text is required."
            }), 400
        text = str(text).strip()
        if not text:
            return jsonify({
                "success": False,
                "message": "Text cannot be empty."
            }), 400
        if len(text) > 5000:
            return jsonify({
                "success": False,
                "message": "Text cannot exceed 5000 characters."
            }), 400
        target_language = data.get("target_language")
        if target_language is None:
            target_language = data.get("targetLanguage")
        if target_language is None:
            target_language = data.get("target")
        target_code = normalize_language(target_language)
        if not target_code:
            return jsonify({
                "success": False,
                "message": "Unsupported target language.",
                "received": target_language,
                "supported_languages": LANGUAGE_NAMES
            }), 400
        source_language = data.get("source_language")
        if source_language is None:
            source_language = data.get("sourceLanguage")
        if source_language is None:
            source_language = data.get("source")
        detected_source, confidence, detection_method = detect_source_language(text, source_language)
        if detected_source not in LANGUAGES:
            return jsonify({
                "success": False,
                "message": "Unable to detect source language."
            }), 400
        print("Detected source:", detected_source)
        print("Target:", target_code)
        print("Detection confidence:", confidence)
        print("Detection method:", detection_method)
        if detected_source == target_code:
            # Check if it's a transliterated non-English word typed in Latin script
            if target_code == "en" and detection_method == "latin-script" and len(text) < 200:
                try:
                    candidate = fallback_translate(text, "auto", "en")
                    if candidate and candidate.strip().lower() != text.strip().lower():
                        print(f"Transliterated word translated: {text} -> {candidate}")
                        return jsonify({
                            "success": True,
                            "original_text": text,
                            "translation": candidate,
                            "source_language": "auto",
                            "source_language_name": "Detected",
                            "source_language_code": "auto",
                            "target_language": target_code,
                            "target_language_name": LANGUAGE_NAMES.get(target_code, target_code),
                            "target_language_code": LANGUAGES.get(target_code, target_code),
                            "detected": True,
                            "detection_confidence": confidence,
                            "detection_method": "transliterated-fallback",
                            "model": "web-fallback"
                        })
                except Exception:
                    pass

            return jsonify({
                "success": True,
                "original_text": text,
                "translation": text,
                "source_language": detected_source,
                "source_language_name": LANGUAGE_NAMES[detected_source],
                "source_language_code": LANGUAGES[detected_source],
                "target_language": target_code,
                "target_language_name": LANGUAGE_NAMES[target_code],
                "target_language_code": LANGUAGES[target_code],
                "detected": source_language is None,
                "detection_confidence": confidence,
                "detection_method": detection_method,
                "model": "none"
            })

        INDIC_SET = {"en", "kn", "hi", "ta", "te", "ml", "mr", "bn", "gu", "pa", "ur", "or", "as", "ne"}
        if detected_source not in INDIC_SET or target_code not in INDIC_SET:
            translated_text = fallback_translate(text, detected_source, target_code)
            return jsonify({
                "success": True,
                "original_text": text,
                "translation": translated_text,
                "source_language": detected_source,
                "source_language_name": LANGUAGE_NAMES.get(detected_source, detected_source),
                "source_language_code": LANGUAGES.get(detected_source, detected_source),
                "target_language": target_code,
                "target_language_name": LANGUAGE_NAMES.get(target_code, target_code),
                "target_language_code": LANGUAGES.get(target_code, target_code),
                "detected": source_language is None,
                "detection_confidence": confidence,
                "detection_method": detection_method,
                "model": "web-fallback"
            })

        src_indic_code = LANGUAGES[detected_source]
        tgt_indic_code = LANGUAGES[target_code]
        model_name = choose_model(detected_source, target_code)
        if model_name is None:
            return jsonify({
                "success": False,
                "message": "Source and target languages are both English. No translation is required."
            }), 400
        translated_text = translate_with_model(
            text,
            src_indic_code,
            tgt_indic_code,
            model_name,
            src_code=detected_source,
            tgt_code=target_code
        )
        return jsonify({
            "success": True,
            "original_text": text,
            "translation": translated_text,
            "source_language": detected_source,
            "source_language_name": LANGUAGE_NAMES[detected_source],
            "source_language_code": src_indic_code,
            "target_language": target_code,
            "target_language_name": LANGUAGE_NAMES[target_code],
            "target_language_code": tgt_indic_code,
            "detected": source_language is None,
            "detection_confidence": confidence,
            "detection_method": detection_method,
            "model": model_name
        })
    except Exception as e:
        import traceback
        print("==============================================")
        print("TRANSLATION ERROR")
        print("==============================================")
        print(str(e))
        traceback.print_exc()
        print("==============================================")
        return jsonify({
            "success": False,
            "message": "Translation failed.",
            "error": str(e)
        }), 500
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "message": "Route not found.",
        "available_routes": ["/", "/health", "/languages", "/detect", "/translate"]
    }), 404
@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        "success": False,
        "message": "HTTP method not allowed."
    }), 405
if __name__ == "__main__":
    print("==============================================")
    print("IndicTrans2 Translation Server")
    print("==============================================")
    print("URL       : http://localhost:5002")
    print("Health    : http://localhost:5002/health")
    print("Detect    : http://localhost:5002/detect")
    print("Languages : http://localhost:5002/languages")
    print("Translate : http://localhost:5002/translate")
    print("Device    :", DEVICE)
    print("==============================================")
    app.run(host="0.0.0.0", port=5002, debug=False, threaded=True)