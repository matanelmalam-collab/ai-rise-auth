"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect } from "react";
import { trackAuthPageViewed } from "@/lib/analytics";

/**
 * Signup Page
 *
 * Full Hebrew RTL signup experience with:
 * - Email magic link (primary — no password needed)
 * - SMS OTP (secondary — for users who prefer phone)
 * - Google OAuth (one-tap social login)
 *
 * Design: Warm cream background, gold accent, Heebo font,
 * reassurance messaging for 45-75 age group.
 */
export default function SignUpPage() {
  useEffect(() => {
    trackAuthPageViewed("signup");
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

      {/* Clerk SignUp Component */}
      <div dir="rtl" style={{ width: "100%", maxWidth: "440px" }}>
        <SignUp
          path="/signup"
          routing="path"
          signInUrl="/login"
          afterSignUpUrl="/callback"
          redirectUrl="/callback"
        />
      </div>

      {/* Reassurance footer */}
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
          🔒 ללא כרטיס אשראי · ללא התחייבות · ביטול בכל רגע
        </p>
      </div>
    </main>
  );
}
