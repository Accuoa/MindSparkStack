'use client'

import { useState } from 'react'
import { Activity, Menu } from 'lucide-react'
import { navLinks } from '@/data/navigation'
import MobileMenu from './MobileMenu'

export default function Navbar() {
  const [mobileMenu, setMobileMenu] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6 sm:p-8">
        <div
          id="nav-pill"
          className="theme-dark flex w-full max-w-7xl items-center justify-between rounded-[2rem] px-8 sm:px-10 py-4"
        >
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 nav-logo">
            <Activity className="h-5 w-5 text-brand-lime drop-shadow" />
            <span className="font-syne text-lg font-black uppercase tracking-tighter nav-logo-text">
              MindSpark
            </span>
          </a>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="nav-link text-[10px] font-bold uppercase tracking-[0.2em]"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <a
              href="/course/login"
              className="nav-link hidden md:block text-[10px] font-bold uppercase tracking-[0.2em]"
            >
              Student Login
            </a>
            <a
              href="#pricing"
              className="btn-lime px-8 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em]"
            >
              Enroll
            </a>
            <button
              className="lg:hidden nav-hamburger"
              onClick={() => setMobileMenu(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu isOpen={mobileMenu} onClose={() => setMobileMenu(false)} />
    </>
  )
}
