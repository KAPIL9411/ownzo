import Link from 'next/link'
import Image from 'next/image'
import {
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight
} from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6" style={{ maxWidth: 1400 }}>

        {/* Main Footer Content - Responsive Grid */}
        <div className="py-8 sm:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">

          {/* Brand Section - Full width on mobile */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 group">
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl overflow-hidden ring-2 ring-gray-100 group-hover:ring-[#1B4332]/20 transition-all">
                <Image
                  src="/images/logo/logo.webp"
                  alt="Ownzo Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl sm:text-2xl font-black text-[#1B4332]">Ownzo</span>
            </Link>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 max-w-sm">
              Your trusted community marketplace. Buy, sell, and trade with people in your neighborhood safely and easily. Join thousands of users already trading locally.
            </p>

            {/* Social Links */}
            <div className="flex gap-2">
              {[
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-gray-50 hover:bg-[#1B4332] text-gray-600 hover:text-white flex items-center justify-center transition-all duration-200 group"
                >
                  <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Marketplace Links */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-[#1B4332] text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">Marketplace</h3>
            <ul className="space-y-2 sm:space-y-2.5">
              {[
                { label: 'Browse Listings', href: '/listings' },
                { label: 'Buy Requests', href: '/buy-requests' },
                { label: 'Communities', href: '/community' },
                { label: 'My Listings', href: '/listings/my' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-gray-600 hover:text-[#1B4332] text-xs sm:text-sm transition-colors inline-flex items-center gap-2 group"
                  >
                    <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-[#1B4332] text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">Company</h3>
            <ul className="space-y-2 sm:space-y-2.5">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'Careers', href: '/careers' },
                { label: 'Blog', href: '/blog' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-gray-600 hover:text-[#1B4332] text-xs sm:text-sm transition-colors inline-flex items-center gap-2 group"
                  >
                    <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Legal */}
          <div className="lg:col-span-3">
            <h3 className="font-bold text-[#1B4332] text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">Support</h3>
            <ul className="space-y-2 sm:space-y-2.5 mb-4 sm:mb-6">
              {[
                { label: 'Help Center', href: '/help' },
                { label: 'Safety Tips', href: '/safety' },
                { label: 'Report Issue', href: '/report' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-gray-600 hover:text-[#1B4332] text-xs sm:text-sm transition-colors inline-flex items-center gap-2 group"
                  >
                    <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact Email */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 bg-gray-50 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5">
              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#1B4332] shrink-0" />
              <a href="mailto:support@ownzo.in" className="hover:text-[#1B4332] transition-colors truncate">
                support@ownzo.in
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar - Responsive Stack */}
        <div className="py-4 sm:py-6 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-gray-500 text-xs sm:text-sm text-center sm:text-left">
              © {currentYear} Ownzo. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <Link href="/legal/privacy" className="text-gray-500 hover:text-[#1B4332] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/legal/terms" className="text-gray-500 hover:text-[#1B4332] transition-colors">
                Terms of Service
              </Link>
              <Link href="/legal/cookies" className="text-gray-500 hover:text-[#1B4332] transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}
