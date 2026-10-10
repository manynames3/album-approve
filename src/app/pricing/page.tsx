import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Instrument_Serif } from "next/font/google";
import { BrandWordmark } from "@/components/brand";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { Button } from "@/components/ui/button";

const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400" });

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Button asChild variant="ghost" className="gap-2">
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden />
            <BrandWordmark className="text-[0.68rem] tracking-[0.2em]" />
          </Link>
        </Button>
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <p className="text-xs font-medium text-teal-700">Planned pricing</p>
          <h1
            className={`${instrumentSerif.className} mt-4 text-[36px] font-normal leading-[1.1] sm:text-[48px]`}
          >
            Simple plans for album proofing.
          </h1>
          <p className="mt-5 text-base leading-7 text-zinc-500">
            Choose by album volume. Preview the workflow before deciding.
          </p>
        </div>
        <section aria-label="Pricing" className="mt-12">
          <PricingPlans />
        </section>
        <div className="mx-auto mt-8 max-w-xl text-center text-sm leading-6">
          <Link
            href="/proof/demo-proof-token"
            className="inline-flex items-center gap-2 font-medium text-teal-700 hover:text-teal-800"
          >
            View demo proof <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </main>
  );
}
