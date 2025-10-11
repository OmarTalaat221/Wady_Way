"use client";

import { BsFillCaretRightFill } from "react-icons/bs";
import { useLocale } from "next-intl";

export const customExpandIcon = (fontSize = "16px") => {
  return function ExpandIcon({ isActive }) {
    const locale = useLocale();

    return (
      <BsFillCaretRightFill
        style={{
          color: "#295557",
          fontSize: fontSize,
          transition: "transform 0.3s",
          transform: isActive
            ? "rotate(90deg)"
            : locale === "ar"
            ? "rotate(180deg)"
            : "rotate(0deg)",
        }}
      />
    );
  };
};

export default customExpandIcon;
