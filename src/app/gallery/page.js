"use client";
import Newslatter from "@/components/common/Newslatter";
import Footer from "@/components/footer/Footer";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import axios from "axios";
import { base_url } from "../../uitils/base_url";

const Page = () => {
  const [isOpenimg, setOpenimg] = useState({
    openingState: false,
    openingIndex: 0,
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastId, setLastId] = useState(0);

  // Categories state
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Next.js router hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isFetching = useRef(false);
  const observerTarget = useRef(null);
  const categoryScrollRef = useRef(null);
  const isUpdatingURL = useRef(false);

  // Initialize category filter from URL
  const [activeCategory, setActiveCategory] = useState(() => {
    return searchParams.get("category_id") || "";
  });

  // ✅ Update URL params without reload
  const updateURLParams = useCallback(
    (categoryId) => {
      const params = new URLSearchParams();

      if (categoryId && categoryId !== "") {
        params.set("category_id", categoryId);
      }

      const newURL = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;

      isUpdatingURL.current = true;
      window.history.replaceState(null, "", newURL);

      setTimeout(() => {
        isUpdatingURL.current = false;
      }, 100);
    },
    [pathname]
  );

  // ✅ Sync state with URL params (for browser back/forward)
  useEffect(() => {
    if (isUpdatingURL.current) return;

    const categoryParam = searchParams.get("category_id");
    const newCategory = categoryParam || "";

    if (newCategory !== activeCategory) {
      setActiveCategory(newCategory);
    }
  }, [searchParams]);

  // ✅ Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const response = await axios.get(
        `${base_url}/user/gallary/select_categories.php`
      );

      if (response.data && response.data.status === "success") {
        const categoriesData = response.data.message;

        // Add "All" category at the beginning
        const allCategories = [
          {
            category_id: "",
            category: "All Gallery",
            created_at: new Date().toISOString(),
          },
          ...categoriesData,
        ];

        setCategories(allCategories);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // ✅ Fetch images with category filter
  const fetchImages = async (currentLastId, isInitial = false) => {
    if (isFetching.current) {
      console.log("Already fetching, skipping...");
      return;
    }

    isFetching.current = true;
    console.log("🚀 Fetching with last_id:", currentLastId);

    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Build URL with category filter
      const params = new URLSearchParams();
      params.set("last_id", currentLastId);

      // Add category_id if selected
      if (activeCategory && activeCategory !== "") {
        params.set("category_id", activeCategory);
      }

      const url = `${base_url}/user/gallary/select_gallary.php?${params.toString()}`;
      console.log("📡 Request URL:", url);

      const response = await axios.get(url);
      console.log("📥 Response:", response.data);

      if (response.data && response.data.status === "success") {
        const responseData = response.data.message;

        if (!Array.isArray(responseData) || responseData.length === 0) {
          console.log("🏁 No more images - empty array");
          setHasMore(false);
          return;
        }

        const newImages = responseData
          .filter((img) => img.hidden === "0")
          .map((img) => ({
            id: parseInt(img.id),
            imageBig: img.image,
            src: img.image,
            created_at: img.created_at,
            title: img.title,
          }));

        console.log("📸 New images received:", newImages.length);

        if (newImages.length > 0) {
          const newLastId = newImages[newImages.length - 1].id;
          console.log("🔢 New lastId:", newLastId);

          if (newLastId === currentLastId) {
            console.log("🏁 No more images - same lastId");
            setHasMore(false);
            return;
          }

          setLastId(newLastId);

          if (isInitial) {
            setImages(newImages);
          } else {
            setImages((prev) => {
              const existingIds = new Set(prev.map((img) => img.id));
              const uniqueNew = newImages.filter(
                (img) => !existingIds.has(img.id)
              );

              console.log("✅ Adding unique images:", uniqueNew.length);

              if (uniqueNew.length === 0) {
                setHasMore(false);
                return prev;
              }

              return [...prev, ...uniqueNew];
            });
          }
        } else {
          console.log("🏁 No visible images in response");
          setHasMore(false);
        }
      } else {
        console.log("🏁 Response not successful");
        if (isInitial) setError("Failed to load gallery");
        setHasMore(false);
      }
    } catch (err) {
      console.error("❌ Error:", err);
      if (isInitial) setError("Failed to load gallery");
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetching.current = false;
    }
  };

  // ✅ Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ✅ Reset and fetch when category changes
  useEffect(() => {
    setImages([]);
    setLastId(0);
    setHasMore(true);
    setError(null);
    isFetching.current = false;
    fetchImages(0, true);
  }, [activeCategory]);

  // ✅ Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching.current) {
          console.log("📜 Bottom element visible, loading more...");
          fetchImages(lastId, false);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, lastId]);

  // ✅ Handle category filter click
  const handleCategoryClick = useCallback(
    (categoryId) => {
      setActiveCategory(categoryId);
      updateURLParams(categoryId);
      scrollToActiveCategory(categoryId);
    },
    [updateURLParams]
  );

  // ✅ Scroll to active category
  const scrollToActiveCategory = (categoryId) => {
    if (categoryScrollRef.current) {
      const container = categoryScrollRef.current;
      const activeButton = container.querySelector(
        `[data-category="${categoryId}"]`
      );

      if (activeButton) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();

        const scrollLeft =
          activeButton.offsetLeft -
          containerRect.width / 2 +
          buttonRect.width / 2;

        container.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });
      }
    }
  };

  const getColumnClass = (index) => {
    const patterns = [
      "col-lg-4 col-sm-6",
      "col-lg-5 col-sm-6",
      "col-lg-3 col-sm-6",
      "col-lg-3 col-sm-6",
      "col-lg-4 col-sm-6",
      "col-lg-5 col-sm-6",
      "col-lg-4 col-sm-6",
      "col-lg-5 col-sm-6",
      "col-lg-3 col-sm-6",
    ];
    return patterns[index % patterns.length];
  };

  const resetGallery = () => {
    setImages([]);
    setLastId(0);
    setHasMore(true);
    setError(null);
    setActiveCategory("");
    updateURLParams("");
    isFetching.current = false;
    fetchImages(0, true);
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={`skeleton-${item}`} className={getColumnClass(item)}>
          <div className="gallery-skeleton">
            <div className="skeleton-image"></div>
          </div>
        </div>
      ))}
    </>
  );

  // ✅ Component for Category Filters (reusable)
  const CategoryFilters = () => (
    <div className="mb-5">
      {loadingCategories ? (
        <div className="d-flex gap-2 overflow-auto pb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="skeleton-category"
              style={{
                width: "120px",
                height: "40px",
                borderRadius: "25px",
              }}
            />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div
          ref={categoryScrollRef}
          className="category-scroll-container d-flex gap-3 overflow-auto pb-3"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Spacer for centering on mobile */}
          <div className="flex-shrink-0 d-md-none" style={{ width: "16px" }} />

          {categories.map((cat) => {
            const isActive = activeCategory === cat.category_id;

            return (
              <button
                key={cat.category_id}
                data-category={cat.category_id}
                onClick={() => handleCategoryClick(cat.category_id)}
                className={`category-filter-btn flex-shrink-0 px-4 py-2 rounded-pill fw-medium transition-all position-relative overflow-hidden ${
                  isActive
                    ? "text-white shadow-lg"
                    : "bg-light text-dark border border-secondary"
                }`}
                style={{
                  scrollSnapAlign: "center",
                  whiteSpace: "nowrap",
                  background: isActive
                    ? "linear-gradient(135deg, #295557 0%, #e8a355 100%)"
                    : "",
                  transition: "all 0.3s ease",
                }}
              >
                <span className="position-relative" style={{ zIndex: 10 }}>
                  {cat.category}
                </span>

                {isActive && (
                  <>
                    <div
                      className="position-absolute top-0 start-0 w-100 h-100 bg-white"
                      style={{
                        opacity: 0.1,
                        transform: "scaleX(0)",
                        transformOrigin: "left",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </>
                )}
              </button>
            );
          })}

          {/* Spacer for centering on mobile */}
          <div className="flex-shrink-0 d-md-none" style={{ width: "16px" }} />
        </div>
      ) : null}
    </div>
  );

  // ✅ Loading State - مع Categories
  if (loading && images.length === 0) {
    return (
      <>
        <div className="destination-gallery pt-120 mb-120">
          <div className="container">
            <div className="row mb-5">
              <div className="col-lg-12 text-center">
                <h2 className="mb-3">Gallery</h2>
                <p className="text-muted">
                  Discover amazing moments captured in our photo gallery
                </p>
              </div>
            </div>

            {/* ✅ Categories - Always Visible */}
            <CategoryFilters />

            <div className="row g-4">
              <LoadingSkeleton />
            </div>
          </div>
        </div>
        <Newslatter />
        <Footer />
      </>
    );
  }

  // ✅ Error State - مع Categories
  if (error) {
    return (
      <>
        <div className="destination-gallery pt-120 mb-120">
          <div className="container">
            <div className="row mb-5">
              <div className="col-lg-12 text-center">
                <h2 className="mb-3">Gallery</h2>
                <p className="text-muted">
                  Discover amazing moments captured in our photo gallery
                </p>
              </div>
            </div>

            {/* ✅ Categories - Always Visible */}
            <CategoryFilters />

            <div className="row justify-content-center">
              <div className="col-lg-6 text-center">
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ minHeight: "400px" }}
                >
                  <div>
                    <i
                      className="bi bi-exclamation-triangle text-danger mb-3"
                      style={{ fontSize: "3rem" }}
                    ></i>
                    <h4 className="text-danger mb-3">Something went wrong</h4>
                    <p className="text-muted mb-4">{error}</p>
                    <button className="primary-btn1" onClick={resetGallery}>
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Newslatter />
        <Footer />
      </>
    );
  }

  // ✅ Empty State - مع Categories
  if (images.length === 0 && !loading) {
    return (
      <>
        <div className="destination-gallery pt-120 mb-120">
          <div className="container">
            <div className="row mb-5">
              <div className="col-lg-12 text-center">
                <h2 className="mb-3">Gallery</h2>
                <p className="text-muted">
                  Discover amazing moments captured in our photo gallery
                </p>
              </div>
            </div>

            {/* ✅ Categories - Always Visible */}
            <CategoryFilters />

            <div className="row justify-content-center">
              <div className="col-lg-6 text-center">
                <div style={{ minHeight: "400px", paddingTop: "100px" }}>
                  <i
                    className="bi bi-images text-muted mb-3"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <h4 className="text-muted mb-3">No Images Found</h4>
                  <p className="text-muted mb-4">
                    {activeCategory
                      ? "No images in this category."
                      : "Gallery is empty."}
                  </p>
                  {activeCategory && (
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => handleCategoryClick("")}
                    >
                      View All Gallery
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Newslatter />
        <Footer />
      </>
    );
  }

  // ✅ Main Content - مع Categories
  return (
    <>
      <div className="destination-gallery pt-120 mb-120">
        <div className="container">
          {/* Header */}
          <div className="row mb-5">
            <div className="col-lg-12 text-center">
              <h2 className="mb-3">Gallery</h2>
              <p className="text-muted">
                Discover amazing moments captured in our photo gallery
              </p>
            </div>
          </div>

          {/* ✅ Categories - Always Visible */}
          <CategoryFilters />

          {/* Gallery Grid */}
          <div className="row g-4">
            {images.map((image, index) => (
              <div
                key={`gallery-${image.id}`}
                className={`${getColumnClass(index)} gallery-fade-in`}
                style={{ animationDelay: `${(index % 6) * 0.1}s` }}
              >
                <div className="gallery-img-wrap">
                  <img
                    src={image.imageBig}
                    alt={image.title || `Gallery image ${image.id}`}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "/placeholder-image.png";
                    }}
                  />
                  <a
                    className="text-white"
                    onClick={() =>
                      setOpenimg({ openingState: true, openingIndex: index })
                    }
                    role="button"
                    tabIndex={0}
                  >
                    <i className="bi bi-eye" /> View Image
                  </a>
                </div>
              </div>
            ))}

            {/* Loading More Skeletons */}
            {loadingMore && <LoadingSkeleton />}
          </div>

          {/* Intersection Observer Target */}
          {hasMore && !loadingMore && (
            <div ref={observerTarget} className="loading-trigger"></div>
          )}

          {/* End Message */}
          {!hasMore && images.length > 0 && (
            <div className="row mt-5">
              <div className="col-lg-12 text-center">
                <div className="end-message">
                  <p className="text-muted mb-3">
                    🎉 You've reached the end! All images loaded.
                  </p>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                  >
                    <i className="bi bi-arrow-up"></i> Back to Top
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Newslatter />
      <Footer />

      <Lightbox
        open={isOpenimg.openingState}
        plugins={[Fullscreen]}
        index={isOpenimg.openingIndex}
        close={() => setOpenimg({ openingState: false, openingIndex: 0 })}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, .9)" },
        }}
        slides={images.map((elem) => ({
          src: elem.imageBig,
          alt: elem.title || `Gallery image ${elem.id}`,
        }))}
      />

      {/* CSS Styles */}
      <style jsx>{`
        /* Fade in animation */
        .gallery-fade-in {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Skeleton loader */
        .gallery-skeleton,
        .skeleton-category {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          background: #f0f0f0;
        }

        .skeleton-image {
          width: 100%;
          padding-top: 75%;
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        .skeleton-category {
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* Category scroll */
        .category-scroll-container::-webkit-scrollbar {
          display: none;
        }

        .category-filter-btn:hover {
          transform: scale(1.05);
        }

        .category-filter-btn:active {
          transform: scale(0.95);
        }

        /* Loading trigger */
        .loading-trigger {
          height: 20px;
          margin-top: 40px;
        }

        /* End message */
        .end-message {
          animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Gallery image wrapper */
        .gallery-img-wrap {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          transition: transform 0.3s ease;
        }

        .gallery-img-wrap:hover {
          transform: translateY(-5px);
        }

        .gallery-img-wrap img {
          transition: transform 0.3s ease;
        }

        .gallery-img-wrap:hover img {
          transform: scale(1.05);
        }
      `}</style>
    </>
  );
};

export default Page;
