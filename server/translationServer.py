from flask import Flask, request, jsonify
from flask_cors import CORS
import argostranslate.translate

app = Flask(__name__)
CORS(app)

@app.route("/translate", methods=["POST"])
def translate():
    try:
        data = request.get_json()

        text = data.get("text", "")
        from_lang = data.get("from", "en")
        to_lang = data.get("to", "hi")

        if not text:
            return jsonify({
                "error": "Text is required"
            }), 400

        translated = argostranslate.translate.translate(
            text,
            from_lang,
            to_lang
        )

        return jsonify({
            "translatedText": translated
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5001,
        debug=True
    )