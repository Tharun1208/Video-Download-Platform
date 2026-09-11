// =========================================================
// ABUSIVE WORDS
// =========================================================

const abusiveWords = [
  "fuck",
  "fucking",
  "shit",
  "bitch",
  "bastard",
  "asshole",
  "idiot",
  "stupid",
  "moron",
  "dumbass",
];

// =========================================================
// NORMALIZE TEXT
// =========================================================

const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
};

// =========================================================
// ABUSIVE WORD CHECK
// =========================================================

const containsAbusiveWord = (text) => {
  const normalized = normalizeText(text);

  return abusiveWords.some((word) => {
    const regex = new RegExp(
      `(^|\\s)${word}(\\s|$)`,
      "i"
    );

    return regex.test(normalized);
  });
};

// =========================================================
// SPECIAL CHARACTER SPAM
// =========================================================

const containsSpecialCharacterSpam = (text) => {
  if (!text) return false;

  // Repeated special characters
  if (
    /([!@#$%^&*()_+=\-{}\[\]:;"'<>,.?/\\|~`])\1{5,}/.test(
      text
    )
  ) {
    return true;
  }

  // Very high special-character ratio
  const specialCharacters =
    text.match(
      /[!@#$%^&*()_+=\-{}\[\]:;"'<>,.?/\\|~`]/g
    ) || [];

  const ratio =
    specialCharacters.length / text.length;

  if (text.length >= 10 && ratio > 0.6) {
    return true;
  }

  return false;
};

// =========================================================
// SPAM CHECK
// =========================================================

const containsSpam = (text) => {
  const normalized = normalizeText(text);

  // Excessive repeated words
  const words = normalized.split(" ");

  if (words.length >= 5) {
    let repeatedCount = 1;

    for (let i = 1; i < words.length; i++) {
      if (words[i] === words[i - 1]) {
        repeatedCount++;

        if (repeatedCount >= 4) {
          return true;
        }
      } else {
        repeatedCount = 1;
      }
    }
  }

  // Excessive URLs
  const urls =
    text.match(
      /(https?:\/\/|www\.)[^\s]+/gi
    ) || [];

  if (urls.length >= 3) {
    return true;
  }

  // Promotional spam
  const spamPatterns = [
    "buy now",
    "click here",
    "free money",
    "earn money",
    "subscribe now",
    "visit my channel",
    "follow me",
    "dm me",
    "make money",
  ];

  for (const pattern of spamPatterns) {
    if (normalized.includes(pattern)) {
      return true;
    }
  }

  return false;
};

// =========================================================
// EXPORT
// =========================================================

export const moderateComment = (text) => {
  if (!text || !text.trim()) {
    return {
      allowed: false,
      reason: "Comment cannot be empty.",
    };
  }

  if (text.length > 1000) {
    return {
      allowed: false,
      reason:
        "Comment cannot exceed 1000 characters.",
    };
  }

  if (containsAbusiveWord(text)) {
    return {
      allowed: false,
      reason:
        "Your comment contains inappropriate language.",
    };
  }

  if (containsSpecialCharacterSpam(text)) {
    return {
      allowed: false,
      reason:
        "Your comment contains excessive special characters.",
    };
  }

  if (containsSpam(text)) {
    return {
      allowed: false,
      reason:
        "Your comment appears to be spam.",
    };
  }

  return {
    allowed: true,
    reason: null,
  };
};