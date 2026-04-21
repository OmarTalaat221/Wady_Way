// src/components/gallery/GallerySection.jsx
"use client";
import React from "react";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import ModalVideo from "react-modal-video";
import { useLocale, useTranslations } from "next-intl";

const GallerySection = ({
  images,
  videoId,
  setOpenimg,
  isOpenimg,
  isOpen,
  setOpen,
}) => {
  const locale = useLocale();
  const t = useTranslations("galleryPackage");

  const hasVideo = !!videoId;
  const imageCount = images?.length || 0;

  // Handle empty images
  if (!images || imageCount === 0) {
    return (
      <div className="package-img-group mb-50">
        <div className="row g-3">
          <div className="col-lg-12">
            <div className="gallery-img-wrap position-relative">
              <div className="w-full h-96 bg-gray-200 rounded flex items-center justify-center">
                <p className="text-gray-500 text-lg">No images available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="package-img-group mb-50">
        <div className="row g-3">
          {/* ═══════════════ Single Image ═══════════════ */}
          {imageCount === 1 && (
            <div className="col-lg-12">
              <div className="gallery-img-wrap position-relative">
                <img
                  src={
                    images[0]?.imageBig ||
                    "https://via.placeholder.com/1200x600"
                  }
                  className="!h-full"
                  alt="Gallery image"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/1200x600";
                  }}
                />
                <a>
                  <i
                    className="bi bi-eye"
                    onClick={() =>
                      setOpenimg({ openingState: true, openingIndex: 0 })
                    }
                  />
                </a>
                {hasVideo && (
                  <button
                    className="position-absolute bottom-0 end-0 m-3 btn btn-primary"
                    onClick={() => setOpen(true)}
                  >
                    <i className="bi bi-play-circle me-2" />
                    {t("watchVideo")}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════ Two Images ═══════════════ */}
          {imageCount === 2 && (
            <>
              {images.slice(0, 2).map((image, index) => (
                <div key={image.id} className="col-lg-6">
                  <div className="gallery-img-wrap position-relative">
                    <img
                      src={
                        image.imageBig || "https://via.placeholder.com/600x400"
                      }
                      className="!h-full "
                      alt={`Gallery image ${index + 1}`}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/600x400";
                      }}
                    />
                    <a>
                      <i
                        className="bi bi-eye"
                        onClick={() =>
                          setOpenimg({
                            openingState: true,
                            openingIndex: index,
                          })
                        }
                      />{" "}
                      {t("viewMoreImages")}
                    </a>
                    {index === 1 && hasVideo && (
                      <button
                        className="position-absolute bottom-0 end-0 m-3"
                        style={{ cursor: "pointer" }}
                        onClick={() => setOpen(true)}
                      >
                        <i className="bi bi-play-circle" /> {t("watchVideo")}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ═══════════════ Three or More Images ═══════════════ */}
          {imageCount >= 3 && (
            <>
              <div className="col-lg-6">
                <div className="gallery-img-wrap">
                  <img
                    src={
                      images[0]?.imageBig ||
                      "https://via.placeholder.com/600x500"
                    }
                    className="!h-full"
                    alt="Main gallery image"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/600x500";
                    }}
                  />
                  <a>
                    <i
                      className="bi bi-eye"
                      onClick={() =>
                        setOpenimg({ openingState: true, openingIndex: 0 })
                      }
                    />{" "}
                    {t("viewMoreImages")}
                  </a>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="row g-3">
                  {images
                    .slice(1, imageCount >= 5 ? 5 : imageCount)
                    .map((image, index) => (
                      <div key={image.id} className="col-6">
                        <div
                          className={`gallery-img-wrap ${index >= 2 ? "active" : ""}`}
                        >
                          <img
                            src={
                              image.imageBig ||
                              "https://via.placeholder.com/300x245"
                            }
                            className="!h-full"
                            alt={`Gallery image ${index + 2}`}
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/300x245";
                            }}
                          />

                          {/* Last image with "View More" overlay when > 5 images */}
                          {index === 3 && imageCount > 5 ? (
                            <button
                              onClick={() =>
                                setOpenimg({
                                  openingState: true,
                                  openingIndex: index + 1,
                                })
                              }
                              className="StartSlideShowFirstImage"
                            >
                              <i className="bi bi-plus-lg" />{" "}
                              {t("viewMoreImages")}
                            </button>
                          ) : /* Video overlay on 3rd thumbnail */
                          index === 2 && hasVideo ? (
                            <a
                              data-fancybox="gallery-01"
                              style={{ cursor: "pointer" }}
                              onClick={() => setOpen(true)}
                            >
                              <i className="bi bi-play-circle" />{" "}
                              {t("watchVideo")}
                            </a>
                          ) : /* "View More" on 3rd thumbnail when exactly 4 images & no video */
                          index === 2 && !hasVideo && imageCount === 4 ? (
                            <button
                              onClick={() =>
                                setOpenimg({
                                  openingState: true,
                                  openingIndex: index + 1,
                                })
                              }
                              className="StartSlideShowFirstImage"
                            >
                              <i className="bi bi-plus-lg" />{" "}
                              {t("viewMoreImages")}
                            </button>
                          ) : index === 3 && hasVideo ? (
                            <></>
                          ) : null}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══════════════ Lightbox ═══════════════ */}
      <Lightbox
        className="img-fluid"
        open={isOpenimg.openingState}
        plugins={[Fullscreen]}
        index={isOpenimg.openingIndex}
        close={() => setOpenimg({ openingState: false, openingIndex: 0 })}
        styles={{ container: { backgroundColor: "rgba(0, 0, 0, .9)" } }}
        slides={images.map((elem) => ({ src: elem.imageBig }))}
      />

      {/* ═══════════════ Video Modal ═══════════════ */}
      {hasVideo && (
        <ModalVideo
          channel="youtube"
          isOpen={isOpen}
          animationSpeed="350"
          videoId={videoId}
          ratio="16:9"
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default GallerySection;
