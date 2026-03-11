import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Simple pricing
          </h1>
          <p className="mt-3 text-lg text-slate-500 dark:text-zinc-400">
            Start for free. Upgrade for unlimited paraphrasing.
          </p>
        </div>
        <PricingTable />
      </div>
    </div>
  );
}
