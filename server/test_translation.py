from flask import Flask, request, jsonify
from flask_cors import CORS

import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from IndicTransToolkit import IndicProcessor


# =========================================================
# Flask
# =========================================================

app = Flask(__name__)
CORS(app)


# =========================================================
# Model path
# =========================================================

MODEL_PATH = r"C:\Users\tharu\.cache\huggingface\hub\models--ai4bharat--indictrans2-en-indic-dist-200M\snapshots\173b94239f7c38886b2747b8d4a5db771a7e1232"


# =========================================================
# Load model
# =========================================================

print("Loading IndicTrans2 model...")

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_PATH,
    trust_remote_code=True
)

model = AutoModelForSeq2SeqLM.from_pretrained(
    MODEL_PATH,
    trust_remote_code=True
)

model.eval()


# =========================================================
# IndicTrans2 Processor
# =========================================================

processor = IndicProcessor(
    inference=True
)

print("IndicTrans2 model loaded successfully!")


# =========================================================
# Supported languages
# =========================================================

LANGUAGES = {
    "kn": "kan_Knda",
    "kn-IN": "kan_Knda",

    "ta": "tam_Taml",
    "ta-IN": "tam_Taml",

    "te": "tel_Telu",
    "te-IN": "tel_Telu",

    "hi": "hin_Deva",
    "hi-IN": "hin_Deva",

    "ur": "urd_Arab",
    "ur-PK": "urd_Arab"
}


# =========================================================
# Translation function
# =========================================================

def translate_text(text, target_language):

    source_language = "eng_Latn"

    # -----------------------------------------------------
    # Correct IndicTrans2 preprocessing
    # -----------------------------------------------------

    batch = processor.preprocess_batch(
        [text],
        src_lang=source_language,
        tgt_lang=target_language
    )

    # -----------------------------------------------------
    # Tokenize
    # -----------------------------------------------------

    inputs = tokenizer(
        batch,
        return_tensors="pt",
        padding=True,
        truncation=True
    )

    # -----------------------------------------------------
    # Generate
    # -----------------------------------------------------

    with torch.no_grad():

        generated_tokens = model.generate(
            **inputs,
            max_length=256,
            num_beams=5,
            early_stopping=True
        )

    # -----------------------------------------------------
    # Decode
    # -----------------------------------------------------

    decoded = tokenizer.batch_decode(
        generated_tokens,
        skip_special_tokens=True
    )

    # -----------------------------------------------------
    # Correct IndicTrans2 postprocessing
    # -----------------------------------------------------

    translations = processor.postprocess_batch(
        decoded,
        lang=target_language
    )

    return translations[0]


# =========================================================
# Home
# =========================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "success": True,
        "message": "IndicTrans2 Translation API is running"
    })


# =========================================================
# Languages
# =========================================================

@app.route("/languages", methods=["GET"])
def languages():

    return jsonify({
        "success": True,
        "languages": {
            "kn": "Kannada",
            "ta": "Tamil",
            "te": "Telugu",
            "hi": "Hindi",
            "ur": "Urdu"
        }
    })


# =========================================================
# Translate
# =========================================================

@app.route("/translate", methods=["POST"])
def translate():

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "success": False,
                "message": "Request body is required"
            }), 400


        text = data.get("text")

        target_language = data.get(
            "target_language"
        )


        # -------------------------------------------------
        # Validate text
        # -------------------------------------------------

        if not text:

            return jsonify({
                "success": False,
                "message": "Text is required"
            }), 400


        # -------------------------------------------------
        # Validate language
        # -------------------------------------------------

        if not target_language:

            return jsonify({
                "success": False,
                "message": "target_language is required"
            }), 400


        # -------------------------------------------------
        # Convert frontend code
        # -------------------------------------------------

        target_code = LANGUAGES.get(
            target_language
        )


        # Allow direct IndicTrans2 codes

        if not target_code:

            supported_codes = [
                "kan_Knda",
                "tam_Taml",
                "tel_Telu",
                "hin_Deva",
                "urd_Arab"
            ]

            if target_language in supported_codes:

                target_code = target_language

            else:

                return jsonify({
                    "success": False,
                    "message": "Unsupported target language",
                    "supported_languages": [
                        "kn",
                        "ta",
                        "te",
                        "hi",
                        "ur"
                    ]
                }), 400


        print()
        print("========================================")
        print("Translation request")
        print("Text:", text)
        print("Target:", target_code)
        print("========================================")


        # -------------------------------------------------
        # Translate
        # -------------------------------------------------

        translated_text = translate_text(
            text,
            target_code
        )


        print("Translation:", translated_text)


        # -------------------------------------------------
        # Response
        # -------------------------------------------------

        return jsonify({
            "success": True,
            "original_text": text,
            "target_language": target_language,
            "translation": translated_text
        })


    except Exception as e:

        print("Translation error:", e)

        return jsonify({
            "success": False,
            "message": "Translation failed",
            "error": str(e)
        }), 500


# =========================================================
# Start server
# =========================================================

if __name__ == "__main__":

    print()
    print("==============================================")
    print(" IndicTrans2 Translation Server")
    print("==============================================")
    print(" URL: http://localhost:5002")
    print("==============================================")
    print()

    app.run(
        host="127.0.0.1",
        port=5002,
        debug=False
    )