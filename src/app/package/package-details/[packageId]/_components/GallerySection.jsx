"use client";
import React from "react";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import ModalVideo from "react-modal-video";
import { useLocale, useTranslations } from "next-intl";

const GallerySection = ({ images, setOpenimg, isOpenimg, isOpen, setOpen }) => {
  const locale = useLocale();
  const t = useTranslations("galleryPackage");

  return (
    <>
      <div className="package-img-group mb-50">
        <div className="row align-items-center g-3">
          <div className="col-lg-6">
            <div className="gallery-img-wrap">
              <img
                src="https://travelami.templaza.net/wp-content/uploads/2024/03/garrett-parker-DlkF4-dbCOU-unsplash.jpg"
                alt=""
              />
              <a>
                <i
                  className="bi bi-eye"
                  onClick={() =>
                    setOpenimg({ openingState: true, openingIndex: 0 })
                  }
                />
              </a>
            </div>
          </div>
          <div className="col-lg-6 h-100">
            <div className="row g-3 h-100">
              <div className="col-6">
                <div className="gallery-img-wrap">
                  <img
                    src="https://travelami.templaza.net/wp-content/uploads/2024/03/luca-bravo-VowIFDxogG4-unsplash1380.jpg"
                    alt=""
                  />
                  <a>
                    <i
                      className="bi bi-eye"
                      onClick={() =>
                        setOpenimg({
                          openingState: true,
                          openingIndex: 1,
                        })
                      }
                    />
                  </a>
                </div>
              </div>
              <div className="col-6">
                <div className="gallery-img-wrap">
                  <img
                    src="https://travelami.templaza.net/wp-content/uploads/2024/04/alexander-ramsey-dBtWLliLt5k-unsplash.jpg"
                    alt=""
                  />
                  <a>
                    <i
                      className="bi bi-eye"
                      onClick={() =>
                        setOpenimg({
                          openingState: true,
                          openingIndex: 2,
                        })
                      }
                    />
                  </a>
                </div>
              </div>
              <div className="col-6">
                <div className="gallery-img-wrap active">
                  <img
                    src="https://travelami.templaza.net/wp-content/uploads/2024/04/alexander-ramsey-dBtWLliLt5k-unsplash.jpg"
                    alt=""
                  />
                  <button
                    className="StartSlideShowFirstImage "
                    onClick={() =>
                      setOpenimg({
                        openingState: true,
                        openingIndex: 3,
                      })
                    }
                  >
                    <i className="bi bi-plus-lg" /> {t("viewMoreImages")}
                  </button>
                </div>
              </div>
              <div className="col-6">
                <div className="gallery-img-wrap active">
                  <img
                    src="https://travelami.templaza.net/wp-content/uploads/2024/03/pascal-debrunner-1WQ5RZuH9xo-unsplash1380.jpg"
                    alt=""
                  />
                  <a
                    data-fancybox="gallery-01"
                    style={{ cursor: "pointer" }}
                    onClick={() => setOpen(true)}
                  >
                    <i className="bi bi-play-circle" /> {t("watchVideo")}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="others-image-wrap d-none">
        <a href="assets/img/innerpage/package-01.jpg" data-fancybox="images">
          <img src="/assets/img/innerpage/blog-grid-img3.jpg" alt="" />
        </a>
        <a href="assets/img/innerpage/package-02.jpg" data-fancybox="images">
          <img src="/assets/img/innerpage/blog-grid-img3.jpg" alt="" />
        </a>
        <a href="assets/img/innerpage/package-03.jpg" data-fancybox="images">
          <img src="/assets/img/innerpage/blog-grid-img3.jpg" alt="" />
        </a>
        <a href="assets/img/innerpage/package-04.jpg" data-fancybox="images">
          <img src="/assets/img/innerpage/blog-grid-img3.jpg" alt="" />
        </a>
        <a href="assets/img/innerpage/package-05.jpg" data-fancybox="images">
          <img src="/assets/img/innerpage/blog-grid-img3.jpg" alt="" />
        </a>
      </div>
      <Lightbox
        className="img-fluid"
        open={isOpenimg.openingState}
        plugins={[Fullscreen]}
        index={isOpenimg.openingIndex}
        close={() => setOpenimg(false)}
        styles={{ container: { backgroundColor: "rgba(0, 0, 0, .9)" } }}
        slides={images.map(function (elem) {
          return { src: elem.imageBig };
        })}
      />
      <React.Fragment>
        <ModalVideo
          channel="youtube"
          onClick={() => setOpen(true)}
          isOpen={isOpen}
          animationSpeed="350"
          videoId="r4KpWiK08vM"
          ratio="16:9"
          onClose={() => setOpen(false)}
        />
      </React.Fragment>
    </>
  );
};

export default GallerySection;
