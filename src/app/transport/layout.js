import React from "react";
export const metadata = {
  title: "Transport Services & Car Rentals | WADI WAY",
  description:
    "Reliable and comfortable transport services for your journeys. Choose from a variety of vehicles to suit your travel needs with WADI WAY.",
  icons: {
    icon: "/src/app/favicon.ico",
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
