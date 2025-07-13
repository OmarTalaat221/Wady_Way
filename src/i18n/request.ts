import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defalultLocale } from "./config";

export default getRequestConfig(async () => {
  const locale = (await cookies()).get("lang")?.value || defalultLocale;
  try {
    const messages = (await import(`../messages/${locale}.json`)).default;

    return { locale, messages };
  } catch (error) {
    console.error(`Error loading messages for locale "${locale}":`, error);

    const fallbackMessages = (
      await import(`../messages/${defalultLocale}.json`)
    ).default;

    // console.log(fallbackMessages);
    return { locale: defalultLocale, messages: fallbackMessages };
  }
});
