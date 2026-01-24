// components/activities/tabs/SkiTouringTab.jsx
"use client";
import React from "react";
import Link from "next/link";
import { LazyLoadImage } from "react-lazy-load-image-component";

const SkiTouringTab = ({ setOpen }) => {
  return (
    <div className="verticle-tab-content-wrap">
      <div className="verticle-tab-content">
        <div className="eg-tag2">
          <span>Ski touring</span>
        </div>
        <h2>Powder Quest: Exploring Snow-Covered Landscapes on Skis</h2>
        <p>
          Ski tour through pristine snowscapes, ascend peaks, and savor
          thrilling descents, immersing in nature's beauty on an exhilarating
          adventure.
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
            Ascend and Descend
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
            Specialized Equipment
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
            Remote Exploration
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
            Physical Challenge
          </li>
        </ul>
        <div className="content-bottom-area">
          <Link href="/activities/activities-details" className="primary-btn1">
            Check Availability
          </Link>
          <a
            style={{ cursor: "pointer" }}
            onClick={() => setOpen(true)}
            className="video-area video3"
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
            src="https://elansports.com/media/wysiwyg/difference_between_freeride-upper_banner.jpg"
            alt="Ski touring in mountains"
          />
        </div>
        <div className="verticle-tab-img2">
          <LazyLoadImage
            width="246"
            height="300"
            className="object-cover h-[300px]"
            src="https://www.mountaintracks.co.uk/media/k2/items/cache/56dab2b3675237b0ba79395c67ee9ae4_XL.jpg"
            alt="Ski touring powder"
          />
        </div>
      </div>
    </div>
  );
};

export default SkiTouringTab;
