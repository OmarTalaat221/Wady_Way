import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

export default function HotelCardSlider({ settings }) {
  return (
    <div className="room-suits-card two">
      <div className="row g-0">
        <div className="col-md-12">
          <Swiper {...settings} className="swiper hotel-img-slider">
            <span className="batch">Breakfast included</span>
            <div className="swiper-wrapper">
              <SwiperSlide className="swiper-slide">
                <div className="room-img">
                  <img src="/assets/img/innerpage/room-img-01.jpg" alt="" />
                </div>
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <div className="room-img">
                  <img src="/assets/img/innerpage/room-img-06.jpg" alt="" />
                </div>
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <div className="room-img">
                  <img src="/assets/img/innerpage/room-img-04.jpg" alt="" />
                </div>
              </SwiperSlide>
            </div>
            <div className="swiper-pagination5" />
          </Swiper>
        </div>
      </div>
    </div>
  );
}
  