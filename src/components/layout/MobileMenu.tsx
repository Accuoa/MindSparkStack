'use client'

import { X } from 'lucide-react'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const links = [
  { label: 'Courses', href: '#modules' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Reviews', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Student Login', href: '/course/login' },
]

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <div className={`mobile-overlay${isOpen ? ' open' : ''}`}>
      {/* Close button */}
      <button
        className="absolute top-6 right-6 text-white"
        onClick={onClose}
        aria-label="Close menu"
      >
        <X className="h-8 w-8" />
      </button>

      {/* Links */}
      <nav className="flex flex-col items-center gap-6 mt-24">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="font-syne text-2xl font-bold text-white uppercase tracking-tight"
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Enroll button */}
      <div className="mt-12 flex justify-center">
        <a
          href="#pricing"
          onClick={onClose}
          className="btn-lime px-10 py-4 text-sm font-bold uppercase tracking-[0.2em]"
        >
          Enroll Now
        </a>
      </div>
    </div>
  )
}
