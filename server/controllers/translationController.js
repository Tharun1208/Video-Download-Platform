import axios from "axios";

// ======================================================
// LIBRETRANSLATE CONFIGURATION
// ======================================================

const LIBRE_TRANSLATE_URL =
  process.env.LIBRETRANSLATE_URL ||
  "http://localhost:5001";

// ======================================================
// TRANSLATE TEXT
// ======================================================

export const translateText = async (
  req,
  res
) => {
  try {
    // ==================================================
    // SUPPORT BOTH FRONTEND FORMATS
    // ==================================================

    const {
      q,
      text,

      source,
      sourceLanguage,

      target,
      targetLanguage,

      format = "text",
    } = req.body;

    // ==================================================
    // GET ACTUAL VALUES
    // ==================================================

    const translationText =
      q || text;

    const translationSource =
      source ||
      sourceLanguage ||
      "auto";

    const translationTarget =
      target ||
      targetLanguage;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (
      !translationText ||
      !translationText.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Text is required.",
      });
    }

    if (!translationTarget) {
      return res.status(400).json({
        success: false,
        message:
          "Target language is required.",
      });
    }

    // ==================================================
    // LOG REQUEST
    // ==================================================

    console.log(
      "===================================="
    );

    console.log(
      "LibreTranslate request"
    );

    console.log(
      "Text:",
      translationText
    );

    console.log(
      "Source:",
      translationSource
    );

    console.log(
      "Target:",
      translationTarget
    );

    console.log(
      "LibreTranslate URL:",
      LIBRE_TRANSLATE_URL
    );

    console.log(
      "===================================="
    );

    // ==================================================
    // CALL LIBRETRANSLATE
    // ==================================================

    const response =
      await axios.post(
        `${LIBRE_TRANSLATE_URL}/translate`,
        {
          q: translationText.trim(),

          source:
            translationSource,

          target:
            translationTarget,

          format,
        },
        {
          headers: {
            "Content-Type":
              "application/json",
          },

          timeout: 30000,
        }
      );

    // ==================================================
    // GET TRANSLATION
    // ==================================================

    const translatedText =
      response?.data?.translatedText;

    if (
      !translatedText ||
      typeof translatedText !==
        "string"
    ) {
      console.error(
        "LibreTranslate returned no translated text:",
        response?.data
      );

      return res.status(500).json({
        success: false,
        message:
          "LibreTranslate did not return translated text.",
      });
    }

    // ==================================================
    // SUCCESS
    // ==================================================

    console.log(
      "Translation successful:"
    );

    console.log(
      translatedText
    );

    console.log(
      "===================================="
    );

    return res.status(200).json({
      success: true,

      translatedText:
        translatedText.trim(),
    });
  } catch (error) {
    // ==================================================
    // ERROR
    // ==================================================

    console.error(
      "===================================="
    );

    console.error(
      "LibreTranslate ERROR"
    );

    console.error(
      error?.response?.data ||
        error?.message ||
        error
    );

    console.error(
      "===================================="
    );

    // ==================================================
    // LIBRETRANSLATE ERROR
    // ==================================================

    const libreError =
      error?.response?.data?.error;

    return res.status(500).json({
      success: false,

      message:
        libreError ||
        "Translation service is currently unavailable.",

      error:
        libreError ||
        error?.message ||
        "Unknown translation error.",
    });
  }
};