
const technologies = [
  "React",
  "Vite",
  "Tailwind CSS",
  "Framer Motion",
  "Recharts",
  "FastAPI",
  "Python",
  "SQLAlchemy",
  "PostgreSQL",
  "Google AI Studio",
  "Groq",
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#080910]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 100% at 50% 100%, rgba(50, 18, 111, 0.18), transparent 75%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-14">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div>
              <a
                href="#hero-heading"
                className="font-heading text-2xl font-bold tracking-tight text-[#F5F1F0] transition-colors hover:text-[#54D9FF]"
              >
                LLMAJ<span className="text-[#54D9FF]">.</span>
              </a>

              <p className="mt-3 max-w-sm font-body text-sm leading-6 text-[#F5F1F0]/60">
                Multi-model LLM evaluation. Compare independent judges,
                measure agreement, and understand every verdict.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-mono text-[10px] font-medium tracking-[0.22em] text-[#54D9FF]">
                CONNECT
              </span>

              <div className="flex flex-wrap items-center gap-5">
                <a
                  href="https://www.linkedin.com/in/ishitha-sankarabhukta/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit Ishitha Sankarabhukta on LinkedIn"
                  className="inline-flex items-center gap-2 text-sm text-[#F5F1F0]/75 transition-colors hover:text-[#54D9FF]"
                >
                  LinkedIn ↗
                </a>

                <a
                  href="https://github.com/Ishithaxxii/llm-as-a-judge-ai-studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View LLMAJ source code on GitHub"
                  className="inline-flex items-center gap-2 text-sm text-[#F5F1F0]/75 transition-colors hover:text-[#54D9FF]"
                >
                  GitHub Repository ↗
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-7">
            <span className="font-mono text-[10px] font-medium tracking-[0.22em] text-[#54D9FF]">
              BUILT WITH
            </span>

            <div className="mt-4 flex flex-wrap gap-2">
              {technologies.map((technology) => (
                <span
                  key={technology}
                  className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 font-body text-xs text-[#F5F1F0]/65 transition-colors hover:border-[#54D9FF]/40 hover:text-[#54D9FF]"
                >
                  {technology}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center">
            <p className="text-[#F5F1F0]/55">
              Designed &amp; built by{" "}
              <a
                href="https://www.linkedin.com/in/ishitha-sankarabhukta/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#F5F1F0]/85 transition-colors hover:text-[#54D9FF]"
              >
                Ishitha Sankarabhukta
              </a>
            </p>

            <p className="text-[#F5F1F0]/40">
              © 2026 LLMAJ. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}