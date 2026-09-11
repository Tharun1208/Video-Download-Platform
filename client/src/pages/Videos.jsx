import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  Crown,
} from "lucide-react";

import VideoGrid from "../components/videos/VideoGrid";
import { getAllVideos } from "../api/videoApi";
import { getPexelsVideos } from "../api/pexelsApi";

const categories = [
  "All",
  "Nature",
  "Gaming",
  "Entertainment",
  "Sports",
  "Programming",
  "Technology",
  "Education",
];

function Videos() {
  const [activeCategory, setActiveCategory] =
    useState("All");

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all"); // 'all' | 'free' | 'premium'

  // =========================================================
  // FETCH VIDEOS
  // =========================================================

  useEffect(() => {
    fetchVideos("All");
  }, []);

  const fetchVideos = async (
    category = "All"
  ) => {
    try {
      setLoading(true);

      // =====================================================
      // 1. DATABASE VIDEOS
      // =====================================================

      const params = {};

      if (category !== "All") {
        params.category = category;
      }

      const dbResponse = await getAllVideos(params);

      let dbVideos = [];

      if (dbResponse?.data?.success) {
        dbVideos = (dbResponse.data.videos || []).map((video) => ({
          ...video,
          source: "MongoDB",
          videoId: video._id,
          youtubeId: video.youtubeId || null,
          commentVideoId: video._id,
        }));
      }

      // =====================================================
      // 2. PEXELS VIDEOS (Multi-category blend for 'All')
      // =====================================================

      let pexelsVideos = [];

      if (category === "All") {
        // Fetch diverse categories so 'All' shows a balanced blend
        const diverseTopics = ["technology", "gaming", "nature", "sports", "programming"];
        const settled = await Promise.allSettled(
          diverseTopics.map((topic) => getPexelsVideos(topic))
        );

        settled.forEach((res, idx) => {
          if (res.status === "fulfilled" && res.value?.data?.success) {
            const topic = diverseTopics[idx];
            const items = (res.value.data.videos || []).slice(0, 4).map((video) => {
              const numericId = String(video.id || video.pexelsId || "").replace(/^pexels-/, "");
              return {
                ...video,
                category: topic.charAt(0).toUpperCase() + topic.slice(1),
                source: "Pexels",
                _id: `pexels-${numericId}`,
                videoId: `pexels-${numericId}`,
                pexelsId: numericId,
                commentVideoId: numericId,
              };
            });
            pexelsVideos.push(...items);
          }
        });
      } else {
        const pexelsResponse = await getPexelsVideos(category);
        if (pexelsResponse?.data?.success) {
          pexelsVideos = (pexelsResponse.data.videos || []).map((video) => {
            const numericId = String(video.id || video.pexelsId || "").replace(/^pexels-/, "");
            return {
              ...video,
              category,
              source: "Pexels",
              _id: `pexels-${numericId}`,
              videoId: `pexels-${numericId}`,
              pexelsId: numericId,
              commentVideoId: numericId,
            };
          });
        }
      }

      // =====================================================
      // 3. COMBINE & INTERLEAVE VIDEOS
      // =====================================================

      const combinedVideos = [];
      const maxLength = Math.max(dbVideos.length, pexelsVideos.length);
      for (let i = 0; i < maxLength; i++) {
        if (i < dbVideos.length) combinedVideos.push(dbVideos[i]);
        if (i < pexelsVideos.length) combinedVideos.push(pexelsVideos[i]);
      }

      // =====================================================
      // 4. REMOVE DUPLICATES
      // =====================================================

      const uniqueVideos = Array.from(
        new Map(
          combinedVideos.map((video) => {
            const rawId = video._id || video.videoId || video.id || video.pexelsId;
            const uniqueKey = String(rawId);
            return [uniqueKey, video];
          })
        ).values()
      );

      // =====================================================
      // 5. DEBUG
      // =====================================================

      console.log(
        "===================================="
      );

      console.log(
        "VIDEO DATA"
      );

      console.log(
        "===================================="
      );

      uniqueVideos.forEach(
        (video, index) => {
          console.log(
            `VIDEO ${index + 1}`,
            {
              title: video.title,

              source:
                video.source,

              _id: video._id,

              videoId:
                video.videoId,

              commentVideoId:
                video.commentVideoId,

              youtubeId:
                video.youtubeId,

              pexelsId:
                video.pexelsId,

              videoUrl:
                video.videoUrl,
            }
          );
        }
      );

      console.log(
        "===================================="
      );

      setVideos(uniqueVideos);
    } catch (error) {
      console.error(
        "Video fetching error:",
        error
      );

      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredVideos = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return videos.filter((video) => {
      // 1. Plan Access Filter
      if (planFilter === "free" && video.isPremium) {
        return false;
      }
      if (planFilter === "premium" && !video.isPremium) {
        return false;
      }

      // 2. Search Text Filter
      if (!searchText) {
        return true;
      }

      const title = video.title?.toLowerCase() || "";
      const category = video.category?.toLowerCase() || "";
      const description = video.description?.toLowerCase() || "";

      return (
        title.includes(searchText) ||
        category.includes(searchText) ||
        description.includes(searchText)
      );
    });
  }, [videos, search, planFilter]);

  // =========================================================
  // CATEGORY CHANGE
  // =========================================================

  const handleCategoryChange = (
    category
  ) => {
    setActiveCategory(category);

    setSearch("");

    fetchVideos(category);
  };

  // =========================================================
  // CLEAR SEARCH
  // =========================================================

  const clearSearch = () => {
    setSearch("");
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="
        min-h-screen
        theme-bg
        theme-text
        px-4
        py-6
        sm:px-6
        sm:py-8
        lg:px-8
        xl:px-10
        transition-colors
        duration-300
      "
    >
      {/* =====================================================
          MAIN CONTAINER
      ===================================================== */}

      <div
        className="
          max-w-[1800px]
          mx-auto
        "
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <div
          className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-end
            lg:justify-between
            mb-7
            sm:mb-8
          "
        >
          {/* Heading */}

          <div>
            <h1
              className="
                text-3xl
                sm:text-4xl
                lg:text-5xl
                font-bold
                tracking-tight
                theme-text
              "
            >
              Browse Videos
            </h1>

            <p
              className="
                mt-2
                text-sm
                sm:text-base
                theme-text-secondary
                max-w-2xl
                leading-6
              "
            >
              Explore courses, entertainment,
              technology, sports, and more
              based on your interests.
            </p>
          </div>
        </div>

        {/* ===================================================
            SEARCH
        =================================================== */}

        <div
          className="
            relative
            w-full
            mb-6
            sm:mb-7
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
              w-full
              theme-input
              theme-border
              border
              rounded-2xl
              px-4
              py-3.5
              transition-all
              duration-200
              focus-within:border-blue-500
              focus-within:ring-4
              focus-within:ring-blue-500/10
            "
          >
            <Search
              size={20}
              className="
                theme-text-muted
                shrink-0
              "
            />

            <input
              type="text"
              placeholder="Search videos, categories, or topics..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="
                w-full
                bg-transparent
                outline-none
                theme-text
                text-sm
                sm:text-base
                placeholder:text-gray-400
              "
            />

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="
                  shrink-0
                  w-8
                  h-8
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  theme-text-muted
                  hover:text-blue-500
                  hover:bg-blue-500/10
                  transition-all
                "
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* ===================================================
            CATEGORY HEADER
        =================================================== */}

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              size={17}
              className="theme-text-muted"
            />
            <h2 className="text-sm sm:text-base font-semibold theme-text">
              Categories
            </h2>
            {activeCategory !== "All" && (
              <button
                type="button"
                onClick={() => handleCategoryChange("All")}
                className="ml-2 text-xs text-blue-500 hover:text-blue-400 transition-colors cursor-pointer"
              >
                Clear category
              </button>
            )}
          </div>

          {/* ACCESS PLAN FILTER (ALL / FREE / PREMIUM) */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl theme-bg border theme-border shadow-xs">
            <button
              type="button"
              onClick={() => setPlanFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                planFilter === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "theme-text-secondary hover:theme-text hover:bg-gray-500/10"
              }`}
            >
              All Videos
            </button>
            <button
              type="button"
              onClick={() => setPlanFilter("free")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                planFilter === "free"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "theme-text-secondary hover:theme-text hover:bg-gray-500/10"
              }`}
            >
              Free Only
            </button>
            <button
              type="button"
              onClick={() => setPlanFilter("premium")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                planFilter === "premium"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-sm"
                  : "text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
              }`}
            >
              <Crown size={12} />
              <span>Premium</span>
            </button>
          </div>
        </div>

        {/* ===================================================
            CATEGORIES
        =================================================== */}

        <div
          className="
            flex
            gap-2
            sm:gap-3
            mb-8
            sm:mb-10
            overflow-x-auto
            pb-2
            scrollbar-hide
          "
        >
          {categories.map(
            (category) => {
              const isActive =
                activeCategory ===
                category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    handleCategoryChange(
                      category
                    )
                  }
                  className={`
                    shrink-0
                    px-4
                    sm:px-5
                    py-2.5
                    rounded-full
                    border
                    text-sm
                    font-medium
                    whitespace-nowrap
                    cursor-pointer
                    ${
                      isActive
                        ? `
                          bg-blue-600
                          border-blue-600
                          text-white
                          shadow-md
                        `
                        : `
                          theme-card
                          theme-border
                          theme-text-secondary
                        `
                    }
                  `}
                >
                  {category}
                </button>
              );
            }
          )}
        </div>

        {/* ===================================================
            SEARCH RESULT INFO
        =================================================== */}

        {!loading &&
          search.trim() && (
            <div
              className="
                mb-5
                flex
                flex-wrap
                items-center
                gap-2
                text-sm
                theme-text-secondary
              "
            >
              <span>
                Search results for
              </span>

              <span
                className="
                  font-semibold
                  text-blue-500
                  break-all
                "
              >
                "{search}"
              </span>
            </div>
          )}

        {/* ===================================================
            VIDEO GRID
        =================================================== */}

        <VideoGrid
          videos={filteredVideos}
          loading={loading}
          activeCategory="All"
          search=""
        />

        {/* ===================================================
            NO SEARCH RESULTS
        =================================================== */}

        {!loading &&
          search.trim() &&
          filteredVideos.length ===
            0 && (
            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                py-16
                sm:py-20
                text-center
              "
            >
              <div
                className="
                  w-16
                  h-16
                  rounded-2xl
                  bg-blue-500/10
                  flex
                  items-center
                  justify-center
                  mb-4
                "
              >
                <Search
                  size={28}
                  className="text-blue-500"
                />
              </div>

              <h3
                className="
                  text-lg
                  sm:text-xl
                  font-semibold
                  theme-text
                "
              >
                No videos found
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  theme-text-muted
                  max-w-md
                "
              >
                We couldn't find any videos
                matching your search.
                Try another keyword.
              </p>

              <button
                type="button"
                onClick={clearSearch}
                className="
                  mt-5
                  px-5
                  py-2.5
                  rounded-xl
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  text-sm
                  font-medium
                  transition-all
                "
              >
                Clear Search
              </button>
            </div>
          )}
      </div>
    </div>
  );
}

export default Videos;