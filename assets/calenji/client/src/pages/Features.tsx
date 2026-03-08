/*
 * Design: Notion/Tally style — minimal, clean, black text, white bg
 * Product screenshots in macOS window frames
 */
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Calendar, Send, Eye, BarChart3, Users, Image,
  Sparkles, Globe, Repeat, Shield, MessageSquare,
  Grip, Clock, Zap, ArrowRight, Check
} from "lucide-react";

const IMAGES = {
  dashboard: "/images/notion-calendar-dashboard.webp",
  composer: "/images/notion-post-composer.webp",
  analytics: "/images/notion-analytics-view.webp",
  dragDrop: "/images/notion-drag-drop.webp",
};

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease }
  }),
};

const WindowFrame = ({ children, title }: { children: React.ReactNode; title?: string }) => (
  <div className="rounded-xl border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden bg-white">
    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
      <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
      <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
      <div className="w-3 h-3 rounded-full bg-[#28C840]" />
      {title && <span className="ml-3 text-[12px] text-gray-400">{title}</span>}
    </div>
    {children}
  </div>
);

const allFeatures = [
  { icon: Calendar, title: "Calendrier visuel", desc: "Vue mensuelle, hebdomadaire et quotidienne avec code couleur par plateforme." },
  { icon: Send, title: "Publication automatique", desc: "Programmez et publiez automatiquement sur 5 réseaux sociaux." },
  { icon: Eye, title: "Prévisualisation", desc: "Voyez le rendu exact de votre post sur chaque plateforme." },
  { icon: BarChart3, title: "Analyses détaillées", desc: "Métriques d'engagement, portée, impressions et croissance." },
  { icon: Users, title: "Collaboration d'équipe", desc: "Rôles, commentaires et flux de validation pour les équipes." },
  { icon: Image, title: "Stories & Reels", desc: "Planifiez Stories, Reels et Shorts depuis le calendrier." },
  { icon: Sparkles, title: "IA intégrée", desc: "Légendes, hashtags et idées de contenu générés par l'IA." },
  { icon: Globe, title: "Multi-comptes", desc: "Gérez plusieurs marques depuis un seul tableau de bord." },
  { icon: Repeat, title: "Recyclage de contenu", desc: "Reprogrammez automatiquement vos meilleurs posts." },
  { icon: Shield, title: "Sécurité", desc: "OAuth, chiffrement et conformité RGPD." },
  { icon: MessageSquare, title: "Boîte de réception", desc: "Répondez aux commentaires depuis une interface unifiée." },
  { icon: Grip, title: "Drag & Drop", desc: "Réorganisez votre planning par glisser-déposer." },
  { icon: Clock, title: "Meilleurs horaires", desc: "L'IA recommande les meilleurs moments pour publier." },
  { icon: Zap, title: "Automatisations", desc: "Cross-posting, republication et notifications automatiques." },
];

const platforms = [
  { name: "Instagram", desc: "Posts, Stories, Reels, Carousels" },
  { name: "TikTok", desc: "Vidéos, programmation directe" },
  { name: "LinkedIn", desc: "Posts, articles, pages entreprise" },
  { name: "X (Twitter)", desc: "Tweets, threads, médias" },
  { name: "Facebook", desc: "Posts, Stories, Reels, pages" },

];

export default function Features() {
  useEffect(() => {
    document.title = "Fonctionnalités — Calenji | Planification Réseaux Sociaux";
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="container">
          <motion.div className="max-w-3xl mx-auto text-center" initial="hidden" animate="visible" variants={fadeUp}>
            <motion.p variants={fadeUp} custom={0} className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-3">
              Fonctionnalités
            </motion.p>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
              Tout ce dont vous avez besoin pour vos réseaux sociaux.
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-xl mx-auto">
              Un seul outil pour planifier, publier, analyser et collaborer sur tous vos réseaux sociaux.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Feature 1 — Calendar */}
      <section className="py-24 md:py-32 bg-[#F7F7F5]">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
              <p className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-3">Calendrier visuel</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-5">
                Votre planning éditorial, visuellement.
              </h2>
              <p className="text-[16px] text-gray-500 leading-relaxed mb-6">
                Fini les tableurs et les post-its. Visualisez l'ensemble de votre stratégie de contenu sur un calendrier intuitif. Chaque plateforme a sa couleur, chaque publication son statut.
              </p>
              <ul className="space-y-3">
                {["Vue mensuelle, hebdomadaire et quotidienne", "Code couleur par plateforme et par statut", "Drag & drop pour réorganiser les publications", "Filtres par compte, plateforme et type de contenu", "Vue d'ensemble multi-comptes pour les agences"].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-gray-600">
                    <Check size={18} className="text-gray-900 mt-0.5 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease }}>
              <WindowFrame title="Calendrier">
                <img src={IMAGES.dashboard} alt="Calendrier visuel Calenji" className="w-full" loading="lazy" />
              </WindowFrame>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature 2 — Composer */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease }} className="order-2 md:order-1">
              <WindowFrame title="Éditeur">
                <img src={IMAGES.composer} alt="Éditeur de publication Calenji" className="w-full" loading="lazy" />
              </WindowFrame>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="order-1 md:order-2">
              <p className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-3">Éditeur de publication</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-5">
                Composez une fois, publiez partout.
              </h2>
              <p className="text-[16px] text-gray-500 leading-relaxed mb-6">
                Rédigez votre publication et adaptez-la pour chaque plateforme. Prévisualisez le rendu exact sur Instagram, LinkedIn, Twitter et tous les autres réseaux.
              </p>
              <ul className="space-y-3">
                {["Prévisualisation multi-plateforme en temps réel", "Adaptation automatique du format par réseau", "Upload d'images et vidéos par glisser-déposer", "Suggestions de hashtags et légendes par l'IA", "Programmation avec choix du fuseau horaire"].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-gray-600">
                    <Check size={18} className="text-gray-900 mt-0.5 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature 3 — Analytics */}
      <section className="py-24 md:py-32 bg-[#F7F7F5]">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
              <p className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-3">Analyses & rapports</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-5">
                Des données, pas des suppositions.
              </h2>
              <p className="text-[16px] text-gray-500 leading-relaxed mb-6">
                Comprenez ce qui fonctionne et ce qui ne fonctionne pas. Suivez l'engagement, la portée, les impressions et la croissance de chaque compte et chaque publication.
              </p>
              <ul className="space-y-3">
                {["Tableau de bord analytique unifié multi-comptes", "Métriques détaillées par publication et par plateforme", "Identification des meilleurs horaires de publication", "Rapports exportables en PDF pour vos clients", "Recommandations IA pour améliorer vos performances"].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-gray-600">
                    <Check size={18} className="text-gray-900 mt-0.5 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease }}>
              <WindowFrame title="Analyses">
                <img src={IMAGES.analytics} alt="Analyses Calenji" className="w-full" loading="lazy" />
              </WindowFrame>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature 4 — Drag & Drop */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease }} className="order-2 md:order-1">
              <WindowFrame title="Drag & Drop">
                <img src={IMAGES.dragDrop} alt="Drag and drop Calenji" className="w-full" loading="lazy" />
              </WindowFrame>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="order-1 md:order-2">
              <p className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-3">Drag & Drop</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-5">
                Réorganisez en un geste.
              </h2>
              <p className="text-[16px] text-gray-500 leading-relaxed mb-6">
                Besoin de décaler une publication ? Glissez-la simplement vers un autre jour ou un autre créneau. Pas de formulaire, pas de clic supplémentaire.
              </p>
              <ul className="space-y-3">
                {["Glisser-déposer intuitif entre les jours", "Réorganisation instantanée du planning", "Indicateurs de statut visuels", "Annulation et rétablissement des modifications"].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-gray-600">
                    <Check size={18} className="text-gray-900 mt-0.5 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* All Features Grid */}
      <section className="py-24 md:py-32 bg-[#F7F7F5]">
        <div className="container">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">Et bien plus encore.</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">Chaque fonctionnalité a été pensée pour vous faire gagner du temps.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1 max-w-5xl mx-auto">
            {allFeatures.map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} custom={i % 3} className="p-6 rounded-xl hover:bg-white transition-colors">
                <f.icon size={22} className="text-gray-900 mb-3" strokeWidth={1.8} />
                <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-24 md:py-32">
        <div className="container">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
            <p className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-3">Plateformes</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">5 plateformes. Un seul outil.</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {platforms.map((p, i) => (
              <motion.div key={p.name} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} custom={i % 3} className="p-5 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <h3 className="text-[15px] font-semibold text-gray-900 mb-1">{p.name}</h3>
                <p className="text-[13px] text-gray-400">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 bg-gray-900">
        <div className="container">
          <motion.div className="max-w-2xl mx-auto text-center" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-5">Prêt à essayer ?</h2>
            <p className="text-lg text-gray-400 mb-8">Commencez gratuitement et découvrez comment Calenji peut transformer votre gestion des réseaux sociaux.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-gray-900 font-medium px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-[15px]">
              Commencer gratuitement <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
