import "../../public/assets/css/bootstrap-icons.css";
import "../../public/assets/css/all.min.css";
import "../../public/assets/css/boxicons.min.css";
import "../../public/assets/css/fontawesome.min.css";
import "../../public/assets/css/swiper-bundle.min.css";
import "../../public/assets/css/nice-select.css";
import "react-modal-video/css/modal-video.css";
import "../../public/assets/css/slick-theme.css";
import "../../public/assets/css/slick.css";
import "../../public/assets/css/bootstrap-datetimepicker.min.css";
import "react-datepicker/dist/react-datepicker.css";
import "../../public/assets/css/bootstrap.min.css";
import "yet-another-react-lightbox/styles.css";
import "../../public/assets/css/style.css";
import "../../public/assets/css/dashboard.css";
import "../../public/assets/css/index.css";
import "react-calendar/dist/Calendar.css";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import Header from "../components/header/Header";

export default async function RootLayout({ children }) {
  const locale = await getLocale();

  const dir = locale === "ar" ? "rtl" : "ltr";
  const messages = await getMessages();

  return (
    <html lang={locale} dir={dir}>
      <body className="min-h-screen">
        <NextIntlClientProvider messages={messages}>
          {/* <Topbar /> */}
          <Header currentLocale={locale} />

          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
