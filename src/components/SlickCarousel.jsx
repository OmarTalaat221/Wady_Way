import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const SlickCarousel = ({ images }) => {
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const slider1 = useRef(null);
  const slider2 = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setNav1(slider1.current);
    setNav2(slider2.current);
  }, []);

  const mainSettings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    fade: true,
    asNavFor: nav2,
    infinite: false,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    initialSlide: 0,
    beforeChange: (current, next) => setCurrentSlide(next),
  };

  const thumbnailSettings = {
    slidesToShow: 5,
    slidesToScroll: 1,
    asNavFor: nav1,
    dots: false,
    arrows: false,
    centerMode: false,
    focusOnSelect: true,
    infinite: false,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
  };

  return (
    <div className="w-full">
      <div className="relative mb-4">
        <Slider {...mainSettings} ref={slider1} className="main-slider">
          {images.map((img, index) => (
            <div key={index} className="focus:outline-none">
              <img
                src={img.src}
                alt={img.alt || `car-image-${index}`}
                className="w-full h-[400px] object-cover rounded-lg"
              />
            </div>
          ))}
        </Slider>
      </div>

      <div className="mt-2">
        <Slider
          {...thumbnailSettings}
          ref={slider2}
          className="thumbnail-slider"
        >
          {images.map((img, index) => (
            <div
              key={index}
              className={`px-1 cursor-pointer focus:outline-1 focus:outline-orange-500 ${
                currentSlide === index ? "active-thumb" : ""
              }`}
            >
              <img
                src={img.src}
                alt={img.alt || `car-thumb-${index}`}
                className={`w-full h-20 object-cover rounded cursor-pointer border-2 border-solid transition-all duration-150 ${
                  currentSlide === index
                    ? "border-[#e8a355]"
                    : "border-transparent hover:opacity-80"
                } `}
              />
            </div>
          ))}
        </Slider>
      </div>

      <style jsx global>{`
        .slick-prev,
        .slick-next {
          z-index: 10;
        }
        .slick-prev {
          left: 15px;
        }
        .slick-next {
          right: 15px;
        }
        .slick-slide div {
          outline: none;
        }
      `}</style>
    </div>
  );
};

// Custom Arrows
const NextArrow = (props) => {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute z-10 right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black w-8 h-8 rounded-full flex items-center justify-center shadow-md focus:outline-none transition-all duration-300"
      aria-label="Next slide"
    >
      <svg
        width={8}
        height={13}
        viewBox="0 0 8 13"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M8 6.50008L0 0L5.09091 6.50008L0 13L8 6.50008Z" />
      </svg>
    </button>
  );
};

const PrevArrow = (props) => {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute z-10 left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black w-8 h-8 rounded-full flex items-center justify-center shadow-md focus:outline-none transition-all duration-300"
      aria-label="Previous slide"
    >
      <svg
        width={8}
        height={13}
        viewBox="0 0 8 13"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 6.50008L8 0L2.90909 6.50008L8 13L0 6.50008Z" />
      </svg>
    </button>
  );
};

export default SlickCarousel;
