import { redirect } from "next/navigation";

/**
 * Root page — redirect to signup.
 * Most users arrive via CTA link pointing to /signup directly,
 * but if they hit the root, send them to signup.
 */
export default function Home() {
  redirect("/signup");
}
