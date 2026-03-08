/*
 * Design: Warm SaaS — Outfit headings, Plus Jakarta Sans body
 * Colors: Coral (#E8564A) primary, Navy (#1A2B4A) text, white bg
 * Sticky header with blur backdrop, clean navigation
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LOGO_URL = "/images/logo-icon.png";

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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img src={LOGO_URL} alt="Social Calendar" className="h-8 w-8 rounded-lg" />
          <span className="font-heading text-xl font-bold text-navy tracking-tight">
            Social<span className="text-primary">Calendar</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                location === link.href
                  ? "text-primary bg-coral-light"
                  : "text-foreground/70 hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/#" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
            Connexion
          </Link>
          <Button asChild className="bg-primary hover:bg-primary/90 text-white font-semibold px-5 shadow-lg shadow-primary/20">
            <Link href="/#">Commencer gratuitement</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/40 bg-white"
          >
            <nav className="container py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    location === link.href
                      ? "text-primary bg-coral-light"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 pt-3 border-t border-border/40 flex flex-col gap-2">
                <Link
                  href="/#"
                  className="px-4 py-3 text-sm font-medium text-foreground/70 hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  Connexion
                </Link>
                <Button className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20">
                  Commencer gratuitement
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
