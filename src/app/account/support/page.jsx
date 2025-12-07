"use client";

import React, { useState } from "react";
import {
  FaHeadset,
  FaPhoneAlt,
  FaExclamationTriangle,
  FaComments,
  FaDownload,
  FaFilePdf,
} from "react-icons/fa";
import Image from "next/image";
import "./style.css";
import { FaChevronDown, FaChevronRight } from "react-icons/fa6";

const Support = () => {
  const [showEmergencyInfo, setShowEmergencyInfo] = useState(false);

  return (
    <div className="w-full pt-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
          <FaHeadset className="text-[#cd533b] text-xl" />
        </div>
        <h2 className="text-2xl font-bold text-[#295557]">Support</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 text-[#295557]">
            Types of Support
          </h3>

          {/* Emergency Support */}
          <div className="mb-6">
            <div
              className="flex items-center gap-3 mb-3 cursor-pointer group p-2 rounded-lg hover:bg-red-50 transition-all duration-300"
              onClick={() => setShowEmergencyInfo(!showEmergencyInfo)}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 group-hover:bg-red-200 transition-all duration-300">
                <FaExclamationTriangle className="text-red-600" />
              </div>
              <h4 className="flex items-center justify-between w-full text-lg font-medium group-hover:text-red-600 transition-all duration-300">
                <span>Emergency Support</span>{" "}
                <span
                  className={`${showEmergencyInfo ? "rotate-90" : ""
                    } transition-all duration-300`}
                >
                  <FaChevronRight />
                </span>
              </h4>
            </div>

            <div
              className={`ml-14 transition-all duration-300 ${showEmergencyInfo
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden"
                }`}
            >
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-3">
                  This emergency hotline is for urgent situations only. Misuse of this
                  service for regular inquiries will incur
                  <span className="text-red-600 font-semibold"> an automatic penalty charge
                    to your account wallet.</span> Please use the standard support channels
                  for non-urgent matters.
                </p>

                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-red-200">
                  <FaPhoneAlt className="text-red-600" />
                  <span className="font-semibold">+1 (800) 123-4567</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Chat Support */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3 p-2 rounded-lg hover:bg-blue-50 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-all duration-300">
                <FaComments className="text-blue-600" />
              </div>
              <h4 className="text-lg w-full font-medium group-hover:text-blue-600 transition-all duration-300">
                Live Chat or Message
              </h4>
            </div>

            <div className="ml-14">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-3">
                  Connect with our support team through live chat or send us a
                  message. Our team is available 24/7 to assist you with any
                  questions or concerns.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="flex  items-center justify-center gap-2 bg-white border border-blue-200 rounded-lg p-3 hover:!bg-[#295557] hover:text-white hover:border-blue-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md">
                    <FaComments className="text-blue-600 group-hover:text-white transition-colors duration-300" />
                    <span>Start Live Chat</span>
                  </button>

                  <button className="flex items-center justify-center gap-2 bg-white border border-blue-200 rounded-lg p-3 hover:!bg-[#295557] hover:text-white hover:border-blue-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md">
                    <FaPhoneAlt className="text-blue-600 group-hover:text-white transition-colors duration-300" />
                    <span>Request Phone Call</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Assets */}
      {/* <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-xl font-semibold mb-4 text-[#295557]">
          Additional Assets
        </h3>

        <div className="flex items-center gap-3 mb-3 p-2 rounded-lg hover:bg-green-50 transition-all duration-300 group cursor-pointer">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 group-hover:bg-green-200 transition-all duration-300">
            <FaFilePdf className="text-green-600" />
          </div>
          <h4 className="w-full text-lg font-medium group-hover:text-green-600 transition-all duration-300">
            E-Book for the Tour (PDF)
          </h4>
        </div>

        <div className="ml-14">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700 mb-3">
              Download our comprehensive e-book guide for your tour. This guide
              contains valuable information, tips, and recommendations to
              enhance your travel experience.
            </p>

            <a
              href="#"
              className="flex items-center justify-center gap-2 bg-white border border-green-200 rounded-lg p-3 hover:!bg-[#295557] hover:text-white hover:border-green-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md w-full md:w-auto"
            >
              <FaDownload className="text-green-600 group-hover:text-white transition-colors duration-300" />
              <span>Download E-Book (PDF)</span>
            </a>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Support;
