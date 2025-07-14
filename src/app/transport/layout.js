import Newslatter from "@/components/common/Newslatter";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Topbar from "@/components/topbar/Topbar";
import React from "react";
export const metadata = {
  title: "WADI WAY - Tour & Travel Agency  NextJs Template",
  description:
    "WADI WAY is a NextJs Template for Tour and Travel Agency purpose",
  icons: {
    icon: "/assets/img/sm-logo.svg",
  },
};

const layout = ({ children }) => {
  return (
    <>
      {/* <Topbar />
      <Header /> */}
      {children}
      {/* <Newslatter />
      <Footer /> */}
    </>
  );
};

export default layout;
