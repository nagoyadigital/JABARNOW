import Script from "next/script";

/**
 * GA4 — integration-ready. Hanya aktif bila NEXT_PUBLIC_GA4_MEASUREMENT_ID
 * terisi. Kosong = tidak merender apa pun (tanpa error).
 */
export function GA4() {
  const id = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
