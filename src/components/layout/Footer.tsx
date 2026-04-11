import { Activity } from 'lucide-react'
import {
  footerPlatform,
  footerCompany,
  footerLegal,
  socialLinks,
} from '@/data/navigation'

export default function Footer() {
  return (
    <footer className="bg-obsidian border-t border-white/5 py-16 px-8">
      <div className="mx-auto max-w-7xl">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Col 1: Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-brand-lime" />
              <span className="font-syne text-lg font-black uppercase tracking-tighter text-white">
                MindSpark
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              AI-powered education for the autonomous era. Master AI tools,
              automate your workflows, and future-proof your career.
            </p>
          </div>

          {/* Col 2: Platform */}
          <div>
            <h4 className="font-syne text-sm font-bold uppercase tracking-widest text-white mb-4">
              Platform
            </h4>
            <ul className="space-y-3">
              {footerPlatform.map((link) => (
                <li key={link.href + link.label}>
                  <a
                    href={link.href}
                    className="text-white/40 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 className="font-syne text-sm font-bold uppercase tracking-widest text-white mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {footerCompany.map((link) => (
                <li key={link.href + link.label}>
                  <a
                    href={link.href}
                    className="text-white/40 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Legal */}
          <div>
            <h4 className="font-syne text-sm font-bold uppercase tracking-widest text-white mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLegal.map((link) => (
                <li key={link.href + link.label}>
                  <a
                    href={link.href}
                    className="text-white/40 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            &copy; 2026 MindSparkAI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-brand-lime text-xs font-bold uppercase tracking-widest transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
