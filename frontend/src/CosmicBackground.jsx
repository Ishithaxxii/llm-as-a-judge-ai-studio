export default function CosmicBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 bg-[#080910]"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 75% 40%, rgba(50, 18, 111, 0.18) 0%, transparent 72%),
          radial-gradient(ellipse 60% 50% at 20% 80%, rgba(227, 68, 197, 0.08) 0%, transparent 70%),
          #080910
        `,
      }}
    />
  );
}