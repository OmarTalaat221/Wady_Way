import React from "react";

import "./_components/style.css";

import PageSummaryClient from "./_components/page_summary_client";
import { cookies } from "next/headers";

const Page = async () => {
  const cookiesStore = await cookies();

  const lang = cookiesStore.get("lang")?.value || "en";

  return (
    <>
      <PageSummaryClient lang={lang} />
    </>
  );
};

export default Page;
