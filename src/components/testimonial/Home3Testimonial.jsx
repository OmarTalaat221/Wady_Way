"use client";
import React, { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, {
  Autoplay,
  EffectFade,
  Navigation,
  Pagination,
} from "swiper";
SwiperCore.use([Autoplay, EffectFade, Navigation, Pagination]);

const Home3Testimonial = () => {
  const settings = useMemo(() => {
    return {
      slidesPerView: "auto",
      speed: 2500,
      spaceBetween: 25,
      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination5",
        clickable: true,
      },

      breakpoints: {
        280: {
          slidesPerView: 1,
        },
        386: {
          slidesPerView: 1,
        },
        576: {
          slidesPerView: 1,
          spaceBetween: 15,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 15,
        },
        992: {
          slidesPerView: 2,
          spaceBetween: 15,
        },
        1200: {
          slidesPerView: 3,
          spaceBetween: 15,
        },
        1400: {
          slidesPerView: 3,
        },
      },
    };
  }, []);
  return (
    <>
      <div className="home3-testimonial-section mb-120">
        <div className="row mb-50">
          <div className="col-lg-12 d-flex justify-content-center">
            <div className="section-title2 two text-center">
              <h2>Reviews by Travellers</h2>
              <p>
                Etiam ac tortor id purus commodo vulputate. Vestibulum porttitor
                erat felis and sed vehicula tortor malesuada gravida. Mauris
                volutpat enim quis.
              </p>
            </div>
          </div>
        </div>
        <div className="testimonial-card-slider-area">
          <div className="row mb-50">
            <div className="col-lg-12">
              <Swiper
                {...settings}
                className="swiper home3-testimonial-card-slider"
              >
                <div className="swiper-wrapper">
                  <SwiperSlide className="swiper-slide">
                    <div className="testimonial-card2">
                      <ul className="rating">
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                      </ul>
                      <h4>Journey Beautiful Indonesia</h4>
                      <p>
                        “I cannot express enough how satisfied I am with the
                        webgot deve services provided by Egens Lab from the
                        initial.”
                      </p>
                      <div className="tesimonial-card-bottom">
                        <div className="quote">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={74}
                            height={51}
                            viewBox="0 0 74 51"
                          >
                            <g>
                              <path d="M38.7831 34.2125C38.8172 34.5611 38.8853 34.9183 38.9704 35.267C39.7281 44.0775 47.1264 51 56.1422 51C65.6688 51 73.3906 43.2866 73.3906 33.7702C73.3906 24.526 66.103 17.0082 56.9595 16.583C59.1645 13.1047 62.7146 10.2898 67.048 8.96309L67.1928 8.92057C69.202 8.30826 70.5897 6.35226 70.4024 4.17515C70.1895 1.66637 67.9845 -0.196075 65.4645 0.0165336C58.0492 0.645856 50.6339 4.43028 45.5939 10.5789C43.0654 13.6405 41.1073 17.2463 39.9154 21.1753C38.715 25.0958 38.3063 29.331 38.715 33.5066L38.7831 34.2125Z" />
                              <path d="M0.222559 34.2125C0.256613 34.5611 0.324725 34.9183 0.409857 35.267C1.16756 44.0775 8.56582 51 17.5817 51C27.1083 51 34.8301 43.2866 34.8301 33.7702C34.8301 24.526 27.5425 17.0082 18.399 16.583C20.604 13.1047 24.1541 10.2898 28.4875 8.96309L28.6322 8.92057C30.6414 8.30826 32.0291 6.35226 31.8418 4.17515C31.629 1.66637 29.424 -0.196075 26.904 0.0165336C19.4887 0.645856 12.0734 4.43028 7.03338 10.5789C4.50486 13.6405 2.54675 17.2463 1.35486 21.1753C0.154451 25.0958 -0.254202 29.331 0.154448 33.5066L0.222559 34.2125Z" />
                            </g>
                          </svg>
                        </div>
                        <div className="author-area">
                          <div className="author-img">
                            <img
                              src="/assets/img/home3/testi-author-img1.png"
                              alt=""
                            />
                          </div>
                          <div className="author-name-desig">
                            <h5>Liam Nohkan</h5>
                            <span>Founder, Egenslab</span>
                          </div>
                        </div>
                        <div className="quote">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={74}
                            height={51}
                            viewBox="0 0 74 51"
                          >
                            <g>
                              <path d="M34.6075 16.7875C34.5735 16.4389 34.5054 16.0817 34.4202 15.733C33.6625 6.92252 26.2643 0 17.2484 0C7.72178 0 0 7.71343 0 17.2298C0 26.474 7.28758 33.9918 16.4311 34.417C14.2261 37.8953 10.676 40.7102 6.34258 42.0369L6.19785 42.0794C4.18866 42.6917 2.80095 44.6477 2.98825 46.8248C3.20109 49.3336 5.40609 51.1961 7.9261 50.9835C15.3414 50.3541 22.7567 46.5697 27.7967 40.4211C30.3252 37.3595 32.2833 33.7537 33.4752 29.8247C34.6756 25.9042 35.0843 21.669 34.6756 17.4934L34.6075 16.7875Z" />
                              <path d="M73.1681 16.7875C73.134 16.4389 73.0659 16.0817 72.9808 15.733C72.2231 6.92252 64.8248 0 55.809 0C46.2823 0 38.5605 7.71343 38.5605 17.2298C38.5605 26.474 45.8481 33.9918 54.9917 34.417C52.7867 37.8953 49.2365 40.7102 44.9031 42.0369L44.7584 42.0794C42.7492 42.6917 41.3615 44.6477 41.5488 46.8248C41.7616 49.3336 43.9666 51.1961 46.4866 50.9835C53.9019 50.3541 61.3172 46.5697 66.3572 40.4211C68.8858 37.3595 70.8439 33.7537 72.0358 29.8247C73.2362 25.9042 73.6448 21.669 73.2362 17.4934L73.1681 16.7875Z" />
                            </g>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                    <div className="testimonial-card2">
                      <ul className="rating">
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                      </ul>
                      <h4>Expedition Lovely Brazil</h4>
                      <p>
                        “I cannot express enough how satisfied I am with the
                        webgot deve services provided by Egens Lab from the
                        initial.”
                      </p>
                      <div className="tesimonial-card-bottom">
                        <div className="quote">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={74}
                            height={51}
                            viewBox="0 0 74 51"
                          >
                            <g>
                              <path d="M38.7831 34.2125C38.8172 34.5611 38.8853 34.9183 38.9704 35.267C39.7281 44.0775 47.1264 51 56.1422 51C65.6688 51 73.3906 43.2866 73.3906 33.7702C73.3906 24.526 66.103 17.0082 56.9595 16.583C59.1645 13.1047 62.7146 10.2898 67.048 8.96309L67.1928 8.92057C69.202 8.30826 70.5897 6.35226 70.4024 4.17515C70.1895 1.66637 67.9845 -0.196075 65.4645 0.0165336C58.0492 0.645856 50.6339 4.43028 45.5939 10.5789C43.0654 13.6405 41.1073 17.2463 39.9154 21.1753C38.715 25.0958 38.3063 29.331 38.715 33.5066L38.7831 34.2125Z" />
                              <path d="M0.222559 34.2125C0.256613 34.5611 0.324725 34.9183 0.409857 35.267C1.16756 44.0775 8.56582 51 17.5817 51C27.1083 51 34.8301 43.2866 34.8301 33.7702C34.8301 24.526 27.5425 17.0082 18.399 16.583C20.604 13.1047 24.1541 10.2898 28.4875 8.96309L28.6322 8.92057C30.6414 8.30826 32.0291 6.35226 31.8418 4.17515C31.629 1.66637 29.424 -0.196075 26.904 0.0165336C19.4887 0.645856 12.0734 4.43028 7.03338 10.5789C4.50486 13.6405 2.54675 17.2463 1.35486 21.1753C0.154451 25.0958 -0.254202 29.331 0.154448 33.5066L0.222559 34.2125Z" />
                            </g>
                          </svg>
                        </div>
                        <div className="author-area">
                          <div className="author-img">
                            <img
                              src="/assets/img/home3/testi-author-img2.png"
                              alt=""
                            />
                          </div>
                          <div className="author-name-desig">
                            <h5>David Beckham</h5>
                            <span>Founder, Egenslab</span>
                          </div>
                        </div>
                        <div className="quote">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={74}
                            height={51}
                            viewBox="0 0 74 51"
                          >
                            <g>
                              <path d="M34.6075 16.7875C34.5735 16.4389 34.5054 16.0817 34.4202 15.733C33.6625 6.92252 26.2643 0 17.2484 0C7.72178 0 0 7.71343 0 17.2298C0 26.474 7.28758 33.9918 16.4311 34.417C14.2261 37.8953 10.676 40.7102 6.34258 42.0369L6.19785 42.0794C4.18866 42.6917 2.80095 44.6477 2.98825 46.8248C3.20109 49.3336 5.40609 51.1961 7.9261 50.9835C15.3414 50.3541 22.7567 46.5697 27.7967 40.4211C30.3252 37.3595 32.2833 33.7537 33.4752 29.8247C34.6756 25.9042 35.0843 21.669 34.6756 17.4934L34.6075 16.7875Z" />
                              <path d="M73.1681 16.7875C73.134 16.4389 73.0659 16.0817 72.9808 15.733C72.2231 6.92252 64.8248 0 55.809 0C46.2823 0 38.5605 7.71343 38.5605 17.2298C38.5605 26.474 45.8481 33.9918 54.9917 34.417C52.7867 37.8953 49.2365 40.7102 44.9031 42.0369L44.7584 42.0794C42.7492 42.6917 41.3615 44.6477 41.5488 46.8248C41.7616 49.3336 43.9666 51.1961 46.4866 50.9835C53.9019 50.3541 61.3172 46.5697 66.3572 40.4211C68.8858 37.3595 70.8439 33.7537 72.0358 29.8247C73.2362 25.9042 73.6448 21.669 73.2362 17.4934L73.1681 16.7875Z" />
                            </g>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                    <div className="testimonial-card2">
                      <ul className="rating">
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                      </ul>
                      <h4>Trek Stunning France</h4>
                      <p>
                        “I cannot express enough how satisfied I am with the
                        webgot deve services provided by Egens Lab from the
                        initial.”
                      </p>
                      <div className="tesimonial-card-bottom">
                        <div className="quote">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={74}
                            height={51}
                            viewBox="0 0 74 51"
                          >
                            <g>
                              <path d="M38.7831 34.2125C38.8172 34.5611 38.8853 34.9183 38.9704 35.267C39.7281 44.0775 47.1264 51 56.1422 51C65.6688 51 73.3906 43.2866 73.3906 33.7702C73.3906 24.526 66.103 17.0082 56.9595 16.583C59.1645 13.1047 62.7146 10.2898 67.048 8.96309L67.1928 8.92057C69.202 8.30826 70.5897 6.35226 70.4024 4.17515C70.1895 1.66637 67.9845 -0.196075 65.4645 0.0165336C58.0492 0.645856 50.6339 4.43028 45.5939 10.5789C43.0654 13.6405 41.1073 17.2463 39.9154 21.1753C38.715 25.0958 38.3063 29.331 38.715 33.5066L38.7831 34.2125Z" />
                              <path d="M0.222559 34.2125C0.256613 34.5611 0.324725 34.9183 0.409857 35.267C1.16756 44.0775 8.56582 51 17.5817 51C27.1083 51 34.8301 43.2866 34.8301 33.7702C34.8301 24.526 27.5425 17.0082 18.399 16.583C20.604 13.1047 24.1541 10.2898 28.4875 8.96309L28.6322 8.92057C30.6414 8.30826 32.0291 6.35226 31.8418 4.17515C31.629 1.66637 29.424 -0.196075 26.904 0.0165336C19.4887 0.645856 12.0734 4.43028 7.03338 10.5789C4.50486 13.6405 2.54675 17.2463 1.35486 21.1753C0.154451 25.0958 -0.254202 29.331 0.154448 33.5066L0.222559 34.2125Z" />
                            </g>
                          </svg>
                        </div>
                        <div className="author-area">
                          <div className="author-img">
                            <img
                              src="/assets/img/home3/testi-author-img3.png"
                              alt=""
                            />
                          </div>
                          <div className="author-name-desig">
                            <h5>Hugo Loris</h5>
                            <span>Founder, Egenslab</span>
                          </div>
                        </div>
                        <div className="quote">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={74}
                            height={51}
                            viewBox="0 0 74 51"
                          >
                            <g>
                              <path d="M34.6075 16.7875C34.5735 16.4389 34.5054 16.0817 34.4202 15.733C33.6625 6.92252 26.2643 0 17.2484 0C7.72178 0 0 7.71343 0 17.2298C0 26.474 7.28758 33.9918 16.4311 34.417C14.2261 37.8953 10.676 40.7102 6.34258 42.0369L6.19785 42.0794C4.18866 42.6917 2.80095 44.6477 2.98825 46.8248C3.20109 49.3336 5.40609 51.1961 7.9261 50.9835C15.3414 50.3541 22.7567 46.5697 27.7967 40.4211C30.3252 37.3595 32.2833 33.7537 33.4752 29.8247C34.6756 25.9042 35.0843 21.669 34.6756 17.4934L34.6075 16.7875Z" />
                              <path d="M73.1681 16.7875C73.134 16.4389 73.0659 16.0817 72.9808 15.733C72.2231 6.92252 64.8248 0 55.809 0C46.2823 0 38.5605 7.71343 38.5605 17.2298C38.5605 26.474 45.8481 33.9918 54.9917 34.417C52.7867 37.8953 49.2365 40.7102 44.9031 42.0369L44.7584 42.0794C42.7492 42.6917 41.3615 44.6477 41.5488 46.8248C41.7616 49.3336 43.9666 51.1961 46.4866 50.9835C53.9019 50.3541 61.3172 46.5697 66.3572 40.4211C68.8858 37.3595 70.8439 33.7537 72.0358 29.8247C73.2362 25.9042 73.6448 21.669 73.2362 17.4934L73.1681 16.7875Z" />
                            </g>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                    <div className="testimonial-card2">
                      <ul className="rating">
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                      </ul>
                      <h4>Tour Breathtaking England</h4>
                      <p>
                        “I cannot express enough how satisfied I am with the
                        webgot deve services provided by Egens Lab from the
                        initial.”
                      </p>
                      <div className="tesimonial-card-bottom">
                        <div className="quote">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={74}
                            height={51}
                            viewBox="0 0 74 51"
                          >
                            <g>
                              <path d="M38.7831 34.2125C38.8172 34.5611 38.8853 34.9183 38.9704 35.267C39.7281 44.0775 47.1264 51 56.1422 51C65.6688 51 73.3906 43.2866 73.3906 33.7702C73.3906 24.526 66.103 17.0082 56.9595 16.583C59.1645 13.1047 62.7146 10.2898 67.048 8.96309L67.1928 8.92057C69.202 8.30826 70.5897 6.35226 70.4024 4.17515C70.1895 1.66637 67.9845 -0.196075 65.4645 0.0165336C58.0492 0.645856 50.6339 4.43028 45.5939 10.5789C43.0654 13.6405 41.1073 17.2463 39.9154 21.1753C38.715 25.0958 38.3063 29.331 38.715 33.5066L38.7831 34.2125Z" />
                              <path d="M0.222559 34.2125C0.256613 34.5611 0.324725 34.9183 0.409857 35.267C1.16756 44.0775 8.56582 51 17.5817 51C27.1083 51 34.8301 43.2866 34.8301 33.7702C34.8301 24.526 27.5425 17.0082 18.399 16.583C20.604 13.1047 24.1541 10.2898 28.4875 8.96309L28.6322 8.92057C30.6414 8.30826 32.0291 6.35226 31.8418 4.17515C31.629 1.66637 29.424 -0.196075 26.904 0.0165336C19.4887 0.645856 12.0734 4.43028 7.03338 10.5789C4.50486 13.6405 2.54675 17.2463 1.35486 21.1753C0.154451 25.0958 -0.254202 29.331 0.154448 33.5066L0.222559 34.2125Z" />
                            </g>
                          </svg>
                        </div>
                        <div className="author-area">
                          <div className="author-img">
                            <img
                              src="/assets/img/home6/testimonial-author-img4.png"
                              alt=""
                            />
                          </div>
                          <div className="author-name-desig">
                            <h5>Harry Kane</h5>
                            <span>Founder, Egenslab</span>
                          </div>
                        </div>
                        <div className="quote">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={74}
                            height={51}
                            viewBox="0 0 74 51"
                          >
                            <g>
                              <path d="M34.6075 16.7875C34.5735 16.4389 34.5054 16.0817 34.4202 15.733C33.6625 6.92252 26.2643 0 17.2484 0C7.72178 0 0 7.71343 0 17.2298C0 26.474 7.28758 33.9918 16.4311 34.417C14.2261 37.8953 10.676 40.7102 6.34258 42.0369L6.19785 42.0794C4.18866 42.6917 2.80095 44.6477 2.98825 46.8248C3.20109 49.3336 5.40609 51.1961 7.9261 50.9835C15.3414 50.3541 22.7567 46.5697 27.7967 40.4211C30.3252 37.3595 32.2833 33.7537 33.4752 29.8247C34.6756 25.9042 35.0843 21.669 34.6756 17.4934L34.6075 16.7875Z" />
                              <path d="M73.1681 16.7875C73.134 16.4389 73.0659 16.0817 72.9808 15.733C72.2231 6.92252 64.8248 0 55.809 0C46.2823 0 38.5605 7.71343 38.5605 17.2298C38.5605 26.474 45.8481 33.9918 54.9917 34.417C52.7867 37.8953 49.2365 40.7102 44.9031 42.0369L44.7584 42.0794C42.7492 42.6917 41.3615 44.6477 41.5488 46.8248C41.7616 49.3336 43.9666 51.1961 46.4866 50.9835C53.9019 50.3541 61.3172 46.5697 66.3572 40.4211C68.8858 37.3595 70.8439 33.7537 72.0358 29.8247C73.2362 25.9042 73.6448 21.669 73.2362 17.4934L73.1681 16.7875Z" />
                            </g>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                    <div className="testimonial-card2">
                      <ul className="rating">
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                        <li>
                          <i className="bi bi-star-fill" />
                        </li>
                      </ul>
                      <h4>Excursion Charming Spain</h4>
                      <p>
                        “I cannot express enough how satisfied I am with the
                        webgot deve services provided by Egens Lab from the
                        initial.”
                      </p>
                      <div className="tesimonial-card-bottom">
                        <div className="quote">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={74}
                            height={51}
                            viewBox="0 0 74 51"
                          >
                            <g>
                              <path d="M38.7831 34.2125C38.8172 34.5611 38.8853 34.9183 38.9704 35.267C39.7281 44.0775 47.1264 51 56.1422 51C65.6688 51 73.3906 43.2866 73.3906 33.7702C73.3906 24.526 66.103 17.0082 56.9595 16.583C59.1645 13.1047 62.7146 10.2898 67.048 8.96309L67.1928 8.92057C69.202 8.30826 70.5897 6.35226 70.4024 4.17515C70.1895 1.66637 67.9845 -0.196075 65.4645 0.0165336C58.0492 0.645856 50.6339 4.43028 45.5939 10.5789C43.0654 13.6405 41.1073 17.2463 39.9154 21.1753C38.715 25.0958 38.3063 29.331 38.715 33.5066L38.7831 34.2125Z" />
                              <path d="M0.222559 34.2125C0.256613 34.5611 0.324725 34.9183 0.409857 35.267C1.16756 44.0775 8.56582 51 17.5817 51C27.1083 51 34.8301 43.2866 34.8301 33.7702C34.8301 24.526 27.5425 17.0082 18.399 16.583C20.604 13.1047 24.1541 10.2898 28.4875 8.96309L28.6322 8.92057C30.6414 8.30826 32.0291 6.35226 31.8418 4.17515C31.629 1.66637 29.424 -0.196075 26.904 0.0165336C19.4887 0.645856 12.0734 4.43028 7.03338 10.5789C4.50486 13.6405 2.54675 17.2463 1.35486 21.1753C0.154451 25.0958 -0.254202 29.331 0.154448 33.5066L0.222559 34.2125Z" />
                            </g>
                          </svg>
                        </div>
                        <div className="author-area">
                          <div className="author-img">
                            <img
                              src="/assets/img/home6/testimonial-author-img2.png"
                              alt=""
                            />
                          </div>
                          <div className="author-name-desig">
                            <h5>Luca Modris</h5>
                            <span>Founder, Egenslab</span>
                          </div>
                        </div>
                        <div className="quote">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={74}
                            height={51}
                            viewBox="0 0 74 51"
                          >
                            <g>
                              <path d="M34.6075 16.7875C34.5735 16.4389 34.5054 16.0817 34.4202 15.733C33.6625 6.92252 26.2643 0 17.2484 0C7.72178 0 0 7.71343 0 17.2298C0 26.474 7.28758 33.9918 16.4311 34.417C14.2261 37.8953 10.676 40.7102 6.34258 42.0369L6.19785 42.0794C4.18866 42.6917 2.80095 44.6477 2.98825 46.8248C3.20109 49.3336 5.40609 51.1961 7.9261 50.9835C15.3414 50.3541 22.7567 46.5697 27.7967 40.4211C30.3252 37.3595 32.2833 33.7537 33.4752 29.8247C34.6756 25.9042 35.0843 21.669 34.6756 17.4934L34.6075 16.7875Z" />
                              <path d="M73.1681 16.7875C73.134 16.4389 73.0659 16.0817 72.9808 15.733C72.2231 6.92252 64.8248 0 55.809 0C46.2823 0 38.5605 7.71343 38.5605 17.2298C38.5605 26.474 45.8481 33.9918 54.9917 34.417C52.7867 37.8953 49.2365 40.7102 44.9031 42.0369L44.7584 42.0794C42.7492 42.6917 41.3615 44.6477 41.5488 46.8248C41.7616 49.3336 43.9666 51.1961 46.4866 50.9835C53.9019 50.3541 61.3172 46.5697 66.3572 40.4211C68.8858 37.3595 70.8439 33.7537 72.0358 29.8247C73.2362 25.9042 73.6448 21.669 73.2362 17.4934L73.1681 16.7875Z" />
                            </g>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                </div>
              </Swiper>
            </div>
          </div>
          <div className="container">
            <div className="testimonial-bottom-area">
              <div className="rating-area">
                <div className="rating-top">
                  <div className="logo">
                    <img
                      src="/assets/img/home3/icon/testi-tripadvisor-logo.svg"
                      alt=""
                    />
                  </div>
                  <span>Rating</span>
                </div>
                <div className="rating-bottom">
                  <strong>5.0</strong>
                  <div className="rating">
                    <ul>
                      <li>
                        <i className="bi bi-circle-fill" />
                      </li>
                      <li>
                        <i className="bi bi-circle-fill" />
                      </li>
                      <li>
                        <i className="bi bi-circle-fill" />
                      </li>
                      <li>
                        <i className="bi bi-circle-fill" />
                      </li>
                      <li>
                        <i className="bi bi-circle-half" />
                      </li>
                    </ul>
                  </div>
                  <span>306 reviews</span>
                </div>
              </div>
              <div className="testimonial-pagination">
                <div className="swiper-pagination5 pagination1" />
              </div>
              <div className="review-btn">
                <a href="https://www.tripadvisor.com/" className="primary-btn4">
                  <span>Write A Review</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home3Testimonial;
