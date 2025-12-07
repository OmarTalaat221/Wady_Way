"use client";
import React from "react";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import ModalVideo from "react-modal-video";
import { useLocale, useTranslations } from "next-intl";

const GallerySection = ({ images, setOpenimg, isOpenimg, isOpen, setOpen }) => {
  const locale = useLocale();
  const t = useTranslations("galleryPackage");

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

  // Render gallery based on number of images
  const renderGallery = () => {
    // Case 1: Only one image
    if (imageCount === 1) {
      return (
        <div className="w-full">
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
            {/* <div
              onClick={() =>
                setOpenimg({ openingState: true, openingIndex: 0 })
              }
              className="absolute left-0 top-0 w-full h-full flex items-center justify-center bg-[rgba(16,12,8,0.6)] text-white text-center font-rubik text-[15px] font-normal tracking-[0.6px] flex-col transition-all duration-[450ms] scale-[0.4] rounded-[10px] opacity-0 group-hover:scale-100 group-hover:opacity-100 cursor-pointer"
            >
              <i className="bi bi-eye text-[#ff7757] text-[35px]" />
            </div> */}
          </div>
        </div>
      );
    }

    // Case 2: Two images
    if (imageCount === 2) {
      return (
        <>
          {images.slice(0, 2).map((image, index) => (
            <div key={index} className="w-full lg:w-1/2">
              <div className="relative transition-all duration-[450ms] h-full group">
                <img
                  src={image.imageBig || "https://via.placeholder.com/600x400"}
                  alt={`Gallery image ${index + 1}`}
                  className="object-cover h-full md:h-full w-full rounded-[10px]"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/600x400";
                  }}
                />
                {/* <div
                  onClick={() =>
                    setOpenimg({ openingState: true, openingIndex: index })
                  }
                  className="absolute left-0 top-0 w-full h-full flex items-center justify-center bg-[rgba(16,12,8,0.6)] text-white text-center font-rubik text-[15px] font-normal tracking-[0.6px] flex-col transition-all duration-[450ms] scale-[0.4] rounded-[10px] opacity-0 group-hover:scale-100 group-hover:opacity-100 cursor-pointer"
                >
                  <i className="bi bi-eye text-[#ff7757] text-[35px]" />
                </div> */}
              </div>
            </div>
          ))}
        </>
      );
    }

    // Case 3: Three or more images (default layout)
    return (
      <>
        {/* Main large image on the left */}
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
            {/* <div
              onClick={() =>
                setOpenimg({ openingState: true, openingIndex: 0 })
              }
              className="absolute left-0 top-0 w-full h-full flex items-center justify-center bg-[rgba(16,12,8,0.6)] text-white text-center font-rubik text-[15px] font-normal tracking-[0.6px] flex-col transition-all duration-[450ms] scale-[0.4] rounded-[10px] opacity-0 group-hover:scale-100 group-hover:opacity-100 cursor-pointer"
            >
              {/* <i className="bi bi-eye text-[#ff7757] text-[35px]" /> 
            </div> */}
          </div>
        </div>

        {/* Right side grid */}
        <div className="w-full lg:w-1/2">
          <div className="grid grid-cols-2 gap-3 h-full">
            {/* Show 2nd and 3rd images */}
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
                {/* <div
                  onClick={() =>
                    setOpenimg({ openingState: true, openingIndex: index + 1 })
                  }
                  className="absolute left-0 top-0 w-full h-full flex items-center justify-center bg-[rgba(16,12,8,0.6)] text-white text-center font-rubik text-[15px] font-normal tracking-[0.6px] flex-col transition-all duration-[450ms] scale-[0.4] rounded-[10px] opacity-0 group-hover:scale-100 group-hover:opacity-100 cursor-pointer"
                >
                  <i className="bi bi-eye text-[#ff7757] text-[35px]" />
                </div> */}
              </div>
            ))}

            {/* 4th position: "View More Images" button (if 4+ images) */}
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
                <button
                  onClick={() =>
                    setOpenimg({ openingState: true, openingIndex: 3 })
                  }
                  className="absolute left-0 top-0 w-full h-full flex items-center justify-center bg-[rgba(16,12,8,0.6)] text-white text-center font-rubik text-[15px] font-normal tracking-[0.6px] flex-col transition-all duration-[450ms] scale-100 rounded-[10px] opacity-100"
                >
                  <i className="bi bi-plus-lg text-[#ff7757] text-[20px]" />
                  <span className="mt-2">{t("viewMoreImages")}</span>
                </button>
              </div>
            )}

            {/* 5th position: "Watch Video" button (if 5+ images OR if exactly 3 images) */}
            {(imageCount >= 5 || imageCount === 3) && (
              <div className="relative transition-all duration-[450ms] h-full group">
                <img
                  src={
                    images[imageCount >= 5 ? 4 : 2]?.imageBig ||
                    "https://via.placeholder.com/300x245"
                  }
                  alt="Video thumbnail"
                  className="object-cover h-full w-full rounded-[10px]"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x245";
                  }}
                />
                <button
                  onClick={() => setOpen(true)}
                  className="absolute left-0 top-0 w-full h-full flex items-center justify-center bg-[rgba(16,12,8,0.6)] text-white text-center font-rubik text-[15px] font-normal tracking-[0.6px] flex-col transition-all duration-[450ms] scale-100 rounded-[10px] opacity-100"
                >
                  <i className="bi bi-play-circle text-[#ff7757] text-[20px]" />
                  <span className="mt-2">{t("watchVideo")}</span>
                </button>
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

      {/* Lightbox for image gallery */}
      <Lightbox
        className="img-fluid"
        open={isOpenimg.openingState}
        plugins={[Fullscreen]}
        index={isOpenimg.openingIndex}
        close={() => setOpenimg({ openingState: false, openingIndex: 0 })}
        styles={{ container: { backgroundColor: "rgba(0, 0, 0, .9)" } }}
        slides={images.map((elem) => ({ src: elem.imageBig }))}
      />

      {/* Video Modal */}
      <ModalVideo
        channel="youtube"
        onClick={() => setOpen(true)}
        isOpen={isOpen}
        animationSpeed="350"
        videoId="r4KpWiK08vM"
        ratio="16:9"
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default GallerySection;
