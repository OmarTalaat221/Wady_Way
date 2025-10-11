import Link from "next/link";
import React from "react";

const Breadcrumb = ({ pagename, pagetitle }) => {
  return (
    <div
      className="breadcrumb-section"
      style={{
        backgroundImage:
          "linear-gradient(270deg, rgba(0, 0, 0, .3), rgba(0, 0, 0, 0.3) 101.02%), url(https://travelami.templaza.net/wp-content/uploads/2024/03/bg-banner.jpg)",
      }}
    >
      <div className="container">
        <div className="row">
          <div className="col-lg-12 d-flex justify-content-center">
            <div className="banner-content">
              <h1>{pagename}</h1>
              <ul className="breadcrumb-list">
                <li style={{ color: "white" }}>
                  <Link href="/">Home</Link>
                </li>
                <li>{pagetitle}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
