"use client";
import React, { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import Link from "next/link";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Banner1 = () => {
  const settings = useMemo(() => {
    return {
      slidesPerView: 1,
      speed: 2500,
      spaceBetween: 25,
      effect: "fade",
      fadeEffect: {
        crossFade: true,
      },
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: ".home1-banner-next",
        prevEl: ".home1-banner-prev",
      },
      modules: [Navigation, Pagination],
    };
  }, []);

  return (
    <>
      <div className="home1-banner-area !p-0">
        <div className="container-fluid !p-0">
          <Swiper {...settings} className="swiper home1-banner-slider">
            <SwiperSlide className="swiper-slide">
              <div
                className="home1-banner-wrapper"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(16, 12, 8, 0.4) 0%, rgba(16, 12, 8, 0.4) 100%), url(assets/img/home3/1.jpg)",
                }}
              >
                {/* Slide 1 content */}
                <div className="container">
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="home1-banner-content">
                        <div className="eg-tag">
                          <span>United State</span>
                        </div>
                        <h1>Let's Travel And Explore Destination.</h1>
                        <p>
                          Life is unpredictable, and we understand that plans
                          might change.
                        </p>
                        <div className="banner-content-bottom">
                          <Link href="/package" className="primary-btn1">
                            Book A Trip
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide className="swiper-slide">
              <div
                className="home1-banner-wrapper"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(16, 12, 8, 0.4) 0%, rgba(16, 12, 8, 0.4) 100%), url(assets/img/home3/2.jpg)",
                }}
              >
                {/* Slide 2 content */}
                <div className="container">
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="home1-banner-content">
                        <div className="eg-tag">
                          <span>France</span>
                        </div>
                        <h2>Let's Explore Your Holiday Trip.</h2>
                        <p>
                          Life is unpredictable, and we understand that plans
                          might change.
                        </p>
                        <div className="banner-content-bottom">
                          <Link href="/package" className="primary-btn1">
                            Book A Trip
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide className="swiper-slide">
              <div
                className="home1-banner-wrapper"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(16, 12, 8, 0.4) 0%, rgba(16, 12, 8, 0.4) 100%), url(assets/img/home3/3.jpg)",
                }}
              >
                {/* Slide 3 content */}
                <div className="container">
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="home1-banner-content">
                        <div className="eg-tag">
                          <span>Spain</span>
                        </div>
                        <h2>Let's journey and discover a place.</h2>
                        <p>
                          Life is unpredictable, and we understand that plans
                          might change.
                        </p>
                        <div className="banner-content-bottom">
                          <Link href="/package" className="primary-btn1">
                            Book A Trip
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide className="swiper-slide">
              <div
                className="home1-banner-wrapper"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(16, 12, 8, 0.4) 0%, rgba(16, 12, 8, 0.4) 100%), url(assets/img/home3/4.jpg)",
                }}
              >
                {/* Slide 4 content */}
                <div className="container">
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="home1-banner-content">
                        <div className="eg-tag">
                          <span>United State</span>
                        </div>
                        <h2>Let's trek and venture to a spot.</h2>
                        <p>
                          Life is unpredictable, and we understand that plans
                          might change.
                        </p>
                        <div className="banner-content-bottom">
                          <Link href="/package" className="primary-btn1">
                            Book A Trip
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>

          {/* Navigation Buttons - OUTSIDE Swiper but inside the same container */}
          <div className="slider-btn-grp">
            <div className="slider-btn home1-banner-prev">
              <i className="bi bi-arrow-left" />
            </div>
            <div className="slider-btn home1-banner-next">
              <i className="bi bi-arrow-right" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Banner1;
