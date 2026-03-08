/*
 * Design: Notion/Tally style — minimal, clean, black text, white bg
 * Navigation simple, logo Calenji avec smileys, CTA noir
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CalenjiLogo from "./CalenjiLogo";

const navLinks = [
  { href: "/fonctionnalites", label: "Fonctionnalités" },
  { href: "/prix", label: "Prix" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <CalenjiLogo size={28} />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 text-[14px] rounded-lg transition-colors ${
                location === link.href
                  ? "text-gray-900 bg-gray-50 font-medium"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/contact" className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors px-3 py-2">
            Connexion
          </Link>
          <Link
            href="/contact"
            className="bg-black text-white text-[14px] font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Commencer gratuitement
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          aria-label="Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white"
          >
            <div className="container py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 text-[15px] rounded-lg ${
                    location === link.href
                      ? "text-gray-900 bg-gray-50 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-3 flex flex-col gap-2">
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-[15px] text-gray-600"
                >
                  Connexion
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="bg-black text-white text-[15px] font-medium px-4 py-2.5 rounded-lg text-center"
                >
                  Commencer gratuitement
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
