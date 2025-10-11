import React from "react";

import "./_components/style.css";

import PageSummaryClient from "./_components/page_summary_client";
import { cookies } from "next/headers";

const Page = () => {
  const cookiesStore = cookies();

  const lang = cookiesStore.get("lang") || "en";

  return (
    <>
      <PageSummaryClient lang={lang.value} />
    </>
  );
};

export default Page;
