export default function TransformSection() {
  return (
    <section className="py-32 relative z-10 px-6 sm:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-20">
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-lime">
          The Transformation
        </span>
        <h2 className="h-section text-sheen mt-4">Legacy vs Sovereign</h2>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-12 lg:gap-16 reveal-fold">
        {/* Left - Legacy card */}
        <div className="tab-card-wrapper tab-card-red mt-6">
          <span className="absolute -top-7 left-8 text-[9px] font-mono text-white/30 uppercase tracking-widest">
            Traditional Path
          </span>
          <div className="tab-card-inner flex flex-col justify-between min-h-[220px]">
            <div>
              <h3 className="font-syne text-4xl font-bold text-white uppercase">
                Manual
                <br />
                Triage
              </h3>
            </div>
            <p className="text-white/40 font-light leading-relaxed text-sm mt-6">
              Triaging inboxes, manual data entry, and decision fatigue on
              repetitive tasks. Hours lost every single day.
            </p>
          </div>
        </div>

        {/* Right - Sovereign card */}
        <div className="tab-card-wrapper tab-card-lime mt-6 relative">
          {/* Alpha State badge */}
          <span className="absolute top-6 right-6 border border-brand-lime/30 text-brand-lime px-3 py-1 rounded text-[8px] font-bold tracking-widest uppercase bg-brand-lime/10 backdrop-blur-md z-10">
            Alpha State
          </span>
          <span className="absolute -top-7 left-8 text-[9px] font-mono text-brand-lime uppercase tracking-widest drop-shadow-[0_0_10px_rgba(212,255,0,0.3)]">
            Agentic Path
          </span>
          <div className="tab-card-inner flex flex-col justify-between min-h-[220px]">
            <div>
              <h3 className="font-syne text-4xl font-bold text-brand-lime uppercase drop-shadow-[0_0_20px_rgba(212,255,0,0.2)]">
                Autonomous
                <br />
                Flow
              </h3>
            </div>
            <p className="text-white/40 font-light leading-relaxed text-sm mt-6">
              Agents that observe, learn, and execute your operations with zero
              prompt overhead. You focus on what matters.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
