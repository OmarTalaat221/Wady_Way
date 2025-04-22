"use server";

import { cookies } from "next/headers";

export async function setLanguageValue(value: string) {
  const cookiesStore = cookies();
  cookiesStore.set("language", value, { path: "/", maxAge: 31536000 });
}
