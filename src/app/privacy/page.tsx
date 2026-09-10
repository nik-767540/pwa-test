import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for the Hello World PWA",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-16">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">
        Hello World PWA
      </p>
      <h1 className="text-4xl font-semibold tracking-tight text-white">
        Privacy Policy
      </h1>
      <p className="mt-4 text-sm text-slate-400">Last updated: 10 September 2026</p>
      <div className="mt-8 space-y-4 text-base leading-7 text-slate-300">
        <p>
          This app is a Hello World Progressive Web App published at{" "}
          <a className="text-sky-300 underline" href={SITE_URL}>
            {SITE_URL}
          </a>
          . It does not require an account and does not collect names, email
          addresses, payment details, or other personal information.
        </p>
        <p>
          The Android Play Store listing opens this same website inside a
          Trusted Web Activity. Standard web logs from the host (for example
          Vercel) may include technical data such as IP address, browser type,
          and request time. We do not sell or share that data.
        </p>
        <p>
          The app can store files on your device through the service worker so
          Hello World still loads offline. That cache stays on your device.
        </p>
        <p>
          Questions:{" "}
          <a
            className="text-sky-300 underline"
            href="mailto:nikul.makvana@mobifly.tech"
          >
            nikul.makvana@mobifly.tech
          </a>
          .
        </p>
      </div>
      <Link
        href="/"
        className="mt-10 text-sm font-medium text-sky-300 underline decoration-sky-300/40 underline-offset-4"
      >
        Back to Hello World
      </Link>
    </main>
  );
}
