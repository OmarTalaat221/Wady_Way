"use client";
import React from "react";
import { BsFillCaretRightFill } from "react-icons/bs";

export const customExpandIcon = (size = "16px") => {
  return ({ isActive }) => (
    <BsFillCaretRightFill
      style={{
        fontSize: size,
        color: "#295557",
        transform: isActive ? "rotate(90deg)" : "rotate(0deg)",
        transition: "transform 0.3s ease",
      }}
    />
  );
};

export default customExpandIcon;
