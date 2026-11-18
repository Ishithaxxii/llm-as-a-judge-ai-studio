import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import FluidEnvironment from "./FluidEnvironment";
import LiquidChromeText from "./LiquidChromeText";

const easeCurve = [0.16, 1, 0.3, 1];

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();

  const handleSmoothScroll = (sectionId) => {
    const target = document.getElementById(sectionId);
    const behavior = shouldReduceMotion ? "auto" : "smooth";

    if (target) {
      target.scrollIntoView({ behavior, block: "start" });
      return;
    }

    window.scrollBy({
      top: Math.round(window.innerHeight * 0.85),
      behavior,
    });
  };

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex min-h-screen w-full items-center overflow-hidden bg-[#080910]"
    >
      {/* Edge-to-Edge Immersive Fluid Liquid-Glass Environment */}
      <FluidEnvironment />

      {/* Carefully Positioned Readability Scrim (No cards or boxed containers) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            linear-gradient(102deg, rgba(8, 9, 16, 0.86) 0%, rgba(8, 9, 16, 0.64) 36%, rgba(8, 9, 16, 0.18) 66%, rgba(8, 9, 16, 0.04) 100%),
            radial-gradient(ellipse 58% 62% at 22% 46%, rgba(8, 9, 16, 0.58) 0%, transparent 74%)
          `,
        }}
      />

      {/* Editorial Typography Integrated Directly Over the Fluid Environment */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 sm:px-10 lg:px-14 lg:py-28">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeCurve }}
          className="max-w-2xl"
        >
          {/* Eyebrow */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: easeCurve }}
            className="mb-7 flex items-center gap-3.5"
          >
            <span
              aria-hidden="true"
              className="h-px w-8 bg-gradient-to-r from-[#54D9FF] to-[#E344C5]"
            />
            <span className="font-mono text-xs font-medium tracking-[0.22em] text-[#54D9FF]">
              MULTI-MODEL INTELLIGENCE
            </span>
          </motion.div>

          {/* Headline */}

          {/* Headline */}
          <h1
            id="hero-heading"
            className="font-heading text-[clamp(3rem,5.8vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.03em] [text-wrap:balance]"
          >
            <LiquidChromeText
              variant="hero"
              className="block tracking-[-0.03em]"
            >
              LLM AS A JUDGE
            </LiquidChromeText>
          </h1>

          {/* Supporting Copy */}
          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: easeCurve }}
            className="mt-8 max-w-[50ch] font-body text-base font-normal leading-[1.72] text-[#F5F1F0]/85 drop-shadow-[0_4px_18px_rgba(8,9,16,0.75)] sm:text-lg"
          >
            Evaluate AI-generated responses through independent models. Compare
            reasoning, measure agreement, expose disagreements and understand
            every verdict.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: easeCurve }}
            className="mt-11 flex flex-wrap items-center gap-4"
          >
            <button
              type="button"
              onClick={() => handleSmoothScroll("workspace")}
              className="group inline-flex min-h-[48px] shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full bg-[#F5F1F0] px-7 py-3.5 font-body text-sm font-semibold tracking-[0.01em] text-[#080910] shadow-[0_12px_36px_rgba(8,9,16,0.6)] transition duration-200 hover:bg-[#54D9FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54D9FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080910]"
            >
              <span>Start Evaluation</span>
              <ArrowRight
                size={17}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </button>

            <button
              type="button"
              onClick={() => handleSmoothScroll("engine")}
              className="group inline-flex min-h-[48px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-[#F5F1F0]/25 bg-[#080910]/55 px-7 py-3.5 font-body text-sm font-medium tracking-[0.01em] text-[#F5F1F0] backdrop-blur-md transition duration-200 hover:border-[#54D9FF]/65 hover:bg-[#32126F]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54D9FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080910]"
            >
              <span>Explore the Engine</span>
              <ArrowDownRight
                size={16}
                aria-hidden="true"
                className="text-[#54D9FF] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
              />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}