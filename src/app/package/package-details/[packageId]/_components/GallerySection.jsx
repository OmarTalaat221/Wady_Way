// src/components/gallery/GallerySection.jsx
"use client";
import React from "react";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import ModalVideo from "react-modal-video";
import { useTranslations } from "next-intl";

const HoverViewOverlay = ({ onClick, label }) => {
  return (
    <a
      style={{ cursor: "pointer", zIndex: 5 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <i className="bi bi-eye" />

      <span className="!text-white"> {label}</span>
    </a>
  );
};

const HoverVideoOverlay = ({ onClick, label }) => {
  return (
    <a
      style={{ cursor: "pointer", zIndex: 5 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <i className="bi bi-play-circle" />

      <span className="!text-white"> {label}</span>
    </a>
  );
};

const HoverMoreButton = ({ onClick, label }) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="StartSlideShowFirstImage"
      style={{ zIndex: 5 }}
    >
      <i className="bi bi-plus-lg" /> {label}
    </button>
  );
};

const FloatingVideoPill = ({ onClick, label }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#295557] px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#e8a355]"
      style={{ cursor: "pointer" }}
    >
      <i className="bi bi-play-circle text-base" />
      <span>{label}</span>
    </div>
  );
};

const ImageCard = ({
  src,
  alt,
  fallback,
  wrapperClassName = "",
  children,
  onClick,
}) => {
  return (
    <div
      className={`gallery-img-wrap position-relative overflow-hidden ${wrapperClassName}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <img
        src={src || fallback}
        className="!h-full w-full object-cover"
        alt={alt}
        onError={(e) => {
          e.target.src = fallback;
        }}
      />
      {children}
    </div>
  );
};

const GallerySection = ({
  images,
  videoId,
  setOpenimg,
  isOpenimg,
  isOpen,
  setOpen,
}) => {
  const t = useTranslations("galleryPackage");

  const hasVideo = !!videoId;
  const imageCount = images?.length || 0;

  const openImage = (index) => {
    setOpenimg({ openingState: true, openingIndex: index });
  };

  const openVideo = () => {
    setOpen(true);
  };

  if (!images || imageCount === 0) {
    return (
      <div className="package-img-group mb-50">
        <div className="row g-3">
          <div className="col-lg-12">
            <div className="gallery-img-wrap position-relative">
              <div className="flex !h-96 w-full items-center justify-center rounded bg-gray-200">
                <p className="text-lg text-gray-500">No images available</p>
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
              <ImageCard
                src={images[0]?.imageBig}
                fallback="https://via.placeholder.com/1200x600"
                alt="Gallery image"
                wrapperClassName="!h-[280px] sm:!h-[360px] lg:!h-[520px]"
                onClick={() => openImage(0)}
              >
                <HoverViewOverlay
                  onClick={() => openImage(0)}
                  label={t("viewMoreImages")}
                />

                {hasVideo && (
                  <FloatingVideoPill
                    onClick={openVideo}
                    label={t("watchVideo")}
                  />
                )}
              </ImageCard>
            </div>
          )}

          {/* ═══════════════ Two Images ═══════════════ */}
          {imageCount === 2 && (
            <>
              {images.slice(0, 2).map((image, index) => (
                <div key={image.id} className="col-lg-6">
                  <ImageCard
                    src={image.imageBig}
                    fallback="https://via.placeholder.com/600x400"
                    alt={`Gallery image ${index + 1}`}
                    wrapperClassName="!h-[240px] sm:!h-[320px] lg:!h-[520px]"
                    onClick={() => openImage(index)}
                  >
                    <HoverViewOverlay
                      onClick={() => openImage(index)}
                      label={t("viewMoreImages")}
                    />

                    {index === 1 && hasVideo && (
                      <FloatingVideoPill
                        onClick={openVideo}
                        label={t("watchVideo")}
                      />
                    )}
                  </ImageCard>
                </div>
              ))}
            </>
          )}

          {/* ═══════════════ Three Images ═══════════════ */}
          {imageCount === 3 && (
            <>
              <div className="col-lg-6">
                <ImageCard
                  src={images[0]?.imageBig}
                  fallback="https://via.placeholder.com/600x520"
                  alt="Main gallery image"
                  wrapperClassName="!h-[280px] sm:!h-[360px] lg:!h-[520px]"
                  onClick={() => openImage(0)}
                >
                  <HoverViewOverlay
                    onClick={() => openImage(0)}
                    label={t("viewMoreImages")}
                  />
                </ImageCard>
              </div>

              <div className="col-lg-6">
                <div className="row g-3">
                  <div className="col-12">
                    <ImageCard
                      src={images[1]?.imageBig}
                      fallback="https://via.placeholder.com/600x250"
                      alt="Gallery image 2"
                      wrapperClassName="!h-[180px] sm:!h-[220px] lg:!h-[252px]"
                      onClick={() => openImage(1)}
                    >
                      <HoverViewOverlay
                        onClick={() => openImage(1)}
                        label={t("viewMoreImages")}
                      />
                    </ImageCard>
                  </div>

                  <div className="col-12">
                    <ImageCard
                      src={images[2]?.imageBig}
                      fallback="https://via.placeholder.com/600x250"
                      alt="Gallery image 3"
                      wrapperClassName={`!h-[180px] sm:!h-[220px] lg:!h-[252px] ${hasVideo ? "active" : ""}`}
                      onClick={() => (hasVideo ? openVideo() : openImage(2))}
                    >
                      {hasVideo ? (
                        <HoverVideoOverlay
                          onClick={openVideo}
                          label={t("watchVideo")}
                        />
                      ) : (
                        <HoverViewOverlay
                          onClick={() => openImage(2)}
                          label={t("viewMoreImages")}
                        />
                      )}
                    </ImageCard>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══════════════ Four Images ═══════════════ */}
          {imageCount === 4 && (
            <>
              <div className="col-lg-6">
                <ImageCard
                  src={images[0]?.imageBig}
                  fallback="https://via.placeholder.com/600x520"
                  alt="Main gallery image"
                  wrapperClassName="!h-[280px] sm:!h-[360px] lg:!h-[520px]"
                  onClick={() => openImage(0)}
                >
                  <HoverViewOverlay
                    onClick={() => openImage(0)}
                    label={t("viewMoreImages")}
                  />
                </ImageCard>
              </div>

              <div className="col-lg-6">
                <div className="row g-3">
                  <div className="col-12">
                    <ImageCard
                      src={images[1]?.imageBig}
                      fallback="https://via.placeholder.com/600x250"
                      alt="Gallery image 2"
                      wrapperClassName="!h-[180px] sm:!h-[220px] lg:!h-[252px]"
                      onClick={() => openImage(1)}
                    >
                      <HoverViewOverlay
                        onClick={() => openImage(1)}
                        label={t("viewMoreImages")}
                      />
                    </ImageCard>
                  </div>

                  <div className="col-6">
                    <ImageCard
                      src={images[2]?.imageBig}
                      fallback="https://via.placeholder.com/300x250"
                      alt="Gallery image 3"
                      wrapperClassName="!h-[180px] sm:!h-[220px] lg:!h-[252px]"
                      onClick={() => openImage(2)}
                    >
                      <HoverViewOverlay
                        onClick={() => openImage(2)}
                        label={t("viewMoreImages")}
                      />
                    </ImageCard>
                  </div>

                  <div className="col-6">
                    <ImageCard
                      src={images[3]?.imageBig}
                      fallback="https://via.placeholder.com/300x250"
                      alt="Gallery image 4"
                      wrapperClassName={`!h-[180px] sm:!h-[220px] lg:!h-[252px] ${hasVideo ? "active" : "active"}`}
                      onClick={() => (hasVideo ? openVideo() : openImage(3))}
                    >
                      {hasVideo ? (
                        <HoverVideoOverlay
                          onClick={openVideo}
                          label={t("watchVideo")}
                        />
                      ) : (
                        <HoverMoreButton
                          onClick={() => openImage(3)}
                          label={t("viewMoreImages")}
                        />
                      )}
                    </ImageCard>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══════════════ Five Or More Images ═══════════════ */}
          {imageCount >= 5 && (
            <>
              <div className="col-lg-6">
                <ImageCard
                  src={images[0]?.imageBig}
                  fallback="https://via.placeholder.com/600x520"
                  alt="Main gallery image"
                  wrapperClassName="!h-[280px] sm:!h-[360px] lg:!h-[520px]"
                  onClick={() => openImage(0)}
                >
                  <HoverViewOverlay
                    onClick={() => openImage(0)}
                    label={t("viewMoreImages")}
                  />
                </ImageCard>
              </div>

              <div className="col-lg-6">
                <div className="row g-3">
                  {images.slice(1, 5).map((image, index) => {
                    const actualIndex = index + 1;
                    const isVideoTile = hasVideo && index === 2;
                    const isMoreTile = imageCount > 5 && index === 3;

                    return (
                      <div key={image.id} className="col-6">
                        <ImageCard
                          src={image.imageBig}
                          fallback="https://via.placeholder.com/300x250"
                          alt={`Gallery image ${actualIndex + 1}`}
                          wrapperClassName={`!h-[180px] sm:!h-[220px] lg:!h-[252px] ${
                            isVideoTile || isMoreTile ? "active" : ""
                          }`}
                          onClick={() => {
                            if (isMoreTile) {
                              openImage(actualIndex);
                              return;
                            }
                            if (isVideoTile) {
                              openVideo();
                              return;
                            }
                            openImage(actualIndex);
                          }}
                        >
                          {isMoreTile ? (
                            <HoverMoreButton
                              onClick={() => openImage(actualIndex)}
                              label={t("viewMoreImages")}
                            />
                          ) : isVideoTile ? (
                            <HoverVideoOverlay
                              onClick={openVideo}
                              label={t("watchVideo")}
                            />
                          ) : (
                            <HoverViewOverlay
                              onClick={() => openImage(actualIndex)}
                              label={t("viewMoreImages")}
                            />
                          )}
                        </ImageCard>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Lightbox
        className="img-fluid"
        open={isOpenimg.openingState}
        plugins={[Fullscreen]}
        index={isOpenimg.openingIndex}
        close={() => setOpenimg({ openingState: false, openingIndex: 0 })}
        styles={{ container: { backgroundColor: "rgba(0, 0, 0, .9)" } }}
        slides={images.map((elem) => ({
          src: elem.imageBig || "https://via.placeholder.com/1200x600",
        }))}
      />

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
