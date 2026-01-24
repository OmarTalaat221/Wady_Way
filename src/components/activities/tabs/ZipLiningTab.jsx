// components/activities/tabs/ZipLiningTab.jsx
"use client";
import React from "react";
import Link from "next/link";
import { LazyLoadImage } from "react-lazy-load-image-component";

const ZipLiningTab = ({ setOpen }) => {
  return (
    <div className="verticle-tab-content-wrap">
      <div className="verticle-tab-content">
        <div className="eg-tag2">
          <span>Zip lining</span>
        </div>
        <h2>Thrill Above Ground: The Zip Line Adventure</h2>
        <p>
          Embark on an adrenaline-fueled journey, zipping through lush
          landscapes, feeling the wind rush past, and experiencing nature from
          breathtaking heights. Unleash your inner adventurer today.
        </p>
        <ul>
          <li>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={9}
              height={9}
              viewBox="0 0 9 9"
            >
              <circle cx="4.5" cy="4.5" r="4.5" />
            </svg>
            Treetop Views
          </li>
          <li>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={9}
              height={9}
              viewBox="0 0 9 9"
            >
              <circle cx="4.5" cy="4.5" r="4.5" />
            </svg>
            Adrenaline Rush
          </li>
          <li>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={9}
              height={9}
              viewBox="0 0 9 9"
            >
              <circle cx="4.5" cy="4.5" r="4.5" />
            </svg>
            Safety Measures
          </li>
          <li>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={9}
              height={9}
              viewBox="0 0 9 9"
            >
              <circle cx="4.5" cy="4.5" r="4.5" />
            </svg>
            Nature Immersion
          </li>
        </ul>
        <div className="content-bottom-area">
          <Link href="/activities/activities-details" className="primary-btn1">
            Check Availability
          </Link>
          <a
            style={{ cursor: "pointer" }}
            onClick={() => setOpen(true)}
            className="video-area"
          >
            <div className="icon">
              <svg
                className="video-circle"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                width="51px"
                viewBox="0 0 206 206"
                style={{ enableBackground: "new 0 0 206 206" }}
                xmlSpace="preserve"
              >
                <circle
                  className="circle"
                  strokeMiterlimit={10}
                  cx={103}
                  cy={103}
                  r={100}
                />
                <path
                  className="circle-half top-half"
                  strokeWidth={4}
                  strokeMiterlimit={10}
                  d="M16.4,53C44,5.2,105.2-11.2,153,16.4s64.2,88.8,36.6,136.6"
                />
                <path
                  className="circle-half bottom-half"
                  strokeWidth={4}
                  strokeMiterlimit={10}
                  d="M189.6,153C162,200.8,100.8,217.2,53,189.6S-11.2,100.8,16.4,53"
                />
              </svg>
              <i className="bi bi-play" />
            </div>
            <h6>Watch Adventure</h6>
          </a>
        </div>
      </div>
      <div className="verticle-tab-img">
        <div className="verticle-tab-img1 mb-[25px]">
          <LazyLoadImage
            width="246"
            height="180"
            className="object-cover h-[180px]"
            src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740662904/danka-peter-tvicgTdh7Fg-unsplash_vuza6m.jpg"
            alt="Zip lining through forest"
          />
        </div>
        <div className="verticle-tab-img2">
          <LazyLoadImage
            width="246"
            height="300"
            className="object-cover h-[300px]"
            src="https://res.cloudinary.com/dbz6ebekj/image/upload/v1740662904/fabio-comparelli-uq2E2V4LhCY-unsplash_ae15ei.jpg"
            alt="Zip lining adventure"
          />
        </div>
      </div>
    </div>
  );
};

export default ZipLiningTab;
