import React from "react";

import "./_components/style.css";
import { cookies } from "next/headers";
import FormPageClient from "./_components/FormPageClient";

const Page = async () => {
  const cookiesStore = await cookies();

  const lang = cookiesStore.get("lang")?.value || "en";

  return (
    <>
      <FormPageClient lang={lang.value} />
    </>
  );
};

export default Page;
