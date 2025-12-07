"use client";
import Newslatter from "@/components/common/Newslatter";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Topbar from "@/components/topbar/Topbar";
import { useState, useEffect } from "react";
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
  const [visibleImages, setVisibleImages] = useState(9); // Show 9 images initially
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch gallery images from API
  const fetchGalleryImages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${base_url}/user/gallary/select_gallary.php`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.status === "success") {
        // Filter only visible images (hidden = "0")
        const visibleGalleryImages = response.data.message
          .filter((img) => img.hidden === "0")
          .map((img) => ({
            id: img.id,
            imageBig: img.image,
            src: img.image, // For lightbox
            created_at: img.created_at,
          }));

        setImages(visibleGalleryImages);
      } else {
        setError("Failed to load gallery images");
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
      setError("Failed to load gallery. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load gallery on component mount
  useEffect(() => {
    fetchGalleryImages();
  }, []);

  // Get the layout pattern for responsive grid
  const getColumnClass = (index) => {
    const patterns = [
      "col-lg-4 col-sm-6", // 0
      "col-lg-5 col-sm-6", // 1
      "col-lg-3 col-sm-6", // 2
      "col-lg-3 col-sm-6", // 3
      "col-lg-4 col-sm-6", // 4
      "col-lg-5 col-sm-6", // 5
      "col-lg-4 col-sm-6", // 6
      "col-lg-5 col-sm-6", // 7
      "col-lg-3 col-sm-6", // 8
    ];

    return patterns[index % patterns.length];
  };

  // Handle load more
  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleImages((prev) => Math.min(prev + 6, images.length));
      setLoadingMore(false);
    }, 500); // Simulate loading delay
  };

  // Get images to display based on visibleImages count
  const displayedImages = images.slice(0, visibleImages);

  // Loading state
  if (loading) {
    return (
      <>
        <div className="destination-gallery pt-120 mb-120">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6 text-center">
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ minHeight: "400px" }}
                >
                  <div>
                    <div
                      className="spinner-border text-primary mb-3"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Loading gallery images...</p>
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

  // Error state
  if (error) {
    return (
      <>
        <div className="destination-gallery pt-120 mb-120">
          <div className="container">
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
                    <h4 className="text-danger mb-3">
                      Oops! Something went wrong
                    </h4>
                    <p className="text-muted mb-4">{error}</p>
                    <button
                      className="primary-btn1"
                      onClick={fetchGalleryImages}
                    >
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

  // Empty state
  if (images.length === 0) {
    return (
      <>
        <div className="destination-gallery pt-120 mb-120">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6 text-center">
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ minHeight: "400px" }}
                >
                  <div>
                    <i
                      className="bi bi-images text-muted mb-3"
                      style={{ fontSize: "3rem" }}
                    ></i>
                    <h4 className="text-muted mb-3">No Images Found</h4>
                    <p className="text-muted">
                      The gallery is currently empty. Please check back later.
                    </p>
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

  return (
    <>
      {/* <Topbar /> */}
      {/* <Header /> */}
      <div className="destination-gallery pt-120 mb-120">
        <div className="container">
          {/* Gallery Header */}
          <div className="row mb-5">
            <div className="col-lg-12 text-center">
              <h2 className="mb-3">Gallery</h2>
              <p className="text-muted">
                Discover amazing moments captured in our photo gallery
              </p>
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="row g-4 mb-[70px]">
            {displayedImages.map((image, index) => (
              <div key={image.id} className={getColumnClass(index)}>
                <div className="gallery-img-wrap">
                  <img
                    src={image.imageBig}
                    alt={`Gallery image ${image.id}`}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "/placeholder-image.png"; // Add a fallback image
                    }}
                  />
                  <a
                    data-fancybox="gallery-01"
                    className="text-white"
                    onClick={() =>
                      setOpenimg({ openingState: true, openingIndex: index })
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setOpenimg({ openingState: true, openingIndex: index });
                      }
                    }}
                  >
                    <i className="bi bi-eye" /> View Image
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Section */}
          {visibleImages < images.length && (
            <div className="row">
              <div className="col-lg-12 d-flex justify-content-center">
                <button
                  className="primary-btn1"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </span>
                      Loading...
                    </>
                  ) : (
                    <>Load More ({images.length - visibleImages} remaining)</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Gallery Stats */}
          {visibleImages >= images.length && images.length > 0 && (
            <div className="row mt-4">
              <div className="col-lg-12 text-center">
                <p className="text-muted">Showing all {images.length} images</p>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setVisibleImages(9)}
                >
                  <i className="bi bi-arrow-up me-2"></i>
                  Back to Top
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Newslatter />
      <Footer />

      {/* Lightbox for Fullscreen View */}
      <Lightbox
        className="img-fluid"
        open={isOpenimg.openingState}
        plugins={[Fullscreen]}
        index={isOpenimg.openingIndex}
        close={() => setOpenimg({ openingState: false, openingIndex: 0 })}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, .9)" },
          toolbar: { backgroundColor: "rgba(0, 0, 0, .8)" },
        }}
        slides={displayedImages.map((elem) => ({
          src: elem.imageBig,
          alt: `Gallery image ${elem.id}`,
          width: 1200,
          height: 800,
        }))}
        carousel={{
          finite: displayedImages.length <= 1,
        }}
        render={{
          buttonPrev: displayedImages.length <= 1 ? () => null : undefined,
          buttonNext: displayedImages.length <= 1 ? () => null : undefined,
        }}
      />
    </>
  );
};

export default Page;
