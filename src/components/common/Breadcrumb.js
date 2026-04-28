// Breadcrumb.jsx
import Link from "next/link";
import React, { memo } from "react";

const Breadcrumb = ({ pagename, pagetitle }) => {
  return (
    <nav
      className="breadcrumb-section"
      style={{
        backgroundImage:
          "linear-gradient(270deg, rgba(0, 0, 0, .3), rgba(0, 0, 0, 0.3) 101.02%), url(https://travelami.templaza.net/wp-content/uploads/2024/03/bg-banner.jpg)",
      }}
      aria-label="Breadcrumb"
    >
      <div className="container">
        <div className="row">
          <div className="col-lg-12 d-flex justify-content-center">
            <div className="banner-content">
              <h1>{pagename}</h1>
              <ol
                className="breadcrumb-list list-none"
                itemScope
                itemType="https://schema.org/BreadcrumbList"
              >
                <li
                  style={{ color: "white" }}
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
                >
                  <Link href="/" itemProp="item">
                    <span itemProp="name">Home</span>
                  </Link>
                  <meta itemProp="position" content="1" />
                </li>
                <li
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
                  aria-current="page"
                >
                  <span itemProp="name">{pagetitle}</span>
                  <meta itemProp="position" content="2" />
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default memo(Breadcrumb);
