import { ArrowDown } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-8 z-10 pt-32 pb-20">
      {/* Badge */}
      <div className="mb-10 initial-fade" style={{ opacity: 0 }}>
        <div className="inline-flex items-center justify-center border border-white/10 bg-white/[0.03] text-white text-[10px] font-mono tracking-widest px-5 py-2.5 rounded-full backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <span className="w-2 h-2 rounded-full bg-brand-lime animate-pulse mr-3 shadow-[0_0_10px_#D4FF00]" />
          FOUNDING MEMBER PRICING ACTIVE
        </div>
      </div>

      {/* H1 */}
      <h1 className="h-echelon mb-8 text-white drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
        <span className="hero-mask">
          <span className="hero-line">Stop Getting</span>
        </span>
        <span className="hero-mask">
          <span className="hero-line">
            <span className="text-brand-lime drop-shadow-[0_0_30px_rgba(212,255,0,0.2)]">
              Left Behind.
            </span>
          </span>
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto mb-16 font-light leading-relaxed parallax-layer initial-fade" style={{ opacity: 0 }}>
        MindSparkAI teaches everyday people how to use AI agents to automate
        work, boost productivity, and future-proof their careers —{' '}
        <span className="text-white italic">no tech background required.</span>
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-6 items-center parallax-layer initial-fade" style={{ opacity: 0 }}>
        <a
          href="https://buy.stripe.com/3cIcN70Fl8mYgvk0RCcV20a"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-glass-glow px-12 py-5 text-[11px] shadow-[0_0_40px_rgba(212,255,0,0.3)]"
        >
          Activate Masterclass — $27
        </a>
        <a
          href="#modules"
          className="flex items-center gap-3 text-white/40 font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-colors"
        >
          See the Syllabus
          <ArrowDown className="h-4 w-4" />
        </a>
      </div>

      {/* Proof stats */}
      <div className="flex flex-wrap gap-12 justify-center mt-20 initial-fade" style={{ opacity: 0 }}>
        <div className="text-center">
          <div className="font-syne text-3xl font-bold text-brand-lime">
            4.9<span className="text-lg text-white/40">&#9733;</span>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">
            Average Rating
          </div>
        </div>
        <div className="text-center">
          <div className="font-syne text-3xl font-bold text-white">30+</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">
            Video Lessons
          </div>
        </div>
        <div className="text-center">
          <div className="font-syne text-3xl font-bold text-white">100%</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">
            Beginner Friendly
          </div>
        </div>
        <div className="text-center">
          <div className="font-syne text-3xl font-bold text-brand-cyan">24/7</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">
            Community Access
          </div>
        </div>
      </div>
    </section>
  )
}
