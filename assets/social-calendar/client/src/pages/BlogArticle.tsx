/*
 * Design: Warm SaaS — Blog article page (enhanced)
 * SEO: Individual article pages with rich content, TOC, author, tags
 */
import { useEffect, useRef, useMemo } from "react";
import { Link, useParams, useLocation } from "wouter";
import { motion, useInView } from "framer-motion";
import { ArrowLeft, Clock, ArrowRight, CheckCircle2, User, Tag, Share2, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Streamdown } from "streamdown";
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

const categoryColors: Record<string, string> = {
  Guide: "bg-blue-50 text-blue-700 border-blue-200",
  Stratégie: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Conseils: "bg-amber-50 text-amber-700 border-amber-200",
  Instagram: "bg-pink-50 text-pink-700 border-pink-200",
  TikTok: "bg-violet-50 text-violet-700 border-violet-200",
  LinkedIn: "bg-sky-50 text-sky-700 border-sky-200",
  Agence: "bg-orange-50 text-orange-700 border-orange-200",
};

function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/\*\*/g, "").trim();
      const id = text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      headings.push({ id, text, level });
    }
  }
  return headings;
}

export default function BlogArticle() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const article = blogArticles.find((a) => a.slug === params.slug);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (article) {
      document.title = `${article.title} — Blog Social Calendar`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", article.excerpt);
    } else {
      setLocation("/blog");
    }
  }, [article, setLocation]);

  const headings = useMemo(() => {
    if (!article) return [];
    return extractHeadings(article.content);
  }, [article]);

  if (!article) {
    return null;
  }

  const currentIndex = blogArticles.findIndex((a) => a.slug === article.slug);
  const relatedArticles = blogArticles
    .filter((a, i) => i !== currentIndex)
    .sort((a, b) => {
      const aMatch = a.tags.filter((t) => article.tags.includes(t)).length;
      const bMatch = b.tags.filter((t) => article.tags.includes(t)).length;
      return bMatch - aMatch;
    })
    .slice(0, 3);

  const prevArticle = currentIndex > 0 ? blogArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < blogArticles.length - 1 ? blogArticles[currentIndex + 1] : null;

  const wordCount = article.content.split(/\s+/).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        {/* Breadcrumb */}
        <section className="pt-6 bg-gradient-to-b from-ice to-ice">
          <div className="container">
            <nav className="flex items-center gap-2 text-sm text-foreground/40 max-w-4xl mx-auto">
              <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground/60 truncate max-w-[200px]">{article.category}</span>
            </nav>
          </div>
        </section>

        {/* Article header */}
        <section className="pt-8 pb-8 lg:pt-12 lg:pb-12 bg-gradient-to-b from-ice to-white">
          <div className="container">
            <AnimatedSection className="max-w-4xl mx-auto">
              <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${categoryColors[article.category] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                  {article.category}
                </span>
                <span className="flex items-center gap-1 text-sm text-foreground/40">
                  <Clock className="w-3.5 h-3.5" />
                  {article.readTime} de lecture
                </span>
                <span className="text-sm text-foreground/30">·</span>
                <span className="text-sm text-foreground/40">{wordCount.toLocaleString()} mots</span>
              </motion.div>
              <motion.h1 variants={fadeUp} className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-navy mb-6 leading-[1.15]">
                {article.title}
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-foreground/55 mb-8 leading-relaxed max-w-3xl">
                {article.excerpt}
              </motion.p>

              {/* Author & meta */}
              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-6 pb-8 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy">{article.author}</p>
                    <p className="text-xs text-foreground/40">{article.authorRole}</p>
                  </div>
                </div>
                <div className="text-sm text-foreground/40">
                  Publié le {article.date}
                </div>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>

        {/* Article content with sidebar TOC */}
        <section className="py-12 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto flex gap-12">
              {/* Table of contents - desktop sidebar */}
              {headings.length > 3 && (
                <aside className="hidden xl:block w-64 shrink-0 -ml-72 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
                  <div className="pr-6">
                    <p className="text-xs font-semibold text-foreground/30 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      Sommaire
                    </p>
                    <nav className="space-y-1.5">
                      {headings.filter(h => h.level === 2).map((heading) => (
                        <a
                          key={heading.id}
                          href={`#${heading.id}`}
                          className="block text-xs text-foreground/40 hover:text-primary transition-colors leading-relaxed py-0.5 border-l-2 border-transparent hover:border-primary pl-3"
                        >
                          {heading.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                </aside>
              )}

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <AnimatedSection>
                  <motion.div
                    variants={fadeUp}
                    className="prose prose-lg max-w-none
                      prose-headings:font-heading prose-headings:text-navy prose-headings:scroll-mt-24
                      prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-5 prose-h2:pb-3 prose-h2:border-b prose-h2:border-border/20
                      prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                      prose-p:text-foreground/70 prose-p:leading-[1.8] prose-p:mb-5
                      prose-li:text-foreground/70 prose-li:leading-[1.7]
                      prose-strong:text-navy prose-strong:font-semibold
                      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                      prose-blockquote:border-l-primary prose-blockquote:bg-ice prose-blockquote:rounded-r-lg prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:not-italic
                      prose-blockquote:text-navy/80
                      prose-table:border-collapse prose-table:w-full
                      prose-th:bg-navy prose-th:text-white prose-th:font-semibold prose-th:text-sm prose-th:px-4 prose-th:py-3 prose-th:text-left
                      prose-td:px-4 prose-td:py-3 prose-td:text-sm prose-td:border-b prose-td:border-border/30
                      prose-tr:even:bg-ice/50
                      prose-hr:border-border/20 prose-hr:my-10
                      prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal
                    "
                  >
                    <Streamdown>{article.content}</Streamdown>
                  </motion.div>
                </AnimatedSection>

                {/* Tags */}
                <div className="mt-12 pt-8 border-t border-border/30">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-foreground/30" />
                    {article.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-ice border border-border/40 text-xs text-foreground/50 hover:border-primary/30 hover:text-primary transition-colors cursor-default">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Prev/Next navigation */}
                <div className="mt-10 grid sm:grid-cols-2 gap-4">
                  {prevArticle ? (
                    <Link href={`/blog/${prevArticle.slug}`} className="group block p-5 rounded-xl border border-border/40 hover:border-primary/20 hover:shadow-md transition-all">
                      <p className="text-xs text-foreground/30 mb-1.5 flex items-center gap-1">
                        <ArrowLeft className="w-3 h-3" />
                        Article précédent
                      </p>
                      <p className="font-heading font-bold text-sm text-navy group-hover:text-primary transition-colors leading-snug">
                        {prevArticle.title}
                      </p>
                    </Link>
                  ) : <div />}
                  {nextArticle && (
                    <Link href={`/blog/${nextArticle.slug}`} className="group block p-5 rounded-xl border border-border/40 hover:border-primary/20 hover:shadow-md transition-all text-right">
                      <p className="text-xs text-foreground/30 mb-1.5 flex items-center gap-1 justify-end">
                        Article suivant
                        <ArrowRight className="w-3 h-3" />
                      </p>
                      <p className="font-heading font-bold text-sm text-navy group-hover:text-primary transition-colors leading-snug">
                        {nextArticle.title}
                      </p>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA in article */}
        <section className="py-12 bg-ice">
          <div className="container">
            <AnimatedSection className="max-w-3xl mx-auto">
              <motion.div variants={fadeUp} className="bg-navy rounded-2xl p-8 lg:p-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(232,86,74,0.15),transparent_60%)]" />
                <div className="relative z-10">
                  <h3 className="font-heading text-2xl lg:text-3xl font-bold text-white mb-4">
                    Prêt à optimiser votre stratégie social media ?
                  </h3>
                  <p className="text-white/50 mb-6 max-w-md mx-auto leading-relaxed">
                    Essayez Social Calendar gratuitement et commencez à planifier vos publications sur 9 réseaux sociaux dès aujourd'hui.
                  </p>
                  <Button className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 shadow-xl shadow-primary/30 text-base">
                    Commencer gratuitement
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <p className="text-xs text-white/30 mt-4 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Essai gratuit de 7 jours — Aucune carte de crédit requise
                  </p>
                </div>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>

        {/* Related articles */}
        <section className="py-16 bg-white">
          <div className="container">
            <AnimatedSection className="max-w-5xl mx-auto">
              <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
                <h2 className="font-heading text-2xl font-bold text-navy">
                  Articles recommandés
                </h2>
                <Link href="/blog" className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                  Voir tous les articles
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
              <div className="grid sm:grid-cols-3 gap-6">
                {relatedArticles.map((a) => (
                  <motion.div key={a.slug} variants={fadeUp}>
                    <Link href={`/blog/${a.slug}`} className="block group h-full">
                      <div className="h-full bg-white rounded-xl border border-border/40 overflow-hidden hover:border-primary/20 hover:shadow-lg transition-all duration-300 flex flex-col">
                        <div className="aspect-[16/10] bg-gradient-to-br from-primary/5 to-blue-50/30 flex items-center justify-center relative overflow-hidden">
                          <span className="text-4xl group-hover:scale-110 transition-transform duration-500">{a.emoji}</span>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <span className={`self-start inline-block px-2 py-0.5 rounded-full text-xs font-semibold border mb-2 ${categoryColors[a.category] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                            {a.category}
                          </span>
                          <h3 className="font-heading font-bold text-navy text-sm mb-2 group-hover:text-primary transition-colors leading-snug flex-1">
                            {a.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-foreground/40 pt-2 border-t border-border/20">
                            <span>{a.readTime}</span>
                            <span>·</span>
                            <span>{a.author}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
