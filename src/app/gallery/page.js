"use client";
import Newslatter from "@/components/common/Newslatter";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Topbar from "@/components/topbar/Topbar";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";

const Page = () => {
  const [isOpenimg, setOpenimg] = useState({
    openingState: false,
    openingIndex: 0,
  });
  const images = [
    {
      id: 6,
      imageBig:
        "https://res.cloudinary.com/dbz6ebekj/image/upload/v1740914873/manuel-cosentino-n--CMLApjfI-unsplash_hpknxu.jpg",
    },
    {
      id: 1,
      imageBig:
        "https://res.cloudinary.com/dbz6ebekj/image/upload/v1740914407/agustin-diaz-gargiulo-7F65HDP0-E0-unsplash_fxx9vc.jpg",
    },
    {
      id: 2,
      imageBig:
        "https://res.cloudinary.com/dbz6ebekj/image/upload/v1740912040/thomas-habr-6NmnrAJPq7M-unsplash_habaiu.jpg",
    },
    {
      id: 3,
      imageBig:
        "https://res.cloudinary.com/dbz6ebekj/image/upload/v1740912137/tron-le-aAn-_iTks4E-unsplash_vijiov.jpg",
    },
    {
      id: 4,
      imageBig:
        "https://res.cloudinary.com/dbz6ebekj/image/upload/v1740903308/martijn-vonk-jxZ-gTYPf4g-unsplash_zwv8bx.jpg",
    },
    {
      id: 5,
      imageBig:
        "https://res.cloudinary.com/dbz6ebekj/image/upload/v1740916044/masba-molla-Cdwi5n7Gwes-unsplash_p5ru1h.jpg",
    },
    {
      id: 6,
      imageBig:
        "https://res.cloudinary.com/dbz6ebekj/image/upload/v1740916244/s-m-ibrahim-1NEJkiTTuLU-unsplash_uroybl.jpg",
    },
    {
      id: 7,
      imageBig:
        "https://res.cloudinary.com/dbz6ebekj/image/upload/v1740916458/evgeny-tchebotarev-ZPQE4XssoBc-unsplash_kj3tiw.jpg",
    },
    {
      id: 8,
      imageBig:
        "https://res.cloudinary.com/dbz6ebekj/image/upload/v1740916374/ahmed-hasan-ioA9B-RAFHE-unsplash_uqkvw0.jpg",
    },
    {
      id: 9,
      imageBig:
        "https://res.cloudinary.com/dbz6ebekj/image/upload/v1740915008/caleb-JmuyB_LibRo-unsplash_dsihsn.jpg",
    },
  ];
  return (
    <>
      {/* <Topbar /> */}
      {/* <Header /> */}
      <div className="destination-gallery pt-120 mb-120">
        <div className="container">
          <div className="row g-4 mb-70">
            <div className="col-lg-4 col-sm-6">
              <div className="gallery-img-wrap">
                <img
                  src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740914873/manuel-cosentino-n--CMLApjfI-unsplash_hpknxu.jpg"
                  alt=""
                />
                <a
                  data-fancybox="gallery-01"
                  onClick={() =>
                    setOpenimg({ openingState: true, openingIndex: 0 })
                  }
                >
                  <i className="bi bi-eye" /> Discover Island
                </a>
              </div>
            </div>
            <div className="col-lg-5 col-sm-6">
              <div className="gallery-img-wrap">
                <img
                  src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740914407/agustin-diaz-gargiulo-7F65HDP0-E0-unsplash_fxx9vc.jpg"
                  alt=""
                />
                <a
                  data-fancybox="gallery-01"
                  onClick={() =>
                    setOpenimg({ openingState: true, openingIndex: 1 })
                  }
                >
                  <i className="bi bi-eye" /> Discover Island
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="gallery-img-wrap">
                <img
                  src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740912235/atik-sulianami-gJegRRpCm1g-unsplash_eh0qfz.jpg"
                  alt=""
                />
                <a
                  data-fancybox="gallery-01"
                  onClick={() =>
                    setOpenimg({ openingState: true, openingIndex: 2 })
                  }
                >
                  <i className="bi bi-eye" /> Discover Island
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="gallery-img-wrap">
                <img
                  src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740912137/tron-le-aAn-_iTks4E-unsplash_vijiov.jpg"
                  alt=""
                />
                <a
                  data-fancybox="gallery-01"
                  onClick={() =>
                    setOpenimg({ openingState: true, openingIndex: 3 })
                  }
                >
                  <i className="bi bi-eye" /> Discover Island
                </a>
              </div>
            </div>
            <div className="col-lg-4 col-sm-6">
              <div className="gallery-img-wrap">
                <img
                  src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740912040/thomas-habr-6NmnrAJPq7M-unsplash_habaiu.jpg"
                  alt=""
                />
                <a
                  data-fancybox="gallery-01"
                  onClick={() =>
                    setOpenimg({ openingState: true, openingIndex: 4 })
                  }
                >
                  <i className="bi bi-eye" /> Discover Island
                </a>
              </div>
            </div>
            <div className="col-lg-5 col-sm-6">
              <div className="gallery-img-wrap">
                <img
                  src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740903308/martijn-vonk-jxZ-gTYPf4g-unsplash_zwv8bx.jpg"
                  alt=""
                />
                <a
                  data-fancybox="gallery-01"
                  onClick={() =>
                    setOpenimg({ openingState: true, openingIndex: 5 })
                  }
                >
                  <i className="bi bi-eye" /> Discover Island
                </a>
              </div>
            </div>
            <div className="col-lg-4 col-sm-6">
              <div className="gallery-img-wrap">
                <img
                  src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740903193/chris-karidis-nnzkZNYWHaU-unsplash_iqwgll.jpg"
                  alt=""
                />
                <a
                  data-fancybox="gallery-01"
                  onClick={() =>
                    setOpenimg({ openingState: true, openingIndex: 6 })
                  }
                >
                  <i className="bi bi-eye" /> Discover Island
                </a>
              </div>
            </div>
            <div className="col-lg-5 col-sm-6">
              <div className="gallery-img-wrap">
                <img
                  src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740916655/neil-martin-qWscMESnApA-unsplash_zbp6ki.jpg"
                  alt=""
                />
                <a
                  data-fancybox="gallery-01"
                  onClick={() =>
                    setOpenimg({ openingState: true, openingIndex: 7 })
                  }
                >
                  <i className="bi bi-eye" /> Discover Island
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6">
              <div className="gallery-img-wrap">
                <img
                  src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740916458/evgeny-tchebotarev-ZPQE4XssoBc-unsplash_kj3tiw.jpg"
                  alt=""
                />
                <a
                  data-fancybox="gallery-01"
                  onClick={() =>
                    setOpenimg({ openingState: true, openingIndex: 8 })
                  }
                >
                  <i className="bi bi-eye" /> Discover Island
                </a>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12 d-flex justify-content-center">
              <a href="#" className="primary-btn1">
                Load More
              </a>
            </div>
          </div>
        </div>
      </div>
      <Newslatter />
      <Footer />
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
    </>
  );
};

export default Page;
