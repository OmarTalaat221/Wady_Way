"use client";
import React, { useState, useEffect } from "react";

const Preloader = ({ onClose }) => {
  const [isPreloaderVisible, setIsPreloaderVisible] = useState(true);
  const [isPreloaderClosed, setIsPreloaderClosed] = useState(false);
  const handleCloseClick = () => {
    setIsPreloaderClosed(true); // Set a state variable to track that the preloader is closed
    onClose(); // Call the onClose function passed from the parent component
  };

  useEffect(() => {
    // Hide the preloader after a delay (1600 milliseconds)
    const timeoutId = setTimeout(() => {
      setIsPreloaderVisible(false);
    }, 3000);

    // Cleanup the timeout when the component unmounts
    return () => clearTimeout(timeoutId);
  }, []);

  // Define the class names for the egns-preloader element
  const preloaderClassNames = `egns-preloader ${
    isPreloaderClosed ? "close" : ""
  }`;
  return (
    isPreloaderVisible && (
      <div className={preloaderClassNames}>
        {/* <div className="preloader-close-btn" onClick={handleCloseClick}>
          <span>
            <i className="bi bi-x-lg" /> Close
          </span>
        </div> */}
        <div className="container">
          <div className="row d-flex justify-content-center">
            <div className="col-6 ">
              <div className="circle-border flex items-center justify-center">
                <div className="moving-circle" />
                <div className="moving-circle" />
                <div className="moving-circle" />
                <img
                  style={{
                    width: "200px",
                    height: "80px",
                    objectFit: "contain",
                  }}
                  src="https://res.cloudinary.com/dhgp9dzdt/image/upload/v1742474177/logo_qvee2o.png"
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Preloader;
