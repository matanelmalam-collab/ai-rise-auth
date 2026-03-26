"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useRef } from "react";
import {
  trackAuthCompleted,
  trackBridgeSuccess,
  trackBridgeError,
  trackDashboardLanded,
} from "@/lib/analytics";

/**
 * Callback Page — Post-Authentication Bridge
 *
 * This page fires after Clerk authentication completes.
 * It silently bridges the Clerk session to a Base44 account,
 * then redirects the user to the course dashboard.
 *
 * The user sees a brief loading animation while this happens.
 * Typical time: 1-3 seconds.
 */

type BridgeStatus = "loading" | "success" | "error";

export default function CallbackPage() {
  const { user, isLoaded } = useUser();
  const [status, setStatus] = useState<BridgeStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const bridgeAttempted = useRef(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!isLoaded || !user || bridgeAttempted.current) return;
    bridgeAttempted.current = true;

    async function bridge() {
      try {
        // Determine auth method from Clerk session
        const method = detectAuthMethod(user!);
        const isNewUser = isRecentlyCreated(user!);
        const authTimeSeconds = (Date.now() - startTime.current) / 1000;

        // Track auth completion
        trackAuthCompleted(method, isNewUser, authTimeSeconds);

        // Call our bridge API
        const response = await fetch("/api/bridge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user!.primaryEmailAddress?.emailAddress,
            clerkUserId: user!.id,
            firstName: user!.firstName,
            lastName: user!.lastName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Bridge failed (${response.status})`);
        }

        const data = await response.json();

        // Track bridge success
        trackBridgeSuccess(data.isNewAccount);

        setStatus("success");

        // Track dashboard landing
        const totalFlowSeconds = (Date.now() - startTime.current) / 1000;
        trackDashboardLanded(totalFlowSeconds);

        // Redirect to Base44 course dashboard
        window.location.href = data.redirectUrl;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        setErrorMessage(message);
        setStatus("error");

        trackBridgeError("bridge_failure", message);
      }
    }

    bridge();
  }, [isLoaded, user]);

  // --- Loading State ---
  if (status === "loading") {
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

  // --- Success State (brief flash before redirect) ---
  if (status === "success") {
    return (
      <main style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
          <h2 style={headingStyle}>ברוכים הבאים!</h2>
          <p style={subtextStyle}>מעבירים אתכם לקורס...</p>
        </div>
      </main>
    );
  }

  // --- Error State ---
  return (
    <main style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>😕</div>
        <h2 style={headingStyle}>משהו השתבש</h2>
        <p style={subtextStyle}>
          לא הצלחנו לחבר את החשבון שלכם. אל דאגה — זה לא אתם, זה אנחנו.
        </p>

        {/* Retry button */}
        <button
          onClick={() => {
            bridgeAttempted.current = false;
            setStatus("loading");
            setErrorMessage("");
          }}
          style={retryButtonStyle}
        >
          נסו שוב
        </button>

        {/* Direct link fallback */}
        <a
          href={process.env.NEXT_PUBLIC_BASE44_APP_URL || "#"}
          style={fallbackLinkStyle}
        >
          או לחצו כאן לגשת לקורס ישירות →
        </a>

        {/* WhatsApp support */}
        <p style={{ ...subtextStyle, marginTop: "24px", fontSize: "13px" }}>
          עדיין לא עובד?{" "}
          <a
            href="https://wa.me/972XXXXXXXXX"
            style={{ color: "#C8813A", textDecoration: "underline" }}
          >
            שלחו לנו הודעה בוואטסאפ
          </a>
        </p>

        {/* Error details (dev only) */}
        {process.env.NODE_ENV === "development" && errorMessage && (
          <pre
            style={{
              marginTop: "16px",
              padding: "12px",
              backgroundColor: "#FFF5F5",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#C53030",
              direction: "ltr",
              textAlign: "left",
              overflow: "auto",
            }}
          >
            {errorMessage}
          </pre>
        )}
      </div>
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
  // If created less than 60 seconds ago, it's a new signup
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

const retryButtonStyle: React.CSSProperties = {
  backgroundColor: "#C8813A",
  color: "#FFFFFF",
  fontSize: "16px",
  fontWeight: "600",
  padding: "12px 32px",
  borderRadius: "12px",
  border: "none",
  cursor: "pointer",
  marginTop: "8px",
};

const fallbackLinkStyle: React.CSSProperties = {
  display: "block",
  marginTop: "16px",
  fontSize: "14px",
  color: "#C8813A",
  textDecoration: "underline",
};
