import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { bridgeToBase44, getBase44RedirectUrl } from "@/lib/base44";

/**
 * POST /api/bridge
 *
 * Server-side endpoint that bridges a Clerk session to Base44.
 *
 * 1. Verifies the user is authenticated with Clerk
 * 2. Creates or logs into the corresponding Base44 account
 * 3. Sets the Base44 token as an httpOnly cookie
 * 4. Returns the redirect URL
 *
 * Security: This endpoint is protected by Clerk middleware.
 * The BRIDGE_SECRET is never exposed to the client.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify Clerk authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user details from Clerk
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) {
      return NextResponse.json(
        { error: "No email address found" },
        { status: 400 }
      );
    }

    // Bridge to Base44
    const { token, isNewAccount } = await bridgeToBase44(
      email,
      userId,
      user.firstName || undefined,
      user.lastName || undefined
    );

    // Pass token in URL since login.ai-rise.co.il and base44.app
    // are different domains — cookies can't cross domain boundaries
    const redirectUrl = getBase44RedirectUrl(token);

    console.log("[Bridge Success]", {
      email,
      isNewAccount,
      hasToken: !!token,
      redirectUrl: redirectUrl.replace(token, "***")
    });

    return NextResponse.json({
      success: true,
      isNewAccount,
      redirectUrl,
    });
  } catch (error) {
    console.error("[Bridge Error]", {
      message: error instanceof Error ? error.message : "Unknown",
      stack: error instanceof Error ? error.stack : undefined,
    });

    const message = error instanceof Error ? error.message : "Internal server error";

    // Return a fallback redirect URL even on error
    // so the user can still get to the course (they'll need to
    // login again via Base44, but at least they're not stuck)
    const fallbackUrl = process.env.NEXT_PUBLIC_BASE44_APP_URL || "https://ai-rise.co.il";

    return NextResponse.json(
      {
        error: message,
        redirectUrl: fallbackUrl,
        isNewAccount: false,
      },
      { status: 500 }
    );
  }
}
