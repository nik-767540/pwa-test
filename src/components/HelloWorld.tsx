"use client";

import { SITE_URL } from "@/lib/site";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function HelloWorld() {
  const [online, setOnline] = useState(true);
  const [installed, setInstalled] = useState(false);
  const [workerReady, setWorkerReady] = useState(false);
  const [workerError, setWorkerError] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    setIsAndroid(/Android/i.test(userAgent));
    setIsIOS(/iPhone|iPad|iPod/i.test(userAgent));
    setOnline(navigator.onLine);
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);

    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("beforeinstallprompt", onPrompt);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then(() => setWorkerReady(true))
        .catch(() => setWorkerError(true));
    }

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  async function installApp() {
    if (!installEvent) {
      return;
    }
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
    setInstallEvent(null);
  }

  const workerLabel = workerReady
    ? "Active"
    : workerError
      ? "Unavailable"
      : "Registering";

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/70 p-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.45)] backdrop-blur">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">
          Next.js PWA
        </p>
        <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
          Hello World
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-300">
          Open this live site in Chrome on Android, then install it to your home
          screen.
        </p>
        <a
          href={SITE_URL}
          className="mt-4 inline-block break-all text-sm font-medium text-sky-300 underline decoration-sky-300/40 underline-offset-4"
        >
          {SITE_URL}
        </a>

        <dl className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
          <Status label="Network" value={online ? "Online" : "Offline"} />
          <Status label="Worker" value={workerLabel} />
          <Status label="App" value={installed ? "Installed" : "Browser"} />
        </dl>

        {installed ? (
          <p className="mt-8 text-sm text-slate-400">
            Running as an installed app.
          </p>
        ) : installEvent ? (
          <button
            type="button"
            onClick={installApp}
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-sky-400 px-6 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
          >
            Install app
          </button>
        ) : (
          <ol className="mt-8 space-y-2 text-left text-sm leading-6 text-slate-300">
            {isIOS ? (
              <>
                <li>1. Open this site in Safari.</li>
                <li>2. Tap the Share button.</li>
                <li>3. Tap Add to Home Screen.</li>
              </>
            ) : (
              <>
                <li>1. Open this site in Chrome{isAndroid ? " on Android" : ""}.</li>
                <li>2. Tap the menu (three dots).</li>
                <li>3. Tap Install app or Add to Home screen.</li>
              </>
            )}
          </ol>
        )}
        <a
          href="/privacy"
          className="mt-8 inline-block text-xs text-slate-500 underline decoration-slate-500/40 underline-offset-4"
        >
          Privacy policy
        </a>
      </div>
    </main>
  );
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
      <dt className="text-[11px] uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-100">{value}</dd>
    </div>
  );
}
