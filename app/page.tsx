const MARKETS = [
  "Points", "Rebounds", "Assists", "Threes",
  "Pts + Reb + Ast", "Pts + Ast", "Pts + Reb", "Reb + Ast",
];

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Line Movement Charts",
    desc: "Track how odds, lines, and gaps shift over time with per-player charts. See exactly when books move and by how much.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Same & Different Lines",
    desc: "Filter by matching or mismatched lines. When lines differ, fair value is interpolated so the gap stays meaningful.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: "Bet Tracker",
    desc: "Mark props you've bet on. They stay highlighted as odds update in real time, so you can watch your positions move.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Real-Time Updates",
    desc: "Odds stream in via SSE as soon as a new snapshot is scraped. No refreshing needed — cards update automatically.",
  },
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

      {/* Hero */}
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
            Compare Sports Interaction NBA player prop odds against FanDuel&apos;s sharp
            line — with the vig removed.
          </p>
          <CTAButton />
        </div>
      </section>

      {/* Section 1: Spot the gaps */}
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
              A positive gap means Sports Interaction is offering better value than FanDuel&apos;s
              sharp line suggests. A negative gap means FanDuel sees it
              differently.
            </p>
          </div>
          <img src="/example.png" alt="Oddsboard" className="md:col-span-2 w-full rounded-xl" />
        </div>
      </section>

      {/* Section 2: Markets */}
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
              8 markets tracked for every player available on both Sports Interaction and FanDuel.
            </p>
            <p className="text-base text-zinc-400 leading-relaxed">
              Odds are scraped every 5 minutes starting 1 hour before tip-off
              and saved as snapshots so you can track how lines move over time.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Feature grid */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-zinc-50 mb-3 text-center">
            What&apos;s under the hood
          </h2>
          <p className="text-base text-zinc-500 text-center mb-12 max-w-lg mx-auto">
            Tools built around the board to help you filter, track, and react.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-800/60 p-5"
                style={{ background: "rgba(19,21,27,0.7)" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-bold text-zinc-200">
                    {f.title}
                  </h3>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 pt-8 pb-20 text-center">
        <CTAButton />
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center border-t border-zinc-800/40">
        <p className="text-xs text-zinc-600">
          For informational purposes only. Not financial advice.
        </p>
      </footer>
    </div>
  );
}