'use client'

import { useState, useRef, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import { faqItems } from '@/data/faq'

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const answerRefs = useRef<(HTMLDivElement | null)[]>([])

  const setRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      answerRefs.current[index] = el
    },
    []
  )

  function toggle(index: number) {
    const nextIndex = openIndex === index ? null : index

    // Close previous
    if (openIndex !== null && answerRefs.current[openIndex]) {
      answerRefs.current[openIndex]!.style.maxHeight = '0px'
    }

    // Open next
    if (nextIndex !== null && answerRefs.current[nextIndex]) {
      answerRefs.current[nextIndex]!.style.maxHeight =
        answerRefs.current[nextIndex]!.scrollHeight + 'px'
    }

    setOpenIndex(nextIndex)
  }

  return (
    <section id="faq" className="py-32 relative z-10 px-6 sm:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-syne text-4xl md:text-5xl font-bold text-obsidian uppercase tracking-tighter">
            Got Questions?
          </h2>
        </div>

        {/* Accordion */}
        <div className="space-y-4 reveal-fold">
          {faqItems.map((item, i) => {
            const isOpen = openIndex === i

            return (
              <div
                key={i}
                className={`faq-item ivory-card overflow-hidden ${isOpen ? 'open' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className="w-full text-left px-8 py-6 flex justify-between items-center gap-4"
                >
                  <span className="font-bold text-obsidian text-sm">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`faq-chevron size-5 text-obsidian/40 transition-transform flex-shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  ref={setRef(i)}
                  className="faq-answer px-8 overflow-hidden transition-[max-height] duration-300 ease-in-out"
                  style={{ maxHeight: isOpen ? undefined : '0px' }}
                >
                  <p className="text-obsidian/60 text-sm leading-relaxed pb-6">
                    {item.answer}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
