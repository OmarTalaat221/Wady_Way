"use client";
import React from "react";
import dynamic from "next/dynamic";
import "react-datepicker/dist/react-datepicker.css";

const PackageDetailsClient = dynamic(
  () => import("./_components/PackageDetailsClient"),
  { ssr: false }
);

const Page = () => {
  return <PackageDetailsClient />;
};

export default Page;
