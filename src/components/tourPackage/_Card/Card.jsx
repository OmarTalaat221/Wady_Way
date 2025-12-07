"use client";
import Link from "next/link";

const splitList = (v) =>
  (v || "")
    .split(/,|\n|→|-/g)
    .map((s) => s.trim())
    .filter(Boolean);

const money = (currency, val) => {
  const n = Number(val);
  if (!Number.isFinite(n)) return "";
  return `${currency || ""}${n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const PackageCard = ({ item }) => {
  const href = item?.cta_button_url || "/package/package-details";
  const img = (item?.image || "").trim() || "/assets/img/placeholder.jpg";

  // TourCard style lists
  const badgeLocations = splitList(item?.country_name || item?.category).slice(
    0,
    2
  );
  const cities = splitList(item?.route).slice(0, 12);

  const priceNow = money(item?.price_currency, item?.price_current);
  const priceWas = item?.price_original
    ? money(item?.price_currency, item?.price_original)
    : "";

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      {/* IMG WRAP */}
      <div className="relative">
        <Link href={href} className="block h-[230px] w-full overflow-hidden">
          <img
            src={img}
            alt={item?.title || ""}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </Link>

        {/* BATCH (like TourCard) */}
        <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
          {!!item?.duration && (
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-zinc-900 backdrop-blur">
              {item.duration}
            </span>
          )}

          {badgeLocations.length > 0 && (
            <div className="flex items-start gap-2 rounded-2xl bg-white/90 px-3 py-2 text-xs font-semibold text-zinc-900 backdrop-blur">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                viewBox="0 0 18 18"
                className="mt-[1px] opacity-80"
              >
                <path d="M8.99939 0C5.40484 0 2.48047 2.92437 2.48047 6.51888C2.48047 10.9798 8.31426 17.5287 8.56264 17.8053C8.79594 18.0651 9.20326 18.0646 9.43613 17.8053C9.68451 17.5287 15.5183 10.9798 15.5183 6.51888C15.5182 2.92437 12.5939 0 8.99939 0ZM8.99939 9.79871C7.19088 9.79871 5.71959 8.32739 5.71959 6.51888C5.71959 4.71037 7.19091 3.23909 8.99939 3.23909C10.8079 3.23909 12.2791 4.71041 12.2791 6.51892C12.2791 8.32743 10.8079 9.79871 8.99939 9.79871Z" />
              </svg>

              <ul className="flex flex-col gap-1 leading-none">
                {badgeLocations.map((label, i) => (
                  <li key={i} className="whitespace-nowrap">
                    <Link href="/package" className="hover:underline">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent" />
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <div className="space-y-2">
          <h5 className="line-clamp-2 text-[18px] font-semibold leading-snug text-zinc-900">
            <Link href={href} className="hover:underline">
              {item?.title}
            </Link>
          </h5>

          {/* like TourCard location-area scrollTextAni */}
          {cities.length > 0 && (
            <div className="relative overflow-hidden">
              <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-zinc-600">
                {cities.map((c, i) => (
                  <li key={i} className="relative pl-3">
                    <span className="absolute left-0 top-[10px] h-1 w-1 rounded-full bg-zinc-300" />
                    <Link href="/package" className="hover:underline">
                      {c}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!!item?.subtitle && (
            <p className="line-clamp-2 text-sm text-zinc-500">
              {item.subtitle}
            </p>
          )}
        </div>

        {/* BOTTOM */}
        <div className="mt-5 flex items-end justify-between gap-4 border-t border-zinc-100 pt-4">
          <div className="min-w-0">
            <h6 className="text-xs font-semibold text-zinc-500">
              Starting From:
            </h6>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-lg font-bold text-zinc-900">
                {priceNow}
              </span>
              {!!priceWas && (
                <del className="text-sm text-zinc-400">{priceWas}</del>
              )}
            </div>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              {(item?.price_note || "TAXES INCL./PERS").replaceAll("_", " ")}
            </p>
          </div>

          <Link
            href={href}
            className="shrink-0 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            {item?.cta_button_text || "Book a Trip"}
          </Link>
        </div>
      </div>
    </div>
  );
};
  