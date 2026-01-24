"use client";
import React from "react";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import ModalVideo from "react-modal-video";
import { useLocale, useTranslations } from "next-intl";

const GallerySection = ({
  images,
  videoId, // ✅ استقبال videoId مباشرة
  setOpenimg,
  isOpenimg,
  isOpen,
  setOpen,
}) => {
  const locale = useLocale();
  const t = useTranslations("galleryPackage");

  const hasVideo = !!videoId; // ✅ التحقق من وجود فيديو

  // Handle empty images
  if (!images || images.length === 0) {
    return (
      <div className="rounded-[10px] bg-white p-[10px] shadow-[0px_4px_25px_0px_rgba(0,0,0,0.08)] mb-[50px]">
        <div className="w-full h-96 bg-gray-200 rounded-[10px] flex items-center justify-center">
          <p className="text-gray-500 text-lg">No images available</p>
        </div>
      </div>
    );
  }

  const imageCount = images.length;

  const renderGallery = () => {
    if (imageCount === 1) {
      return (
        <div className="w-full relative">
          <div className="relative transition-all duration-[450ms] h-full group">
            <img
              src={
                images[0]?.imageBig || "https://via.placeholder.com/1200x600"
              }
              alt="Gallery image"
              className="object-cover h-full md:h-full w-full rounded-[10px]"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/1200x600";
              }}
            />
          </div>
          {hasVideo && (
            <button
              onClick={() => setOpen(true)}
              className="absolute bottom-4 right-4 flex items-center gap-2 bg-[rgba(16,12,8,0.8)] hover:bg-[rgba(16,12,8,0.95)] text-white px-4 py-2 rounded-lg transition-all duration-300"
            >
              <i className="bi bi-play-circle text-[rgb(232,163,85)] text-[20px]" />
              <span>{t("watchVideo")}</span>
            </button>
          )}
        </div>
      );
    }

    if (imageCount === 2) {
      return (
        <>
          {images.slice(0, 2).map((image, index) => (
            <div key={index} className="w-full lg:w-1/2 relative">
              <div className="relative transition-all duration-[450ms] h-full group">
                <img
                  src={image.imageBig || "https://via.placeholder.com/600x400"}
                  alt={`Gallery image ${index + 1}`}
                  className="object-cover h-full md:h-full w-full rounded-[10px]"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/600x400";
                  }}
                />
              </div>
              {index === 1 && hasVideo && (
                <button
                  onClick={() => setOpen(true)}
                  className="absolute inset-0 flex items-center justify-center bg-[rgba(16,12,8,0.6)] text-white text-center font-rubik text-[15px] font-normal tracking-[0.6px] flex-col rounded-[10px] transition-all duration-300 hover:bg-[rgba(16,12,8,0.8)]"
                >
                  <i className="bi bi-play-circle text-[rgb(232,163,85)] text-[35px]" />
                  <span className="mt-2">{t("watchVideo")}</span>
                </button>
              )}
            </div>
          ))}
        </>
      );
    }

    // 3+ images
    return (
      <>
        <div className="w-full lg:w-1/2">
          <div className="relative transition-all duration-[450ms] h-full group">
            <img
              src={images[0]?.imageBig || "https://via.placeholder.com/600x500"}
              alt="Main gallery image"
              className="object-cover h-full md:h-full w-full rounded-[10px]"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/600x500";
              }}
            />
          </div>
        </div>

        <div className="w-full lg:w-1/2">
          <div className="grid grid-cols-2 gap-3 h-full">
            {images.slice(1, 3).map((image, index) => (
              <div
                key={index}
                className="relative transition-all duration-[450ms] h-full group"
              >
                <img
                  src={image.imageBig || "https://via.placeholder.com/300x245"}
                  alt={`Gallery image ${index + 2}`}
                  className="object-cover h-full w-full rounded-[10px]"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x245";
                  }}
                />
              </div>
            ))}

            {imageCount >= 4 && (
              <div className="relative transition-all duration-[450ms] h-full group">
                <img
                  src={
                    images[3]?.imageBig || "https://via.placeholder.com/300x245"
                  }
                  alt="More images"
                  className="object-cover h-full w-full rounded-[10px]"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x245";
                  }}
                />

                {hasVideo && (
                  <button
                    onClick={() => setOpen(true)}
                    className="absolute left-0 top-0 w-full h-full flex items-center justify-center bg-[rgba(16,12,8,0.6)] text-white text-center font-rubik text-[15px] font-normal tracking-[0.6px] flex-col transition-all duration-[450ms] scale-100 rounded-[10px] opacity-100 hover:bg-[rgba(16,12,8,0.8)]"
                  >
                    <i className="bi bi-play-circle text-[rgb(232,163,85)] text-[35px]" />
                    <span className="mt-2">{t("watchVideo")}</span>
                  </button>
                )}
              </div>
            )}

            {imageCount >= 5 && (
              <div className="relative transition-all duration-[450ms] h-full group">
                <img
                  src={
                    images[
                      Math.min(
                        imageCount >= 5 ? 4 : imageCount - 1,
                        imageCount - 1
                      )
                    ]?.imageBig || "https://via.placeholder.com/300x245"
                  }
                  alt="Video thumbnail"
                  className="object-cover h-full w-full rounded-[10px]"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x245";
                  }}
                />

                {imageCount > 5 && (
                  <button
                    onClick={() =>
                      setOpenimg({ openingState: true, openingIndex: 3 })
                    }
                    className="absolute left-0 top-0 w-full h-full flex items-center justify-center bg-[rgba(16,12,8,0.6)] text-white text-center font-rubik text-[15px] font-normal tracking-[0.6px] flex-col transition-all duration-[450ms] scale-100 rounded-[10px] opacity-100 hover:bg-[rgba(16,12,8,0.8)]"
                  >
                    <i className="bi bi-plus-lg text-[rgb(232,163,85)] text-[20px]" />
                    <span className="mt-2">{t("viewMoreImages")}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="rounded-[10px] bg-white p-[10px] shadow-[0px_4px_25px_0px_rgba(0,0,0,0.08)] mb-[50px]">
        <div className="flex gap-3 items-stretch">{renderGallery()}</div>
      </div>

      <Lightbox
        className="img-fluid"
        open={isOpenimg.openingState}
        plugins={[Fullscreen]}
        index={isOpenimg.openingIndex}
        close={() => setOpenimg({ openingState: false, openingIndex: 0 })}
        styles={{ container: { backgroundColor: "rgba(0, 0, 0, .9)" } }}
        slides={images.map((elem) => ({ src: elem.imageBig }))}
      />

      {hasVideo && (
        <ModalVideo
          channel="youtube"
          isOpen={isOpen}
          animationSpeed="350"
          videoId={videoId} // ✅ استخدام videoId مباشرة
          ratio="16:9"
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default GallerySection;
