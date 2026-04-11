export default function ObjectionSection() {
  const objections = [
    {
      title: '\u201cI\u2019m not technical enough.\u201d',
      answer:
        'That\u2019s exactly who this is for. You don\u2019t need to code, configure APIs, or understand machine learning. If you can type a sentence and follow along with a video, you have the skills. Module 1 starts from zero.',
    },
    {
      title: '\u201cI don\u2019t have time for another course.\u201d',
      answer:
        'Most students finish in 2-3 weeks at 30 minutes a day. And the whole point is to save you time \u2014 the workflows you build in Week 1 start paying back hours immediately. Lifetime access means you go at your own pace.',
    },
    {
      title: '\u201cWhat if it\u2019s not for me?\u201d',
      answer:
        'Then you get your money back. Both Masterclass and VIP come with a full 30-day guarantee. Request a refund from your billing page \u2014 it\u2019s instant and automatic. No emails, no awkward conversations.',
    },
  ]

  return (
    <section className="py-24 relative z-10 px-6 sm:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <span className="text-obsidian/40 font-bold uppercase tracking-[0.2em] text-[10px] mb-6 block">
          Still on the Fence?
        </span>
        <h2 className="font-syne text-3xl sm:text-4xl font-bold text-obsidian mb-12 tracking-tight">
          Three things worth knowing.
        </h2>
        <div className="space-y-8 text-left reveal-fold">
          {objections.map((obj) => (
            <div key={obj.title} className="ivory-card p-8">
              <h3 className="font-syne font-bold text-obsidian text-base mb-2">
                {obj.title}
              </h3>
              <p className="text-obsidian/60 text-sm leading-relaxed">
                {obj.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
