"use client";
import { BsFillCaretRightFill } from "react-icons/bs";

export const customExpandIcon =
  (fontSize = "16px") =>
  ({ isActive }) =>
    (
      <BsFillCaretRightFill
        style={{
          color: "#cd533b",
          fontSize: fontSize,
          transition: "transform 0.3s",
          transform: isActive ? "rotate(90deg)" : "rotate(0deg)",
        }}
      />
    );
