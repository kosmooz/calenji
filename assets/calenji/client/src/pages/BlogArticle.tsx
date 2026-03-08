/*
 * Design: Notion/Tally style — minimal blog article page
 */
import { useEffect, useMemo } from "react";
import { Link, useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, ArrowRight, User, Tag, BookOpen, ChevronRight } from "lucide-react";
import { Streamdown } from "streamdown";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogArticles } from "@/lib/blogData";

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease }
  }),
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
      document.title = `${article.title} — Blog Calenji`;
    } else {
      setLocation("/blog");
    }
  }, [article, setLocation]);

  const headings = useMemo(() => {
    if (!article) return [];
    return extractHeadings(article.content);
  }, [article]);

  if (!article) return null;

  const currentIndex = blogArticles.findIndex((a) => a.slug === article.slug);
  const relatedArticles = blogArticles
    .filter((_, i) => i !== currentIndex)
    .sort((a, b) => {
      const aMatch = a.tags.filter((t) => article.tags.includes(t)).length;
      const bMatch = b.tags.filter((t) => article.tags.includes(t)).length;
      return bMatch - aMatch;
    })
    .slice(0, 3);

  const prevArticle = currentIndex > 0 ? blogArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < blogArticles.length - 1 ? blogArticles[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Breadcrumb */}
      <section className="pt-6">
        <div className="container">
          <nav className="flex items-center gap-2 text-[13px] text-gray-400 max-w-3xl mx-auto">
            <Link href="/" className="hover:text-gray-900 transition-colors">Accueil</Link>
            <ChevronRight size={12} />
            <Link href="/blog" className="hover:text-gray-900 transition-colors">Blog</Link>
            <ChevronRight size={12} />
            <span className="text-gray-500 truncate max-w-[200px]">{article.category}</span>
          </nav>
        </div>
      </section>

      {/* Article header */}
      <section className="pt-8 pb-10 md:pt-12 md:pb-14">
        <div className="container">
          <motion.div className="max-w-3xl mx-auto" initial="hidden" animate="visible" variants={fadeUp}>
            <motion.div variants={fadeUp} custom={0} className="flex items-center gap-3 mb-5">
              <span className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">{article.category}</span>
              <span className="text-gray-200">·</span>
              <span className="flex items-center gap-1 text-[13px] text-gray-400">
                <Clock size={13} /> {article.readTime}
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-3xl md:text-[2.75rem] font-extrabold text-gray-900 tracking-tight mb-6 leading-[1.15]">
              {article.title}
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-gray-500 mb-8 leading-relaxed">
              {article.excerpt}
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex items-center gap-6 pb-8 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                  <User size={16} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-gray-900">{article.author}</p>
                  <p className="text-[12px] text-gray-400">{article.authorRole}</p>
                </div>
              </div>
              <span className="text-[13px] text-gray-400">{article.date}</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Article content with sidebar TOC */}
      <section className="pb-16">
        <div className="container">
          <div className="max-w-3xl mx-auto flex gap-12">
            {/* TOC sidebar */}
            {headings.length > 3 && (
              <aside className="hidden xl:block w-56 shrink-0 -ml-64 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <BookOpen size={12} /> Sommaire
                </p>
                <nav className="space-y-1">
                  {headings.filter(h => h.level === 2).map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className="block text-[12px] text-gray-400 hover:text-gray-900 transition-colors leading-relaxed py-0.5 border-l-2 border-transparent hover:border-gray-900 pl-3"
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>
              </aside>
            )}

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={4}
                className="prose prose-lg max-w-none
                  prose-headings:text-gray-900 prose-headings:tracking-tight prose-headings:scroll-mt-24
                  prose-h2:text-2xl prose-h2:font-extrabold prose-h2:mt-12 prose-h2:mb-5 prose-h2:pb-3 prose-h2:border-b prose-h2:border-gray-100
                  prose-h3:text-xl prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-gray-500 prose-p:leading-[1.8] prose-p:mb-5
                  prose-li:text-gray-500 prose-li:leading-[1.7]
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-a:text-gray-900 prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-gray-600
                  prose-blockquote:border-l-gray-900 prose-blockquote:bg-[#F7F7F5] prose-blockquote:rounded-r-lg prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:text-gray-600
                  prose-table:border-collapse prose-table:w-full
                  prose-th:bg-gray-900 prose-th:text-white prose-th:font-medium prose-th:text-[13px] prose-th:px-4 prose-th:py-3 prose-th:text-left
                  prose-td:px-4 prose-td:py-3 prose-td:text-[13px] prose-td:border-b prose-td:border-gray-100
                  prose-tr:even:bg-[#F7F7F5]/50
                  prose-hr:border-gray-100 prose-hr:my-10
                  prose-code:text-gray-900 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal
                "
              >
                <Streamdown>{article.content}</Streamdown>
              </motion.div>

              {/* Tags */}
              <div className="mt-12 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={14} className="text-gray-300" />
                  {article.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-[#F7F7F5] text-[12px] text-gray-500">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Prev/Next */}
              <div className="mt-10 grid sm:grid-cols-2 gap-4">
                {prevArticle ? (
                  <Link href={`/blog/${prevArticle.slug}`} className="group block p-5 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                    <p className="text-[12px] text-gray-400 mb-1.5 flex items-center gap-1">
                      <ArrowLeft size={12} /> Article précédent
                    </p>
                    <p className="text-[14px] font-semibold text-gray-900 group-hover:text-gray-600 transition-colors leading-snug">
                      {prevArticle.title}
                    </p>
                  </Link>
                ) : <div />}
                {nextArticle && (
                  <Link href={`/blog/${nextArticle.slug}`} className="group block p-5 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors text-right">
                    <p className="text-[12px] text-gray-400 mb-1.5 flex items-center gap-1 justify-end">
                      Article suivant <ArrowRight size={12} />
                    </p>
                    <p className="text-[14px] font-semibold text-gray-900 group-hover:text-gray-600 transition-colors leading-snug">
                      {nextArticle.title}
                    </p>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900">
        <div className="container">
          <motion.div className="max-w-2xl mx-auto text-center" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-4">
              Prêt à optimiser votre stratégie ?
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Essayez Calenji gratuitement et planifiez vos publications sur 5 réseaux sociaux.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-gray-900 font-medium px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-[15px]">
              Commencer gratuitement <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Related articles */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Articles recommandés</h2>
              <Link href="/blog" className="text-[13px] text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1">
                Voir tous <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {relatedArticles.map((a) => (
                <Link key={a.slug} href={`/blog/${a.slug}`} className="block group">
                  <div className="rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-colors">
                    <div className="aspect-[16/10] bg-[#F7F7F5] flex items-center justify-center">
                      <span className="text-4xl group-hover:scale-110 transition-transform duration-500">{a.emoji}</span>
                    </div>
                    <div className="p-4">
                      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{a.category}</span>
                      <h3 className="text-[14px] font-semibold text-gray-900 mt-1 group-hover:text-gray-600 transition-colors leading-snug">
                        {a.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[12px] text-gray-400 mt-2">
                        <span>{a.readTime}</span>
                        <span>·</span>
                        <span>{a.author}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
