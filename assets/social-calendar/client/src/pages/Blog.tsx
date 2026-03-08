/*
 * Design: Warm SaaS — Blog listing page
 * SEO: "blog planification réseaux sociaux", "conseils social media", "stratégie contenu"
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { Clock, ArrowRight, Search, Tag, User, BookOpen } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogArticles } from "@/lib/blogData";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={stagger} className={className}>
      {children}
    </motion.div>
  );
}

const categories = ["Tous", ...Array.from(new Set(blogArticles.map((a) => a.category)))];

const categoryColors: Record<string, string> = {
  Guide: "bg-blue-50 text-blue-700 border-blue-200",
  Stratégie: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Conseils: "bg-amber-50 text-amber-700 border-amber-200",
  Instagram: "bg-pink-50 text-pink-700 border-pink-200",
  TikTok: "bg-violet-50 text-violet-700 border-violet-200",
  LinkedIn: "bg-sky-50 text-sky-700 border-sky-200",
  Agence: "bg-orange-50 text-orange-700 border-orange-200",
};

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("Tous");

  useEffect(() => {
    document.title = "Blog — Social Calendar | Conseils et Stratégies Réseaux Sociaux";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Découvrez nos articles sur la planification de contenu, les stratégies social media, les meilleurs moments pour publier et les astuces pour augmenter votre engagement sur Instagram, TikTok, LinkedIn et plus.");
  }, []);

  const filteredArticles = activeCategory === "Tous"
    ? blogArticles
    : blogArticles.filter((a) => a.category === activeCategory);

  const featured = filteredArticles[0];
  const rest = filteredArticles.slice(1);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-16 pb-10 lg:pt-24 lg:pb-14 bg-gradient-to-b from-ice to-white">
          <div className="container">
            <AnimatedSection className="max-w-3xl mx-auto text-center">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-border/60 text-sm text-foreground/60 mb-6 shadow-sm">
                <BookOpen className="w-4 h-4 text-primary" />
                {blogArticles.length} articles pour booster votre stratégie
              </motion.div>
              <motion.h1 variants={fadeUp} className="font-heading text-4xl sm:text-5xl font-extrabold text-navy mb-6 leading-tight">
                Le Blog <span className="text-primary">Social Calendar</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
                Conseils pratiques, stratégies éprouvées et guides complets pour optimiser votre présence sur les réseaux sociaux, augmenter votre engagement et gagner du temps grâce à la planification intelligente.
              </motion.p>
            </AnimatedSection>
          </div>
        </section>

        {/* Category filters */}
        <section className="py-6 bg-white border-b border-border/30 sticky top-16 z-30 backdrop-blur-md bg-white/90">
          <div className="container">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                    activeCategory === cat
                      ? "bg-navy text-white border-navy shadow-md"
                      : "bg-white text-foreground/60 border-border/40 hover:border-primary/30 hover:text-navy"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured article */}
        {featured && (
          <section className="py-12 bg-white">
            <div className="container">
              <AnimatedSection>
                <motion.div variants={fadeUp}>
                  <Link href={`/blog/${featured.slug}`} className="block group">
                    <div className="grid lg:grid-cols-2 gap-0 items-stretch bg-ice rounded-2xl border border-border/40 overflow-hidden hover:border-primary/20 hover:shadow-xl transition-all duration-300">
                      <div className="aspect-[16/10] lg:aspect-auto bg-gradient-to-br from-primary/10 via-blue-50/50 to-primary/5 flex items-center justify-center p-10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(232,86,74,0.08),transparent_70%)]" />
                        <div className="text-8xl relative z-10 group-hover:scale-110 transition-transform duration-500">{featured.emoji}</div>
                      </div>
                      <div className="p-8 lg:p-10 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${categoryColors[featured.category] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                            {featured.category}
                          </span>
                          <span className="text-xs text-foreground/40 font-medium uppercase tracking-wider">Article vedette</span>
                        </div>
                        <h2 className="font-heading text-2xl lg:text-3xl font-bold text-navy mb-4 group-hover:text-primary transition-colors leading-snug">
                          {featured.title}
                        </h2>
                        <p className="text-foreground/60 mb-5 leading-relaxed line-clamp-3">{featured.excerpt}</p>
                        <div className="flex items-center gap-4 text-sm text-foreground/40 mb-5">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            {featured.author}
                          </span>
                          <span>{featured.date}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {featured.readTime}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {featured.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded bg-white border border-border/40 text-xs text-foreground/40">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </AnimatedSection>
            </div>
          </section>
        )}

        {/* Articles grid */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container">
            {rest.length > 0 ? (
              <AnimatedSection className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7 max-w-6xl mx-auto">
                {rest.map((article) => (
                  <motion.div key={article.slug} variants={fadeUp}>
                    <Link href={`/blog/${article.slug}`} className="block group h-full">
                      <div className="h-full bg-white rounded-xl border border-border/40 overflow-hidden hover:border-primary/20 hover:shadow-lg transition-all duration-300 flex flex-col">
                        <div className="aspect-[16/10] bg-gradient-to-br from-primary/5 via-blue-50/30 to-primary/3 flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(232,86,74,0.06),transparent_70%)]" />
                          <span className="text-5xl relative z-10 group-hover:scale-110 transition-transform duration-500">{article.emoji}</span>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${categoryColors[article.category] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                              {article.category}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-foreground/40">
                              <Clock className="w-3 h-3" />
                              {article.readTime}
                            </span>
                          </div>
                          <h3 className="font-heading font-bold text-navy text-[15px] mb-2.5 group-hover:text-primary transition-colors leading-snug">
                            {article.title}
                          </h3>
                          <p className="text-xs text-foreground/50 mb-4 line-clamp-2 leading-relaxed flex-1">{article.excerpt}</p>
                          <div className="flex items-center justify-between pt-3 border-t border-border/30">
                            <div className="flex items-center gap-1.5 text-xs text-foreground/40">
                              <User className="w-3 h-3" />
                              {article.author}
                            </div>
                            <span className="text-xs text-foreground/30">{article.date}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatedSection>
            ) : (
              <div className="text-center py-16">
                <p className="text-foreground/40 text-lg">Aucun article dans cette catégorie pour le moment.</p>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 bg-ice">
          <div className="container">
            <AnimatedSection className="max-w-2xl mx-auto text-center">
              <motion.div variants={fadeUp} className="bg-navy rounded-2xl p-8 lg:p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(232,86,74,0.15),transparent_60%)]" />
                <div className="relative z-10">
                  <h3 className="font-heading text-2xl lg:text-3xl font-bold text-white mb-4">
                    Recevez nos meilleurs conseils chaque semaine
                  </h3>
                  <p className="text-white/50 mb-8 max-w-lg mx-auto leading-relaxed">
                    Rejoignez plus de 2 800 professionnels du social media qui reçoivent nos stratégies, analyses et astuces directement dans leur boîte mail.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                      type="email"
                      placeholder="votre@email.com"
                      className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 text-sm"
                    />
                    <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-xl shadow-primary/30 transition-all text-sm whitespace-nowrap">
                      S'abonner
                    </button>
                  </div>
                  <p className="text-xs text-white/25 mt-4">
                    Pas de spam. Désabonnement en un clic. Nous respectons votre vie privée.
                  </p>
                </div>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
