"use client";

import { useState, useEffect } from "react";
import { useAuth, UserButton, PricingTable } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const tones = [
  { id: "humanize", label: "Humanize", icon: "🧑" },
  { id: "formal", label: "Formal", icon: "👔" },
  { id: "informal", label: "Informal", icon: "💬" },
  { id: "concise", label: "Concise", icon: "✂️" },
  { id: "creative", label: "Creative", icon: "🎨" },
  { id: "academic", label: "Academic", icon: "🎓" },
];

export default function Home() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState<Record<string, string>>({});
  const [selectedTone, setSelectedTone] = useState("humanize");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [usageCount, setUsageCount] = useState<number | null>(null);
  const [isPro, setIsPro] = useState(false);
  const FREE_LIMIT = 3;

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
    const pendingText = localStorage.getItem("pendingText");
    if (pendingText) {
      setInputText(pendingText);
      localStorage.removeItem("pendingText");
    }
  }, []);

  async function fetchUsage() {
    try {
      const res = await fetch("/api/usage");
      if (res.ok) {
        const data = await res.json();
        if (data.isAuthenticated) {
          setUsageCount(data.count);
          setIsPro(data.isPro);
        }
      }
    } catch {
      // non-critical, ignore
    }
  }

  useEffect(() => {
    if (isSignedIn) fetchUsage();
  }, [isSignedIn]);

  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  async function handleParaphrase() {
    if (!inputText.trim()) return;

    if (!isSignedIn) {
      localStorage.setItem("pendingText", inputText);
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    setError("");
    setResults((prev) => { const next = { ...prev }; delete next[selectedTone]; return next; });

    try {
      const res = await fetch("/api/paraphrase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, tone: selectedTone }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 403 && data.requiresUpgrade) {
          setShowUpgradeModal(true);
          return;
        }
        setError(data.error || "Something went wrong.");
        return;
      }

      setLoading(false);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setResults((prev) => ({ ...prev, [selectedTone]: accumulated }));
      }
      fetchUsage();
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  const displayText = results[selectedTone] ?? "";

  async function handleCopy() {
    if (!displayText) return;
    await navigator.clipboard.writeText(displayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const wordCount = inputText.trim()
    ? inputText.trim().split(/\s+/).length
    : 0;

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Tabs Editor
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://blog.tabseditor.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Blog
            </a>
            <a
              href="/pricing"
              className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Pricing
            </a>
            <button
              onClick={toggleTheme}
              className="rounded-full bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            {isSignedIn ? (
              <UserButton />
            ) : (
              <a
                href="/auth/login"
                className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Log in
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Tabs Editor
          </h1>
          <p className="mt-3 text-lg text-slate-500 dark:text-zinc-400">
            Paraphrase, humanize, and transform your text instantly.
          </p>
        </div>

        {/* Tone Selector */}
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {tones.map((tone) => (
            <button
              key={tone.id}
              onClick={() => setSelectedTone(tone.id)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                selectedTone === tone.id
                  ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-black"
                  : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              <span>{tone.icon}</span>
              {tone.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Input */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                Original Text
              </label>
              <span className="text-xs text-slate-400 dark:text-zinc-500">
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type your text here..."
              className="min-h-[300px] flex-1 resize-none rounded-xl border border-slate-200 bg-white p-4 text-slate-800 placeholder-slate-400 shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
            />
          </div>

          {/* Output */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                Paraphrased Text
              </label>
              {displayText && (
                <button
                  onClick={handleCopy}
                  className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            <div className="min-h-[300px] flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-100">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex items-center gap-3 text-slate-400 dark:text-zinc-500">
                    <svg
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Transforming...
                  </div>
                </div>
              ) : displayText ? (
                <p className="whitespace-pre-wrap leading-relaxed">
                  {displayText}
                </p>
              ) : (
                <p className="text-slate-400 dark:text-zinc-500">
                  Your paraphrased text will appear here...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6 flex flex-col items-center gap-4">
          <button
            onClick={handleParaphrase}
            disabled={loading || !inputText.trim()}
            className="rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {loading ? "Transforming..." : `Paraphrase → ${tones.find((t) => t.id === selectedTone)?.label}`}
          </button>

          {/* Usage counter — only for signed-in free users */}
          {isSignedIn && !isPro && usageCount !== null && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                <span>
                  {usageCount >= FREE_LIMIT ? (
                    <>You&apos;ve used all <strong>{FREE_LIMIT}</strong> free paraphrases.</>
                  ) : (
                    <><strong>{usageCount}</strong> of <strong>{FREE_LIMIT}</strong> free uses</>
                  )}
                </span>
                <span className="text-slate-300 dark:text-zinc-600">·</span>
                <a href="/pricing" className="font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white">
                  Upgrade for unlimited
                </a>
              </div>
              <div className="h-1 w-48 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-700">
                <div
                  className={`h-full rounded-full transition-all ${
                    usageCount >= FREE_LIMIT
                      ? "bg-red-400 dark:bg-red-500"
                      : usageCount >= FREE_LIMIT - 1
                      ? "bg-amber-400 dark:bg-amber-500"
                      : "bg-slate-400 dark:bg-zinc-400"
                  }`}
                  style={{ width: `${Math.min((usageCount / FREE_LIMIT) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Upgrade Modal */}
    {showUpgradeModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">
          <button
            onClick={() => setShowUpgradeModal(false)}
            className="sticky top-4 float-right mr-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="px-8 pt-8 pb-2 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              You&apos;ve used your {FREE_LIMIT} free uses
            </h2>
            <p className="mt-2 text-slate-500 dark:text-zinc-400">
              Subscribe to get unlimited paraphrasing across all tones.
            </p>
          </div>
          <div className="p-6">
            <PricingTable />
          </div>
        </div>
      </div>
    )}
    </>
  );
}
