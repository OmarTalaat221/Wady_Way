"use client";
import React from "react";
import Banner1 from "../banner/Banner1";
import About1 from "../about/About1";
import Home1Fecilities2 from "../facilitySlide/Home1Fecilities2";
import Home1FacilitySlide from "../facilitySlide/Home1FacilitySlide";
import Home1TourPackage from "../tourPackage/Home1TourPackage";
import Home1WhyChoose from "../whyChoose/Home1WhyChoose";
import Home1Activities from "../activities/Home1Activities";
import Home1Banner2 from "../banner/Home1Banner2";
import Home1Testimonail from "../testimonial/Home1Testimonail";
import Home1Blog from "../blog/Home1Blog";
import Newslatter from "../common/Newslatter";
import Footer from "../footer/Footer";
import useGetHomeData from "../../ApiCalling/useGetHomeData";

export default function HomePage() {
  const { data, isLoading } = useGetHomeData();

  return (
    <>
      <Banner1 />
      <About1 />
      {/*   <Destination1 /> */}
      <Home1Fecilities2 data={data?.message} />
      <Home1FacilitySlide />
      <Home1TourPackage data={data?.message} />
      <Home1WhyChoose />
      <Home1Activities />
      <Home1Banner2 data={data?.message?.offers} />

      <Home1Testimonail />
      <Home1Blog data={data?.message} />
      <Newslatter />
      <Footer />
    </>
  );
}
