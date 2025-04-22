import React from "react";

import "./_components/style.css";
import { cookies } from "next/headers";
import FormPageClient from "./_components/FormPageClient";

const Page = () => {
  const cookiesStore = cookies();

  const lang = cookiesStore.get("lang") || "en";

  return (
    <>
      <FormPageClient lang={lang.value} />
    </>
  );
};

export default Page;
