"use client";
import React from "react";
import dynamic from "next/dynamic";
import "react-datepicker/dist/react-datepicker.css";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import "./style.css";

const PackageDetailsClient = dynamic(
  () => import("./_components/PackageDetailsClient"),
  {
    ssr: false,
    loading: () => <LoadingSpinner />,
  }
);

const Page = () => {
  return <PackageDetailsClient />;
};

export default Page;
