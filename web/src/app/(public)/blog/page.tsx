"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, User } from "lucide-react";
import { blogArticles } from "@/lib/blogData";

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease } }),
};

const categories = ["Tous", ...Array.from(new Set(blogArticles.map((a) => a.category)))];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("Tous");

  const filteredArticles = activeCategory === "Tous"
    ? blogArticles
    : blogArticles.filter((a) => a.category === activeCategory);

  const featured = filteredArticles[0];
  const rest = filteredArticles.slice(1);

  return (
    <>
      <section className="pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="container">
          <motion.div className="max-w-3xl mx-auto text-center" initial="hidden" animate="visible" variants={fadeUp}>
            <motion.p variants={fadeUp} custom={0} className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-3">Blog</motion.p>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">Ressources pour les réseaux sociaux.</motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-gray-500 max-w-xl mx-auto">Conseils pratiques, stratégies et guides pour optimiser votre présence sur les réseaux sociaux.</motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-4 border-b border-gray-100 sticky top-[65px] z-30 bg-white/95 backdrop-blur-sm">
        <div className="container">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {featured && (
        <section className="py-12 md:py-16">
          <div className="container">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <Link href={`/blog/${featured.slug}`} className="block group">
                <div className="grid md:grid-cols-2 gap-0 items-stretch rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-colors">
                  <div className="aspect-[16/10] md:aspect-auto bg-[#F7F7F5] flex items-center justify-center p-10">
                    <span className="text-8xl group-hover:scale-110 transition-transform duration-500">{featured.emoji}</span>
                  </div>
                  <div className="p-8 md:p-10 flex flex-col justify-center">
                    <span className="text-[12px] font-medium text-gray-400 uppercase tracking-wider mb-3">{featured.category}</span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-4 group-hover:text-gray-600 transition-colors leading-snug">{featured.title}</h2>
                    <p className="text-[15px] text-gray-500 mb-5 leading-relaxed line-clamp-3">{featured.excerpt}</p>
                    <div className="flex items-center gap-4 text-[13px] text-gray-400">
                      <span className="flex items-center gap-1.5"><User size={13} />{featured.author}</span>
                      <span>{featured.date}</span>
                      <span className="flex items-center gap-1"><Clock size={13} />{featured.readTime}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      <section className="pb-24 md:pb-32">
        <div className="container">
          {rest.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {rest.map((article, i) => (
                <motion.div key={article.slug} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} custom={i % 3}>
                  <Link href={`/blog/${article.slug}`} className="block group h-full">
                    <div className="h-full rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-colors flex flex-col">
                      <div className="aspect-[16/10] bg-[#F7F7F5] flex items-center justify-center">
                        <span className="text-5xl group-hover:scale-110 transition-transform duration-500">{article.emoji}</span>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">{article.category}</span>
                        <h3 className="text-[15px] font-semibold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors leading-snug">{article.title}</h3>
                        <p className="text-[13px] text-gray-400 mb-4 line-clamp-2 leading-relaxed flex-1">{article.excerpt}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-[12px] text-gray-400">
                          <span className="flex items-center gap-1"><User size={12} />{article.author}</span>
                          <span className="flex items-center gap-1"><Clock size={12} />{article.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16"><p className="text-gray-400 text-lg">Aucun article dans cette catégorie pour le moment.</p></div>
          )}
        </div>
      </section>

      <section className="py-24 md:py-32 bg-gray-900">
        <div className="container">
          <motion.div className="max-w-2xl mx-auto text-center" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">Recevez nos meilleurs conseils.</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">Rejoignez plus de 2 800 professionnels qui reçoivent nos stratégies chaque semaine.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" placeholder="votre@email.com" className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 text-[14px]" />
              <button className="px-6 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors text-[14px] whitespace-nowrap">S&apos;abonner</button>
            </div>
            <p className="text-[12px] text-gray-500 mt-4">Pas de spam. Désabonnement en un clic.</p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
