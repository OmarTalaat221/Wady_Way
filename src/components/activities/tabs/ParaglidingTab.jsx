// components/activities/tabs/ParaglidingTab.jsx
"use client";
import React from "react";
import Link from "next/link";
import { LazyLoadImage } from "react-lazy-load-image-component";

const ParaglidingTab = ({ setOpen }) => {
  return (
    <div className="verticle-tab-content-wrap">
      <div className="verticle-tab-content">
        <div className="eg-tag2">
          <span>Paragliding</span>
        </div>
        <h2>Horizon Dance: Unique Paragliding Perspectives.</h2>
        <p>
          Experience freedom in flight, soaring gracefully over landscapes,
          feeling the wind's embrace on an exhilarating paragliding escapade.
          Adventure awaits above!
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
            Glide Experience
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
            Scenic Views
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
            Adventurous Spirit
          </li>
        </ul>
        <div className="content-bottom-area">
          <Link href="/activities/activities-details" className="primary-btn1">
            Check Availability
          </Link>
          <a
            style={{ cursor: "pointer" }}
            onClick={() => setOpen(true)}
            className="video-area video4"
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
            src="https://eia476h758b.exactdn.com/wp-content/uploads/2023/07/Paraglider-Albania.jpeg?strip=all&lossy=1&ssl=1"
            alt="Paragliding over mountains"
          />
        </div>
        <div className="verticle-tab-img2">
          <LazyLoadImage
            width="246"
            height="300"
            className="object-cover h-[300px]"
            src="https://flybubble.com/media/magefan_blog/pi3-flybubble.png"
            alt="Paragliding aerial view"
          />
        </div>
      </div>
    </div>
  );
};

export default ParaglidingTab;
