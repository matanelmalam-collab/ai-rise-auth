"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import {
  trackAuthCompleted,
  trackDashboardLanded,
} from "@/lib/analytics";

/**
 * Callback Page — Post-Authentication Redirect
 *
 * This page fires after Clerk authentication completes.
 * It tracks the sign-up event and redirects the user
 * directly to the Base44 course dashboard.
 *
 * The user sees a brief loading animation (~1 second).
 */

const BASE44_APP_URL =
  process.env.NEXT_PUBLIC_BASE44_APP_URL || "https://ai-for-life.base44.app";

export default function CallbackPage() {
  const { user, isLoaded } = useUser();
  const redirected = useRef(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!isLoaded || redirected.current) return;

    // Even if user is null (edge case), redirect to Base44
    // so the user is never stuck on this page
    redirected.current = true;

    if (user) {
      // Track auth completion
      const method = detectAuthMethod(user);
      const isNewUser = isRecentlyCreated(user);
      const authTimeSeconds = (Date.now() - startTime.current) / 1000;
      trackAuthCompleted(method, isNewUser, authTimeSeconds);
    }

    // Track dashboard landing
    const totalFlowSeconds = (Date.now() - startTime.current) / 1000;
    trackDashboardLanded(totalFlowSeconds);

    // Redirect to Base44 course dashboard
    window.location.href = BASE44_APP_URL;
  }, [isLoaded, user]);

  return (
    <main style={containerStyle}>
      <div style={cardStyle}>
        {/* Spinner */}
        <div style={spinnerContainerStyle}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid #E8E0D8",
              borderTop: "4px solid #C8813A",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
        </div>
        <h2 style={headingStyle}>מכינים את הקורס שלכם...</h2>
        <p style={subtextStyle}>רק עוד רגע קטן ✨</p>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}

// --- Helper Functions ---

function detectAuthMethod(user: any): "magic_link" | "sms" | "google" | "unknown" {
  const verifications = user?.externalAccounts;
  if (verifications?.some((a: any) => a.provider === "google")) return "google";
  if (user?.primaryPhoneNumber) return "sms";
  if (user?.primaryEmailAddress) return "magic_link";
  return "unknown";
}

function isRecentlyCreated(user: any): boolean {
  if (!user?.createdAt) return true;
  const created = new Date(user.createdAt).getTime();
  const now = Date.now();
  return now - created < 60_000;
}

// --- Styles ---

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  padding: "24px 16px",
  backgroundColor: "#FDFAF6",
  fontFamily: "'Heebo', Arial, sans-serif",
  direction: "rtl",
};

const cardStyle: React.CSSProperties = {
  textAlign: "center",
  backgroundColor: "#FFFFFF",
  borderRadius: "16px",
  padding: "40px 32px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  border: "1px solid #E8E0D8",
  maxWidth: "400px",
  width: "100%",
};

const headingStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#2D2D2D",
  margin: "0 0 8px 0",
};

const subtextStyle: React.CSSProperties = {
  fontSize: "16px",
  color: "#6B6B6B",
  margin: "0 0 16px 0",
  lineHeight: "1.5",
};

const spinnerContainerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  marginBottom: "24px",
};
