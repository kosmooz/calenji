/*
 * Design: Notion/Tally style — Document-native minimalism
 * White bg, Inter font, black text, product screenshots in window frames
 * Lots of whitespace, subtle animations, no gradients
 */
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, type Transition } from "framer-motion";
import { Link } from "wouter";
import {
  Calendar, Clock, BarChart3, Eye, Users, Zap,
  ArrowRight, Check, Star, Grip, Send, Shield,
  Sparkles, Globe, Image, MessageSquare, Repeat
} from "lucide-react";

const IMAGES = {
  heroDashboard: "/images/notion-calendar-dashboard.webp",
  postComposer: "/images/notion-post-composer.webp",
  analytics: "/images/notion-analytics-view.webp",
  dragDrop: "/images/notion-drag-drop.webp",
  heroIllustration: "/images/notion-hero-illustration.webp",
};

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease }
  }),
};

const platforms = [
  { name: "Instagram", color: "#E4405F" },
  { name: "TikTok", color: "#000000" },
  { name: "LinkedIn", color: "#0A66C2" },
  { name: "X (Twitter)", color: "#000000" },
  { name: "Facebook", color: "#1877F2" },

];

const features = [
  { icon: Calendar, title: "Calendrier visuel", desc: "Vue mensuelle, hebdomadaire et quotidienne. Glissez-déposez vos publications." },
  { icon: Send, title: "Publication automatique", desc: "Programmez et publiez automatiquement sur 5 réseaux sociaux." },
  { icon: Eye, title: "Prévisualisation", desc: "Voyez exactement comment votre post apparaîtra avant de publier." },
  { icon: BarChart3, title: "Analyses détaillées", desc: "Suivez l'engagement, la portée et la croissance de vos comptes." },
  { icon: Users, title: "Collaboration", desc: "Travaillez en équipe avec des rôles, des commentaires et des validations." },
  { icon: Image, title: "Stories & Reels", desc: "Planifiez vos Stories, Reels et Shorts directement depuis le calendrier." },
  { icon: Sparkles, title: "IA intégrée", desc: "Générez des légendes, des hashtags et des idées de contenu avec l'IA." },
  { icon: Globe, title: "Multi-comptes", desc: "Gérez plusieurs marques et comptes depuis un seul tableau de bord." },
  { icon: Repeat, title: "Recyclage de contenu", desc: "Reprogrammez automatiquement vos meilleurs posts." },
  { icon: Shield, title: "Sécurisé", desc: "Connexion OAuth sécurisée. Vos données sont chiffrées et protégées." },
  { icon: MessageSquare, title: "Boîte de réception", desc: "Répondez aux commentaires et messages depuis une interface unifiée." },
  { icon: Grip, title: "Drag & Drop", desc: "Réorganisez votre planning en glissant-déposant les publications." },
];

const testimonials = [
  { name: "Marie Dupont", role: "Community Manager, Agence Pixel", text: "Calenji a transformé notre workflow. On gère 12 clients depuis un seul calendrier. Le gain de temps est énorme.", rating: 5 },
  { name: "Thomas Renard", role: "Créateur de contenu", text: "Enfin un outil simple et efficace. Pas besoin de Notion, pas besoin de 5 outils différents. Tout est là.", rating: 5 },
  { name: "Sophie Martin", role: "Directrice Marketing, StartupFlow", text: "La prévisualisation multi-plateforme est un game changer. On voit exactement le rendu avant de publier.", rating: 5 },
  { name: "Alexandre Petit", role: "Freelance Social Media", text: "J'ai testé Buffer, Hootsuite, Later... Calenji est de loin le plus intuitif. Le calendrier visuel est parfait.", rating: 5 },
  { name: "Camille Lefèvre", role: "Fondatrice, Studio Créatif", text: "L'interface est magnifique et l'outil est puissant. Mes clients adorent les rapports d'analyse.", rating: 5 },
  { name: "Léa Dubois", role: "Social Media Manager", text: "Le drag & drop pour réorganiser les posts, c'est exactement ce qu'il me manquait. Simple et efficace.", rating: 5 },
];

const steps = [
  { num: "1", title: "Connectez vos réseaux", desc: "Liez vos comptes Instagram, Facebook, TikTok, LinkedIn et X (Twitter) en quelques clics." },
  { num: "2", title: "Planifiez votre contenu", desc: "Créez vos publications, ajoutez vos visuels et programmez-les sur le calendrier." },
  { num: "3", title: "Publiez automatiquement", desc: "Calenji publie vos contenus au bon moment sur chaque plateforme." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="container">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-[13px] text-gray-500 mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              5 plateformes supportées
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.08] tracking-tight mb-6"
            >
              Planifiez. Publiez.{" "}
              <span className="text-gray-300">C'est tout.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-xl mx-auto mb-10"
            >
              Le calendrier social pour les créateurs et les équipes. Connectez vos réseaux, planifiez vos publications, publiez automatiquement.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Link
                href="/contact"
                className="bg-black text-white font-medium px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors text-[15px] flex items-center gap-2"
              >
                Commencer gratuitement <ArrowRight size={16} />
              </Link>
              <Link
                href="/fonctionnalites"
                className="text-gray-500 font-medium px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors text-[15px] border border-gray-200"
              >
                Voir les fonctionnalités
              </Link>
            </motion.div>

            <motion.p
              variants={fadeUp}
              custom={4}
              className="text-[13px] text-gray-400 mt-4"
            >
              Gratuit pour commencer. Aucune carte de crédit requise.
            </motion.p>
          </motion.div>

          {/* Product Screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease }}
            className="mt-16 md:mt-20 max-w-5xl mx-auto"
          >
            <div className="rounded-xl border border-gray-200 shadow-2xl shadow-gray-200/50 overflow-hidden bg-white">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                <span className="ml-3 text-[12px] text-gray-400">Calenji — Dashboard</span>
              </div>
              <img
                src={IMAGES.heroDashboard}
                alt="Calenji — Calendrier de planification des réseaux sociaux"
                className="w-full"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof - Platforms */}
      <section className="py-12 border-y border-gray-100">
        <div className="container">
          <p className="text-center text-[13px] text-gray-400 mb-6">Publiez sur toutes les plateformes</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {platforms.map((p) => (
              <span key={p.name} className="text-[14px] font-medium text-gray-300 hover:text-gray-500 transition-colors">
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 md:py-32">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
          >
            <p className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-3">Comment ça marche</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Simple comme 1, 2, 3.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center text-lg font-bold mx-auto mb-5">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-[15px] text-gray-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase 1 — Post Composer */}
      <section className="py-24 md:py-32 bg-[#F7F7F5]">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
            >
              <p className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-3">Éditeur de publication</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-5">
                Composez. Prévisualisez. Publiez.
              </h2>
              <p className="text-[16px] text-gray-500 leading-relaxed mb-6">
                Rédigez votre publication une seule fois et voyez instantanément comment elle apparaîtra sur chaque plateforme. Instagram, LinkedIn, Twitter — tout est prévisualisé en temps réel.
              </p>
              <ul className="space-y-3">
                {["Prévisualisation multi-plateforme en temps réel", "Éditeur de texte avec formatage et emojis", "Upload d'images et vidéos par glisser-déposer", "Suggestions de hashtags par l'IA"].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-gray-600">
                    <Check size={18} className="text-gray-900 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease }}
            >
              <div className="rounded-xl border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden bg-white">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                </div>
                <img src={IMAGES.postComposer} alt="Éditeur de publication Calenji" className="w-full" loading="lazy" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Showcase 2 — Drag & Drop */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease }}
              className="order-2 md:order-1"
            >
              <div className="rounded-xl border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden bg-white">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                </div>
                <img src={IMAGES.dragDrop} alt="Drag & Drop calendrier Calenji" className="w-full" loading="lazy" />
              </div>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="order-1 md:order-2"
            >
              <p className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-3">Calendrier visuel</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-5">
                Glissez. Déposez. Réorganisez.
              </h2>
              <p className="text-[16px] text-gray-500 leading-relaxed mb-6">
                Votre planning éditorial en un coup d'oeil. Déplacez vos publications d'un jour à l'autre par simple glisser-déposer. Voyez les statuts en temps réel : brouillon, programmé, publié.
              </p>
              <ul className="space-y-3">
                {["Vue mensuelle, hebdomadaire et quotidienne", "Drag & drop intuitif entre les jours", "Indicateurs de statut colorés", "Filtrage par plateforme et par compte"].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-gray-600">
                    <Check size={18} className="text-gray-900 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Showcase 3 — Analytics */}
      <section className="py-24 md:py-32 bg-[#F7F7F5]">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
            >
              <p className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-3">Analyses & rapports</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-5">
                Mesurez. Comprenez. Optimisez.
              </h2>
              <p className="text-[16px] text-gray-500 leading-relaxed mb-6">
                Suivez les performances de chaque publication et de chaque compte. Identifiez les meilleurs moments pour publier, les formats qui fonctionnent et les tendances de croissance.
              </p>
              <ul className="space-y-3">
                {["Tableau de bord analytique unifié", "Métriques par plateforme et par publication", "Rapports exportables en PDF", "Recommandations IA pour optimiser"].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-gray-600">
                    <Check size={18} className="text-gray-900 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease }}
            >
              <div className="rounded-xl border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden bg-white">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                </div>
                <img src={IMAGES.analytics} alt="Analyses et rapports Calenji" className="w-full" loading="lazy" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 md:py-32">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
          >
            <p className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-3">Fonctionnalités</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Tout ce dont vous avez besoin.
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Un seul outil pour remplacer Buffer, Hootsuite, Later et tous les autres.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i % 3}
                className="p-6 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <f.icon size={22} className="text-gray-900 mb-3" strokeWidth={1.8} />
                <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32 bg-[#F7F7F5]">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
          >
            <p className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-3">Témoignages</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Ils nous font confiance.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i % 3}
                className="bg-white rounded-xl p-6 border border-gray-100"
              >
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="fill-gray-900 text-gray-900" />
                  ))}
                </div>
                <p className="text-[15px] text-gray-600 leading-relaxed mb-5">"{t.text}"</p>
                <div>
                  <p className="text-[14px] font-semibold text-gray-900">{t.name}</p>
                  <p className="text-[13px] text-gray-400">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 md:py-32">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
          >
            <p className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-3">Prix</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Gratuit pour commencer.
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Pas de carte de crédit. Pas d'engagement. Passez au plan supérieur quand vous êtes prêt.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="rounded-xl border border-gray-200 p-7 bg-white"
            >
              <h3 className="text-[15px] font-semibold text-gray-900 mb-1">Gratuit</h3>
              <p className="text-[13px] text-gray-400 mb-5">Pour découvrir</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-gray-900">0€</span>
                <span className="text-[14px] text-gray-400 ml-1">/mois</span>
              </div>
              <ul className="space-y-2.5 mb-7">
                {["3 comptes sociaux", "30 publications/mois", "Calendrier visuel", "Prévisualisation"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[14px] text-gray-600">
                    <Check size={15} className="text-gray-400" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/contact" className="block text-center py-2.5 rounded-lg border border-gray-200 text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Commencer
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
              className="rounded-xl border-2 border-gray-900 p-7 bg-white relative"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[11px] font-medium px-3 py-1 rounded-full">
                Populaire
              </div>
              <h3 className="text-[15px] font-semibold text-gray-900 mb-1">Pro</h3>
              <p className="text-[13px] text-gray-400 mb-5">Pour les créateurs</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-gray-900">15€</span>
                <span className="text-[14px] text-gray-400 ml-1">/mois</span>
              </div>
              <ul className="space-y-2.5 mb-7">
                {["10 comptes sociaux", "Publications illimitées", "Analyses avancées", "IA intégrée", "Support prioritaire"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[14px] text-gray-600">
                    <Check size={15} className="text-gray-900" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/contact" className="block text-center py-2.5 rounded-lg bg-gray-900 text-white text-[14px] font-medium hover:bg-gray-800 transition-colors">
                Commencer
              </Link>
            </motion.div>

            {/* Agency */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={2}
              className="rounded-xl border border-gray-200 p-7 bg-white"
            >
              <h3 className="text-[15px] font-semibold text-gray-900 mb-1">Agence</h3>
              <p className="text-[13px] text-gray-400 mb-5">Pour les équipes</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-gray-900">49€</span>
                <span className="text-[14px] text-gray-400 ml-1">/mois</span>
              </div>
              <ul className="space-y-2.5 mb-7">
                {["Comptes illimités", "Publications illimitées", "Collaboration d'équipe", "Rapports clients", "API & webhooks", "Support dédié"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[14px] text-gray-600">
                    <Check size={15} className="text-gray-400" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/contact" className="block text-center py-2.5 rounded-lg border border-gray-200 text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Contacter les ventes
              </Link>
            </motion.div>
          </div>

          <div className="text-center mt-8">
            <Link href="/prix" className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors underline underline-offset-4">
              Voir tous les détails des plans
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 bg-gray-900">
        <div className="container">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-5">
              Prêt à simplifier vos réseaux sociaux ?
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              Rejoignez des milliers de créateurs et d'équipes qui utilisent Calenji pour gagner du temps et publier mieux.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-gray-900 font-medium px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-[15px]"
            >
              Commencer gratuitement <ArrowRight size={16} />
            </Link>
            <p className="text-[13px] text-gray-500 mt-4">
              Gratuit pour toujours. Aucune carte de crédit requise.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
