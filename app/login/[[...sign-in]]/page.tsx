"use client";

import { SignIn } from "@clerk/nextjs";
import { useEffect } from "react";
import { trackAuthPageViewed } from "@/lib/analytics";

/**
 * Login Page
 *
 * Returning users — warm "welcome back" messaging.
 * Same auth methods as signup: magic link, SMS, Google.
 */
export default function LoginPage() {
  useEffect(() => {
    trackAuthPageViewed("login");
  }, []);

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "24px 16px",
        backgroundColor: "#FDFAF6",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#C8813A",
            margin: "0 0 4px 0",
            fontFamily: "'Heebo', Arial, sans-serif",
          }}
        >
          AI Rise
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "#6B6B6B",
            margin: 0,
            fontFamily: "'Heebo', Arial, sans-serif",
          }}
        >
          AI לחיים עצמם
        </p>
      </div>

      {/* Clerk SignIn Component */}
      <div dir="rtl" style={{ width: "100%", maxWidth: "440px" }}>
        <SignIn
          path="/login"
          routing="path"
          signUpUrl="/signup"
          forceRedirectUrl="/callback"
          fallbackRedirectUrl="/callback"
        />
      </div>

      {/* Help footer */}
      <div
        style={{
          marginTop: "24px",
          textAlign: "center",
          maxWidth: "360px",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            color: "#9B9B9B",
            lineHeight: "1.6",
            fontFamily: "'Heebo', Arial, sans-serif",
          }}
        >
          נתקעתם? שלחו לנו הודעה בוואטסאפ ונעזור 💬
        </p>
      </div>
    </main>
  );
}
