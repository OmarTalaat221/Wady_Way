import Breadcrumb from "@/components/common/Breadcrumb";
import Newslatter from "@/components/common/Newslatter";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import Topbar from "@/components/topbar/Topbar";
import Home2Activities from "@/components/activities/Home2Activities";
import Home2Team from "@/components/team/Home2Team";
import Home2Blog from "@/components/blog/Home2Blog";
import Home2WhyChoose from "@/components/whyChoose/Home2WhyChoose";
import Home2About from "@/components/about/Home2About";
export const metadata = {
  title: "WADI WAY - Tour & Travel Agency  NextJs Template",
  description:
    "WADI WAY is a NextJs Template for Tour and Travel Agency purpose",
  icons: {
    icon: "/assets/img/sm-logo.svg",
  },
};
const page = () => {
  return (
    <>
      {/* <Topbar /> */}
      {/* <Header /> */}
      <Breadcrumb pagename="About Us" pagetitle="About Us" />
      <Home2About />
      <Home2WhyChoose />
      <Home2Activities />
      <Home2Team />
      {/* <Home2Blog /> */}
      <Newslatter />
      <Footer />
    </>
  );
};

export default page;
