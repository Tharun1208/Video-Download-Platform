import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ThumbsDown,
  Flag,
  Languages,
  Send,
  MoreVertical,
  MessageCircle,
  X,
  Loader2,
  Trash2,
  AlertTriangle,
  Sparkles,
  MapPin,
  Globe,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import LanguageDropdownTable from "./LanguageDropdownTable";
import { getLanguageObj } from "./languageData";

const API_URL =
  import.meta.env.VITE_API_URL || "https://video-download-platform.onrender.com";

const TRANSLATION_API_URL =
  import.meta.env.VITE_TRANSLATION_API_URL ||
  "http://localhost:5002";

const TRANSLATION_CACHE_KEY =
  "streamvault_translation_cache_v3";

const LANGUAGE_CODES = {
  en: "eng_Latn",
  kn: "kan_Knda",
  hi: "hin_Deva",
  ta: "tam_Taml",
  te: "tel_Telu",
  ml: "mal_Mlym",
  mr: "mar_Deva",
  bn: "ben_Beng",
  gu: "guj_Gujr",
  pa: "pan_Guru",
  ur: "urd_Arab",
  or: "ory_Orya",
  as: "asm_Beng",
  ne: "npi_Deva",
  es: "spa_Latn",
  fr: "fra_Latn",
  de: "deu_Latn",
  it: "ita_Latn",
  pt: "por_Latn",
  ru: "rus_Cyrl",
  ja: "jpn_Jpan",
  ko: "kor_Hang",
  zh: "zho_Hans",
  ar: "arb_Arab",
};

const LANGUAGE_NAMES = {
  auto: "Auto / Any Language",
  en: "English",
  kn: "Kannada",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  ml: "Malayalam",
  mr: "Marathi",
  bn: "Bengali",
  gu: "Gujarati",
  pa: "Punjabi",
  ur: "Urdu",
  or: "Odia",
  as: "Assamese",
  ne: "Nepali",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ru: "Russian",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  ar: "Arabic",
};

const loadTranslationCache = () => {
  try {
    const stored = localStorage.getItem(
      TRANSLATION_CACHE_KEY
    );

    if (!stored) return {};

    const parsed = JSON.parse(stored);

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return parsed;
  } catch (error) {
    console.error(
      "Translation cache error:",
      error
    );
    return {};
  }
};

const saveTranslationCache = (cache) => {
  try {
    localStorage.setItem(
      TRANSLATION_CACHE_KEY,
      JSON.stringify(cache)
    );
  } catch (error) {
    console.error(
      "Unable to save translation cache:",
      error
    );
  }
};

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
  };
};

function Comments({ videoId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [reportingId, setReportingId] = useState(null);
  const [reportReason, setReportReason] = useState("other");
  const [reporting, setReporting] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [translatingId, setTranslatingId] = useState(null);
  const [translations, setTranslations] = useState({});
  const [translationLanguage, setTranslationLanguage] =
    useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] =
    useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [shareLocation, setShareLocation] = useState(false);
  const [commentLanguage, setCommentLanguage] = useState("auto");
  const [isTranslatingDraft, setIsTranslatingDraft] = useState(false);
  const [draftTranslatedText, setDraftTranslatedText] = useState("");

  useEffect(() => {
    if (!videoId) return;
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/api/comments/${videoId}`,
        getAuthConfig()
      );

      if (response?.data?.success) {
        setComments(response.data.comments || []);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error(
        "Comments fetch error:",
        error
      );
      console.error(
        "Status:",
        error?.response?.status
      );
      console.error(
        "Response:",
        error?.response?.data
      );
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const getClientLocation = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (res.ok) {
        const data = await res.json();
        return {
          city: data.region || data.country_name || "India",
        };
      }
    } catch {
      // Fallback
    }
    return { city: "India" };
  };

  const handleTranslateDraft = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error("Please type your comment text first.", { id: "draft-empty" });
      return;
    }
    if (commentLanguage === "auto") {
      toast.error("Please select a target language to translate into.", { id: "draft-lang-auto" });
      return;
    }

    try {
      setIsTranslatingDraft(true);
      const targetCode = LANGUAGE_CODES[commentLanguage] || commentLanguage;
      let response;
      try {
        response = await axios.post(`${TRANSLATION_API_URL}/translate`, {
          text: trimmed,
          target_language: targetCode,
          target: commentLanguage,
        }, { timeout: 6000 });
      } catch {
        // Fallback to Express backend translation endpoint
        response = await axios.post(`${API_URL}/api/translate`, {
          text: trimmed,
          target_language: commentLanguage,
          target: commentLanguage,
        });
      }

      const resText = response.data?.translation || response.data?.translatedText;
      if (resText && resText.trim()) {
        setDraftTranslatedText(resText.trim());
        toast.success(`Translated to ${LANGUAGE_NAMES[commentLanguage] || commentLanguage}!`, { id: "draft-trans-success" });
      } else {
        toast.error("Could not translate text. Please try again.", { id: "draft-trans-err" });
      }
    } catch (err) {
      console.error("Draft translation error:", err);
      toast.error("Translation service error. Please try again.", { id: "draft-trans-fail" });
    } finally {
      setIsTranslatingDraft(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText) return;

    if (trimmedText.length > 1000) {
      toast.error("Comment cannot exceed 1000 characters.", { id: "comment-length-err" });
      return;
    }

    try {
      setPosting(true);

      let locationData = null;
      if (shareLocation) {
        locationData = await getClientLocation();
      }

      // If draft was translated, use it, or auto-translate if a specific target language was picked
      let textToPost = trimmedText;
      if (draftTranslatedText) {
        textToPost = draftTranslatedText;
      } else if (commentLanguage !== "auto") {
        try {
          const targetCode = LANGUAGE_CODES[commentLanguage] || commentLanguage;
          const transResponse = await axios.post(`${TRANSLATION_API_URL}/translate`, {
            text: trimmedText,
            target_language: targetCode,
          });
          if (transResponse.data?.success && transResponse.data?.translation) {
            textToPost = transResponse.data.translation;
          }
        } catch (transErr) {
          console.warn("Auto-translate on post fallback:", transErr);
        }
      }

      const response = await axios.post(
        `${API_URL}/api/comments`,
        {
          videoId,
          text: textToPost,
          language: commentLanguage,
          locationEnabled: shareLocation,
          city: locationData?.city || (shareLocation ? "India" : null),
        },
        getAuthConfig()
      );

      if (response?.data?.success) {
        setText("");
        setDraftTranslatedText("");
        setShareLocation(false);
        toast.success("Comment posted!", { id: "comment-post-success" });
        await fetchComments();
      } else {
        toast.error(
          response?.data?.message ||
            "Unable to post comment.",
          { id: "comment-post-err" }
        );
      }
    } catch (error) {
      console.error(
        "Create comment error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to post comment.",
        { id: "comment-post-err" }
      );
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (commentId) => {
    if (actionLoading[commentId]) return;

    const currentComment = comments.find(
      (comment) => comment._id === commentId
    );

    if (!currentComment) return;

    const wasLiked = Boolean(
      currentComment.userLiked
    );

    const wasDisliked = Boolean(
      currentComment.userDisliked
    );

    const oldLikeCount =
      currentComment.likeCount ??
      currentComment.likes?.length ??
      0;

    const oldDislikeCount =
      currentComment.dislikeCount ??
      currentComment.dislikes?.length ??
      0;

    setActionLoading((prev) => ({
      ...prev,
      [commentId]: "like",
    }));

    let newLikeCount = oldLikeCount;
    let newDislikeCount = oldDislikeCount;
    let newLiked = wasLiked;
    let newDisliked = wasDisliked;

    if (wasLiked) {
      newLikeCount = Math.max(
        0,
        oldLikeCount - 1
      );
      newLiked = false;
    } else {
      newLikeCount = oldLikeCount + 1;
      newLiked = true;

      if (wasDisliked) {
        newDislikeCount = Math.max(
          0,
          oldDislikeCount - 1
        );
        newDisliked = false;
      }
    }

    setComments((prev) =>
      prev.map((comment) =>
        comment._id === commentId
          ? {
              ...comment,
              likeCount: newLikeCount,
              dislikeCount: newDislikeCount,
              userLiked: newLiked,
              userDisliked: newDisliked,
            }
          : comment
      )
    );

    try {
      const response = await axios.post(
        `${API_URL}/api/comments/${commentId}/like`,
        {},
        getAuthConfig()
      );

      if (response?.data?.success) {
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  likeCount:
                    response.data.likeCount ??
                    newLikeCount,
                  dislikeCount:
                    response.data.dislikeCount ??
                    newDislikeCount,
                  userLiked: Boolean(
                    response.data.userLiked
                  ),
                  userDisliked: Boolean(
                    response.data.userDisliked
                  ),
                }
              : comment
          )
        );
      } else {
        await fetchComments();
      }
    } catch (error) {
      console.error(
        "Like comment error:",
        error
      );
      await fetchComments();
    } finally {
      setActionLoading((prev) => {
        const updated = { ...prev };
        delete updated[commentId];
        return updated;
      });
    }
  };

  const handleDislike = async (commentId) => {
    if (actionLoading[commentId]) return;

    const currentComment = comments.find(
      (comment) => comment._id === commentId
    );

    if (!currentComment) return;

    const wasLiked = Boolean(
      currentComment.userLiked
    );

    const wasDisliked = Boolean(
      currentComment.userDisliked
    );

    const oldLikeCount =
      currentComment.likeCount ??
      currentComment.likes?.length ??
      0;

    const oldDislikeCount =
      currentComment.dislikeCount ??
      currentComment.dislikes?.length ??
      0;

    setActionLoading((prev) => ({
      ...prev,
      [commentId]: "dislike",
    }));

    let newLikeCount = oldLikeCount;
    let newDislikeCount = oldDislikeCount;
    let newLiked = wasLiked;
    let newDisliked = wasDisliked;

    if (wasDisliked) {
      newDislikeCount = Math.max(
        0,
        oldDislikeCount - 1
      );
      newDisliked = false;
    } else {
      newDislikeCount = oldDislikeCount + 1;
      newDisliked = true;

      if (wasLiked) {
        newLikeCount = Math.max(
          0,
          oldLikeCount - 1
        );
        newLiked = false;
      }
    }

    setComments((prev) =>
      prev.map((comment) =>
        comment._id === commentId
          ? {
              ...comment,
              likeCount: newLikeCount,
              dislikeCount: newDislikeCount,
              userLiked: newLiked,
              userDisliked: newDisliked,
            }
          : comment
      )
    );

    try {
      const response = await axios.post(
        `${API_URL}/api/comments/${commentId}/dislike`,
        {},
        getAuthConfig()
      );

      if (response?.data?.success) {
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  likeCount:
                    response.data.likeCount ??
                    newLikeCount,
                  dislikeCount:
                    response.data.dislikeCount ??
                    newDislikeCount,
                  userLiked: Boolean(
                    response.data.userLiked
                  ),
                  userDisliked: Boolean(
                    response.data.userDisliked
                  ),
                }
              : comment
          )
        );
      } else {
        await fetchComments();
      }
    } catch (error) {
      console.error(
        "Dislike comment error:",
        error
      );
      await fetchComments();
    } finally {
      setActionLoading((prev) => {
        const updated = { ...prev };
        delete updated[commentId];
        return updated;
      });
    }
  };

  const handleReport = async (commentId) => {
    if (reporting) return;

    try {
      setReporting(true);

      const response = await axios.post(
        `${API_URL}/api/comments/${commentId}/report`,
        {
          reason: reportReason,
        },
        getAuthConfig()
      );

      if (response?.data?.success) {
        toast.success("Comment reported for review.", { id: "comment-report-success" });
        setReportingId(null);
        setReportReason("other");
      } else {
        toast.error(
          response?.data?.message ||
            "Unable to report comment.",
          { id: "comment-report-err" }
        );
      }
    } catch (error) {
      console.error(
        "Report comment error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to report comment.",
        { id: "comment-report-err" }
      );
    } finally {
      setReporting(false);
    }
  };

  const handleDeleteComment = async (
    commentId
  ) => {
    if (!commentId) return;

    try {
      setDeletingId(commentId);

      const response = await axios.delete(
        `${API_URL}/api/comments/${commentId}`,
        getAuthConfig()
      );

      if (response?.data?.success) {
        setComments((prev) =>
          prev.filter(
            (comment) =>
              comment._id !== commentId
          )
        );

        setTranslations((prev) => {
          const updated = { ...prev };
          delete updated[commentId];
          return updated;
        });

        setOpenMenuId(null);
        setDeleteConfirmId(null);

        toast.success("Comment deleted successfully.", { id: "comment-del-success" });
      } else {
        toast.error(
          response?.data?.message ||
            "Unable to delete comment.",
          { id: "comment-del-err" }
        );
      }
    } catch (error) {
      console.error(
        "Delete comment error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to delete comment.",
        { id: "comment-del-err" }
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getTranslationCacheKey = (
    comment,
    targetLanguage
  ) => {
    const commentText = String(
      comment.text || ""
    ).trim();

    return `${comment._id}::${targetLanguage}::${commentText}`;
  };

  const handleTranslate = async (comment, overrideTarget = null) => {
    const commentLang =
      comment.language && comment.language !== "auto" ? comment.language : "en";

    const targetLanguage =
      overrideTarget ||
      translationLanguage[comment._id] ||
      (commentLang === "en" ? "hi" : "en");

    const targetCode =
      LANGUAGE_CODES[targetLanguage] || targetLanguage;

    if (!targetCode) {
      toast.error("This language is not supported for translation.", { id: "comment-lang-unsupported" });
      return;
    }

    const cacheKey =
      getTranslationCacheKey(
        comment,
        targetLanguage
      );

    if (translations[cacheKey]) {
      setTranslations((prev) => ({
        ...prev,
        [comment._id]:
          prev[cacheKey],
      }));
      return;
    }

    const cache =
      loadTranslationCache();

    const cachedTranslation =
      cache[cacheKey];

    if (cachedTranslation?.translatedText) {
      setTranslations((prev) => ({
        ...prev,
        [comment._id]:
          cachedTranslation.translatedText,
        [cacheKey]:
          cachedTranslation.translatedText,
      }));
      return;
    }

    if (targetLanguage === commentLang) {
      toast(
        `This comment is already in ${LANGUAGE_NAMES[targetLanguage] || targetLanguage}. Pick a different language from the dropdown table to translate.`,
        { id: "same-lang-hint" }
      );
      setTranslations((prev) => ({
        ...prev,
        [comment._id]:
          comment.text,
        [cacheKey]:
          comment.text,
      }));
      return;
    }

    try {
      setTranslatingId(comment._id);

      let response;
      try {
        response = await axios.post(
          `${TRANSLATION_API_URL}/translate`,
          {
            text: comment.text,
            target_language: targetCode,
            target: targetLanguage,
            source_language: commentLang !== "auto" ? commentLang : undefined,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 6000,
          }
        );
      } catch {
        // Fallback to Express backend translation endpoint
        response = await axios.post(
          `${API_URL}/api/translate`,
          {
            text: comment.text,
            target_language: targetLanguage,
            target: targetLanguage,
            source_language: commentLang !== "auto" ? commentLang : undefined,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      const translatedText =
        response?.data?.translation || response?.data?.translatedText;

      if (
        response?.data?.success &&
        translatedText &&
        translatedText.trim()
      ) {
        const cleanText = translatedText.trim();

        setTranslations((prev) => ({
          ...prev,
          [comment._id]:
            cleanText,
          [cacheKey]:
            cleanText,
        }));

        const updatedCache =
          loadTranslationCache();

        updatedCache[cacheKey] = {
          translatedText: cleanText,
          sourceText: comment.text,
          targetLanguage,
          createdAt: Date.now(),
        };

        saveTranslationCache(
          updatedCache
        );

        toast.success(
          `Translated to ${LANGUAGE_NAMES[targetLanguage] || targetLanguage}!`,
          { id: `trans-${comment._id}` }
        );
      } else {
        toast.error(
          response?.data?.message ||
            "Unable to translate comment.",
          { id: "comment-trans-err" }
        );
      }
    } catch (error) {
      console.error(
        "Translation error:",
        error
      );

      toast.error(
        "Translation service encountered an error. Please try again.",
        { id: "comment-trans-unavail" }
      );
    } finally {
      setTranslatingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";

    const created = new Date(date);

    if (Number.isNaN(created.getTime())) {
      return "";
    }

    const now = new Date();
    const diff = Math.floor(
      (now - created) / 1000
    );

    if (diff < 60) return "Just now";

    if (diff < 3600) {
      return `${Math.floor(
        diff / 60
      )} min ago`;
    }

    if (diff < 86400) {
      return `${Math.floor(
        diff / 3600
      )} hr ago`;
    }

    if (diff < 604800) {
      return `${Math.floor(
        diff / 86400
      )} days ago`;
    }

    return created.toLocaleDateString(
      "en-IN"
    );
  };

  const getUserName = (comment) => {
    return (
      comment.userId?.username ||
      comment.userId?.name ||
      comment.user?.username ||
      comment.user?.name ||
      "User"
    );
  };

  const getUserInitial = (comment) => {
    return getUserName(comment)
      .charAt(0)
      .toUpperCase();
  };

  return (
    <section className="rounded-3xl border theme-border theme-card p-5 shadow-sm sm:p-6 lg:p-8">
      <div className="mb-7 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
            <MessageCircle size={22} />
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight theme-text sm:text-3xl">
              Comments
            </h2>

            <p className="mt-1 text-sm theme-text-secondary">
              Share your thoughts about this video.
            </p>
          </div>
        </div>

        <div className="flex h-9 min-w-10 items-center justify-center rounded-full bg-blue-500/10 px-3 text-sm font-semibold text-blue-500">
          {comments.length}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-2xl border theme-border theme-input p-4 transition-all duration-200 focus-within:border-blue-500/60 focus-within:ring-4 focus-within:ring-blue-500/10 sm:p-5"
      >
        <textarea
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
          placeholder="Write a comment..."
          maxLength={1000}
          rows={4}
          className="w-full resize-none bg-transparent leading-6 outline-none theme-text placeholder:text-gray-400"
        />

        {/* DRAFT TRANSLATION PREVIEW */}
        {draftTranslatedText && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-blue-500 flex items-center gap-1">
                <Languages size={13} />
                <span>Translated to {LANGUAGE_NAMES[commentLanguage] || commentLanguage} (will be posted):</span>
              </p>
              <p className="text-sm font-medium theme-text mt-1 break-words">
                {draftTranslatedText}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setText(draftTranslatedText);
                  setDraftTranslatedText("");
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition cursor-pointer"
              >
                Use in Box
              </button>
              <button
                type="button"
                onClick={() => setDraftTranslatedText("")}
                className="text-xs px-2 py-1 rounded-lg theme-text-secondary hover:theme-text transition cursor-pointer"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}

        <div className="mt-4 flex flex-col gap-3.5 border-t theme-border pt-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* MULTILINGUAL POSTING LANGUAGE */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
              <LanguageDropdownTable
                selected={commentLanguage}
                onSelect={(newLang) => {
                  setCommentLanguage(newLang);
                  setDraftTranslatedText("");
                }}
                includeAuto={true}
                label="Post Language"
                align="left"
                size="md"
              />

              {commentLanguage !== "auto" && text.trim() && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={handleTranslateDraft}
                  disabled={isTranslatingDraft}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 active:scale-95 disabled:opacity-50 cursor-pointer w-full sm:w-auto shrink-0"
                  title="Translate comment before posting"
                >
                  {isTranslatingDraft ? (
                    <Loader2 size={13} className="animate-spin text-white" />
                  ) : (
                    <Languages size={13} />
                  )}
                  <span>Translate Text</span>
                </motion.button>
              )}
            </div>

            {/* OPTIONAL LOCATION BADGE */}
            <label className="flex items-center gap-2 cursor-pointer text-xs theme-text-secondary select-none hover:theme-text transition-colors shrink-0">
              <input
                type="checkbox"
                checked={shareLocation}
                onChange={(e) => setShareLocation(e.target.checked)}
                className="rounded accent-blue-600 cursor-pointer w-4 h-4"
              />
              <MapPin size={13} className="text-blue-500 shrink-0" />
              <span>Regional badge (Optional)</span>
            </label>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs theme-text-muted">
              {text.length}/1000
            </span>

            <button
              type="submit"
              disabled={
                posting || !text.trim()
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-1 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {posting ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Send size={16} />
              )}

              {posting
                ? "Posting..."
                : "Post Comment"}
            </button>
          </div>
        </div>
      </form>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2
            size={32}
            className="animate-spin text-blue-600"
          />

          <p className="mt-3 text-sm theme-text-muted">
            Loading comments...
          </p>
        </div>
      )}

      {!loading &&
        comments.length === 0 && (
          <div className="rounded-2xl border theme-border theme-input p-10 text-center">
            <MessageCircle
              size={32}
              className="mx-auto text-blue-500"
            />

            <p className="mt-4 font-semibold theme-text">
              No comments yet
            </p>

            <p className="mt-2 text-sm theme-text-secondary">
              Be the first person to share
              your thoughts.
            </p>
          </div>
        )}

      {!loading && comments.length > 0 && (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isLiked = Boolean(
              comment.userLiked
            );

            const isDisliked = Boolean(
              comment.userDisliked
            );

            const likeCount =
              comment.likeCount ??
              comment.likes?.length ??
              0;

            const dislikeCount =
              comment.dislikeCount ??
              comment.dislikes?.length ??
              0;

            const isLikeLoading =
              actionLoading[
                comment._id
              ] === "like";

            const isDislikeLoading =
              actionLoading[
                comment._id
              ] === "dislike";

            const translatedText =
              translations[comment._id];

            const commentLang =
              comment.language && comment.language !== "auto"
                ? comment.language
                : "en";

            const selectedLanguage =
              translationLanguage[
                comment._id
              ] || (commentLang === "en" ? "hi" : "en");

            const isDeleting =
              deletingId === comment._id;

            return (
              <motion.article
                key={comment._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border theme-border theme-input p-4 transition-all duration-300 hover:border-blue-500/40 hover:shadow-lg sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white shadow-md shadow-blue-500/20 cursor-default"
                    >
                      {getUserInitial(comment)}
                    </motion.div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="truncate font-semibold theme-text">
                          {getUserName(comment)}
                        </p>

                        {/* OPTIONAL LOCATION BADGE (CITY HIDDEN FOR PRIVACY) */}
                        {comment.location?.enabled && (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] text-blue-500 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full font-medium"
                            title="Location display enabled (Exact city kept private)"
                          >
                            <MapPin size={10} />
                            Regional Member
                          </span>
                        )}

                        {/* LANGUAGE BADGE */}
                        {comment.language && comment.language !== "auto" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                            <Globe size={10} />
                            {LANGUAGE_NAMES[comment.language] || comment.language}
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 text-xs theme-text-muted">
                        {formatDate(
                          comment.createdAt
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId ===
                            comment._id
                            ? null
                            : comment._id
                        )
                      }
                      className="rounded-xl p-2 theme-text-muted transition-colors hover:bg-blue-500/10 hover:text-blue-500"
                      aria-label="More options"
                    >
                      <MoreVertical size={18} />
                    </motion.button>

                    {openMenuId ===
                      comment._id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-2xl border theme-border theme-card shadow-2xl"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            setDeleteConfirmId(
                              comment._id
                            );
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
                        >
                          <Trash2 size={17} />
                          Delete Comment
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-wrap break-words leading-7 theme-text-secondary">
                  {comment.text}
                </p>

                {translatedText && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 p-4 shadow-sm"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <div className="flex items-center gap-1.5">
                        <Languages size={15} />
                        <span>Translated ({getLanguageObj(selectedLanguage).name})</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(translatedText);
                            toast.success("Copied translation!", { id: `copy-${comment._id}` });
                          }}
                          className="px-2 py-0.5 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/20 transition cursor-pointer text-[11px] font-semibold"
                        >
                          Copy
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTranslations((prev) => {
                              const next = { ...prev };
                              delete next[comment._id];
                              return next;
                            });
                          }}
                          className="px-2 py-0.5 rounded-lg hover:bg-emerald-500/20 transition cursor-pointer text-[11px] font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          Hide
                        </button>
                      </div>
                    </div>

                    <p className="text-sm font-medium leading-relaxed theme-text">
                      {translatedText}
                    </p>
                  </motion.div>
                )}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t theme-border pt-4">
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      type="button"
                      disabled={
                        isLikeLoading ||
                        isDislikeLoading
                      }
                      onClick={() =>
                        handleLike(
                          comment._id
                        )
                      }
                      className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                        isLiked
                          ? "bg-red-500/15 text-red-500 shadow-sm shadow-red-500/20"
                          : "theme-text-secondary hover:bg-red-500/10 hover:text-red-500"
                      }`}
                    >
                      {isLikeLoading ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Heart
                          size={17}
                          className={
                            isLiked
                              ? "fill-red-500 text-red-500"
                              : "transition-transform group-hover:scale-110"
                          }
                        />
                      )}

                      {likeCount}
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      type="button"
                      disabled={
                        isLikeLoading ||
                        isDislikeLoading
                      }
                      onClick={() =>
                        handleDislike(
                          comment._id
                        )
                      }
                      className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                        isDisliked
                          ? "bg-red-500/15 text-red-500 shadow-sm shadow-red-500/20"
                          : "theme-text-secondary hover:bg-red-500/10 hover:text-red-500"
                      }`}
                    >
                      {isDislikeLoading ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <ThumbsDown
                          size={17}
                          className={
                            isDisliked
                              ? "fill-red-500 text-red-500"
                              : ""
                          }
                        />
                      )}

                      {dislikeCount}
                    </motion.button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end w-full sm:w-auto">
                    {/* Responsive Language Dropdown Table & Translate Button Widget */}
                    <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                      <LanguageDropdownTable
                        selected={selectedLanguage}
                        onSelect={(newLang) => {
                          setTranslationLanguage((prev) => ({
                            ...prev,
                            [comment._id]: newLang,
                          }));
                          handleTranslate(comment, newLang);
                        }}
                        includeAuto={false}
                        label=""
                        align="right"
                        size="sm"
                      />

                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        type="button"
                        disabled={translatingId === comment._id}
                        onClick={() =>
                          handleTranslate(comment, selectedLanguage)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-all disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-xs shrink-0"
                        title="Translate this comment"
                      >
                        {translatingId === comment._id ? (
                          <Loader2
                            size={13}
                            className="animate-spin text-emerald-500"
                          />
                        ) : (
                          <Languages size={13} className="text-emerald-500" />
                        )}

                        <span>
                          {translatingId === comment._id
                            ? "Translating..."
                            : "Translate"}
                        </span>
                      </motion.button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setReportingId(
                          comment._id
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold theme-text-secondary hover:bg-red-500/10 hover:text-red-500 transition-all cursor-pointer shrink-0"
                    >
                      <Flag size={15} />
                      <span>Report</span>
                    </button>
                  </div>
                </div>

                {reportingId ===
                  comment._id && (
                  <div className="mt-4 rounded-2xl border theme-border theme-card p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold theme-text">
                          Report this comment
                        </p>

                        <p className="mt-1 text-xs theme-text-muted">
                          Select a reason for reporting.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setReportingId(
                            null
                          )
                        }
                        className="rounded-lg p-2 theme-text-muted transition-all hover:bg-red-500/10 hover:text-red-500"
                      >
                        <X size={17} />
                      </button>
                    </div>

                    <div className="relative mt-4">
                      <select
                        value={reportReason}
                        onChange={(e) =>
                          setReportReason(
                            e.target.value
                          )
                        }
                        className="w-full appearance-none rounded-xl border theme-border theme-input py-2.5 pl-3 pr-9 text-sm theme-text outline-none focus:border-blue-500 cursor-pointer dark:[color-scheme:dark] [color-scheme:light]"
                      >
                        <option value="other" className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 py-1">
                          Other
                        </option>
                        <option value="abusive" className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 py-1">
                          Abusive
                        </option>
                        <option value="spam" className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 py-1">
                          Spam
                        </option>
                        <option value="harassment" className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 py-1">
                          Harassment
                        </option>
                        <option value="hate" className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 py-1">
                          Hate speech
                        </option>
                        <option value="sexual" className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 py-1">
                          Sexual content
                        </option>
                        <option value="misinformation" className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 py-1">
                          Misinformation
                        </option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted"
                      />
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        disabled={reporting}
                        onClick={() =>
                          handleReport(
                            comment._id
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {reporting ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Flag size={16} />
                        )}

                        {reporting
                          ? "Reporting..."
                          : "Submit Report"}
                      </button>

                      <button
                        type="button"
                        disabled={reporting}
                        onClick={() =>
                          setReportingId(
                            null
                          )
                        }
                        className="rounded-xl border theme-border px-4 py-2.5 text-sm font-medium theme-text transition-all hover:border-blue-500 hover:text-blue-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {deleteConfirmId ===
                  comment._id && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border theme-border theme-card p-6 shadow-2xl">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                          <AlertTriangle
                            size={22}
                          />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold theme-text">
                            Delete Comment?
                          </h3>

                          <p className="mt-2 text-sm leading-6 theme-text-secondary">
                            Are you sure you want to delete this comment? This action cannot be undone.
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() =>
                            setDeleteConfirmId(
                              null
                            )
                          }
                          className="rounded-xl border theme-border px-5 py-2.5 text-sm font-semibold theme-text transition-all hover:border-blue-500 hover:text-blue-500 disabled:opacity-50"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() =>
                            handleDeleteComment(
                              comment._id
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 size={16} />
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Comments;