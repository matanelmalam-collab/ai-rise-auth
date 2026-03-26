import { ClerkProvider } from "@clerk/nextjs";
import { aiRiseHebrewLocalization } from "@/lib/localization";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { getGA4ScriptSrc, getGA4InitScript } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "AI Rise — הרשמה",
  description: "הירשמו לקורס AI לחיים עצמם. 2 שיעורים חינם, בלי כרטיס אשראי.",
  openGraph: {
    title: "AI Rise — בואו ללמוד AI בעברית",
    description: "קורס AI בעברית למבוגרים. הרשמה חינם, שיעור ראשון תוך דקה.",
    locale: "he_IL",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  // Prevent zoom on input focus (important for mobile UX)
};

/**
 * Clerk Appearance config — brand-matched to AI Rise
 *
 * Colors: Gold (#C8813A) primary, Cream (#FDFAF6) background
 * Font: Heebo (Hebrew-optimized, matches landing page)
 * Touch: 44px+ button height for 45+ audience on mobile
 */
const clerkAppearance = {
  variables: {
    colorPrimary: "#C8813A",
    colorBackground: "#FDFAF6",
    colorText: "#2D2D2D",
    colorTextSecondary: "#6B6B6B",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#2D2D2D",
    fontFamily: "'Heebo', Arial, sans-serif",
    fontSize: "16px",
    borderRadius: "12px",
    spacingUnit: "16px",
  },
  elements: {
    // Card container
    card: {
      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      border: "1px solid #E8E0D8",
      borderRadius: "16px",
      padding: "32px 24px",
      maxWidth: "420px",
      width: "100%",
    },
    // Header
    headerTitle: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#2D2D2D",
    },
    headerSubtitle: {
      fontSize: "16px",
      color: "#6B6B6B",
      marginTop: "8px",
    },
    // Form fields — large, accessible
    formFieldInput: {
      fontSize: "18px",
      padding: "14px 16px",
      borderRadius: "10px",
      border: "1.5px solid #D4CCC4",
      minHeight: "48px",
      textAlign: "right" as const,
      direction: "rtl" as const,
    },
    formFieldLabel: {
      fontSize: "15px",
      fontWeight: "500",
      color: "#4A4A4A",
      textAlign: "right" as const,
    },
    // Primary button — gold, large, touch-friendly
    formButtonPrimary: {
      backgroundColor: "#C8813A",
      color: "#FFFFFF",
      fontSize: "18px",
      fontWeight: "600",
      padding: "14px 24px",
      minHeight: "48px",
      borderRadius: "12px",
      border: "none",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
      "&:hover": {
        backgroundColor: "#B5732E",
      },
    },
    // Social buttons — prominent Google button
    socialButtonsBlockButton: {
      fontSize: "16px",
      padding: "12px 16px",
      minHeight: "48px",
      borderRadius: "10px",
      border: "1.5px solid #D4CCC4",
      backgroundColor: "#FFFFFF",
      fontWeight: "500",
    },
    // Footer links
    footerActionLink: {
      color: "#C8813A",
      fontWeight: "500",
    },
    // Hide Clerk branding (requires Pro plan)
    footer: {
      "& > div:last-child": {
        display: "none",
      },
    },
    // Alert/error messages
    alert: {
      borderRadius: "10px",
      fontSize: "14px",
      textAlign: "right" as const,
    },
    // OTP input fields — large and spaced
    otpCodeFieldInput: {
      fontSize: "24px",
      width: "48px",
      height: "56px",
      borderRadius: "10px",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      localization={aiRiseHebrewLocalization as any}
      appearance={clerkAppearance}
      afterSignInUrl="/callback"
      afterSignUpUrl="/callback"
    >
      <html lang="he" dir="rtl">
        <head>
          {/* Google Fonts: Heebo (Hebrew-optimized) */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />

          {/* GA4 */}
          <Script
            src={getGA4ScriptSrc()}
            strategy="afterInteractive"
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: getGA4InitScript() }}
          />

          {/* Facebook Pixel — replace YOUR_PIXEL_ID with actual ID */}
          <Script
            id="fb-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', 'YOUR_PIXEL_ID');
                fbq('track', 'PageView');
              `,
            }}
          />
        </head>
        <body
          style={{
            margin: 0,
            padding: 0,
            fontFamily: "'Heebo', Arial, sans-serif",
            backgroundColor: "#FDFAF6",
            minHeight: "100vh",
            direction: "rtl",
          }}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
