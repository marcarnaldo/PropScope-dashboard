const MARKETS = [
  "Points", "Rebounds", "Assists", "Threes",
  "Pts + Reb + Ast", "Pts + Ast", "Pts + Reb", "Reb + Ast",
];

function CTAButton() {
  return (
    <a
      href="/sports/nba"
      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-base font-semibold text-white transition-all duration-200 hover:brightness-110 hover:scale-[1.02]"
      style={{
        background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
        boxShadow: "0 0 24px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
      }}
    >
      View NBA Props Board
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 8h10M9 4l4 4-4 4" />
      </svg>
    </a>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen text-zinc-300" style={{ background: "#18181b" }}>

      {/* Hero - centered, CTA up top */}
      <section className="px-6 pt-24 pb-20 text-center relative overflow-hidden">
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "700px",
            height: "500px",
            background: "radial-gradient(ellipse at center, rgba(16,185,129,0.1) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-50 mb-5">
            PropScope
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed mb-8">
            Compare Sports Interaction NBA player prop odds against FanDuel's sharp
            line - with the vig removed.
          </p>
          <CTAButton />
        </div>
      </section>

      {/* Section 1: What you see - left text, right mini table */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-zinc-50 mb-4">
              Spot the gaps at a glance
            </h2>
            <p className="text-base text-zinc-400 leading-relaxed mb-4">
              Every card shows a player prop with no-vig probabilities from both
              Sports Interaction and FanDuel. When they disagree, the gap lights
              up green or red.
            </p>
            <p className="text-base text-zinc-400 leading-relaxed">
              A positive gap means Sports Interaction is offering better value than FanDuel's
              sharp line suggests. A negative gap means FanDuel sees it
              differently.
            </p>
          </div>
            <img src="/example.png" alt="Oddsboard" className="md:col-span-2 w-full rounded-xl" />
        </div>
      </section>

      {/* Section 2: What's tracked - right text, left market pills */}
      <section className="px-6 py-20" style={{ background: "rgba(0,0,0,0.15)" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="flex flex-wrap gap-2.5">
              {MARKETS.map((m, i) => (
                <span
                  key={i}
                  className="px-4 py-2.5 rounded-lg border border-zinc-700 text-sm font-medium text-zinc-300"
                  style={{ background: "rgba(24,24,27,0.8)" }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-2xl font-bold text-zinc-50 mb-4">
              8 markets, every 5 minutes
            </h2>
            <p className="text-base text-zinc-400 leading-relaxed mb-4">
              8 markets tracked for every player available on both Sports Interaction and Fanduel.
            </p>
            <p className="text-base text-zinc-400 leading-relaxed">
              Odds are scraped every 5 minutes starting 1 hour before tip-off
              and saved as snapshots so you can track how lines move over time.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center">
        <p className="text-xs text-zinc-600">
          For informational purposes only. Not financial advice.
        </p>
      </footer>
    </div>
  );
}