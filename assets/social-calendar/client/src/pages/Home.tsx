/*
 * Design: Warm SaaS — Outfit headings, Plus Jakarta Sans body
 * Colors: Coral primary, Navy text, white/ice backgrounds
 * Animations: Framer Motion stagger, fade-in, spring transitions
 * SEO: Rich content, semantic HTML, structured headings
 */
import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import {
  Calendar, Zap, BarChart3, Users, Eye, GripVertical,
  CheckCircle2, Star, ArrowRight, Clock, Shield, Sparkles
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CDN = "/images";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const platforms = [
  { name: "Instagram", color: "#E4405F" },
  { name: "TikTok", color: "#000000" },
  { name: "X (Twitter)", color: "#1DA1F2" },
  { name: "LinkedIn", color: "#0A66C2" },
  { name: "Facebook", color: "#1877F2" },
  { name: "YouTube", color: "#FF0000" },
  { name: "Pinterest", color: "#E60023" },
  { name: "Threads", color: "#000000" },
  { name: "Bluesky", color: "#0085FF" },
];

const features = [
  {
    icon: Calendar,
    title: "Calendrier Visuel Intuitif",
    description: "Organisez tout votre contenu avec une vue d'ensemble claire. Glissez-déposez vos publications pour ajuster votre planning en quelques secondes.",
  },
  {
    icon: Zap,
    title: "Publication Multi-Plateformes",
    description: "Programmez vos posts, stories et reels sur Instagram, TikTok, Facebook, X, LinkedIn, Pinterest, YouTube, Threads et Bluesky en un clic.",
  },
  {
    icon: Eye,
    title: "Prévisualisation en Direct",
    description: "Visualisez exactement à quoi ressembleront vos publications sur chaque plateforme avant de les mettre en ligne.",
  },
  {
    icon: BarChart3,
    title: "Analyses et Rapports",
    description: "Suivez vos performances en un coup d'œil. Identifiez ce qui fonctionne, optimisez votre stratégie et maximisez votre engagement.",
  },
  {
    icon: Users,
    title: "Collaboration d'Équipe",
    description: "Invitez vos collaborateurs, assignez des rôles et validez le contenu en équipe pour un flux de travail harmonieux.",
  },
  {
    icon: Shield,
    title: "Sécurité et Fiabilité",
    description: "Vos données sont protégées avec un chiffrement de bout en bout. Publication garantie à 99.9% de disponibilité.",
  },
];

const testimonials = [
  {
    name: "Léa Dubois",
    role: "Social Media Manager @ Creative Agency",
    text: "Social Calendar a transformé notre façon de travailler. Nous avons économisé plus de 10 heures par semaine et notre engagement a augmenté de 40% en seulement deux mois. Un outil indispensable !",
    rating: 5,
  },
  {
    name: "Marc Antoine",
    role: "Créateur de contenu",
    text: "Enfin un outil qui comprend les besoins des créateurs ! L'interface est superbe et la planification par glisser-déposer est un pur bonheur. Je ne pourrais plus m'en passer.",
    rating: 5,
  },
  {
    name: "Sophie Martin",
    role: "Directrice Marketing @ TechStartup",
    text: "Nous gérions 12 comptes sociaux avec 3 outils différents. Depuis que nous utilisons Social Calendar, tout est centralisé et notre productivité a doublé. Le meilleur investissement de l'année.",
    rating: 5,
  },
  {
    name: "Thomas Renard",
    role: "Fondateur @ Digital Agency",
    text: "Le workflow de validation est exactement ce qu'il nous fallait. Nos clients peuvent approuver le contenu directement dans l'outil. Plus de mails interminables !",
    rating: 5,
  },
  {
    name: "Camille Lefèvre",
    role: "Community Manager",
    text: "J'ai testé Buffer, Hootsuite, Later... Social Calendar les surpasse tous. L'interface est intuitive, les analyses sont pertinentes et le support est réactif. 5 étoiles sans hésiter.",
    rating: 5,
  },
  {
    name: "Alexandre Petit",
    role: "CEO @ E-commerce Brand",
    text: "La fonctionnalité de meilleurs moments pour publier a augmenté notre portée de 65%. C'est comme avoir un expert en réseaux sociaux intégré dans l'outil.",
    rating: 5,
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Connectez vos réseaux",
    description: "Liez vos comptes Instagram, TikTok, X, LinkedIn, Facebook, YouTube, Pinterest, Threads et Bluesky en quelques clics. Configuration en moins de 2 minutes.",
  },
  {
    step: "02",
    title: "Créez et planifiez",
    description: "Rédigez vos publications, ajoutez vos médias et programmez-les sur le calendrier visuel. Glissez-déposez pour ajuster les dates facilement.",
  },
  {
    step: "03",
    title: "Publiez et analysez",
    description: "Social Calendar publie automatiquement au moment optimal. Suivez vos performances et optimisez votre stratégie grâce aux analyses détaillées.",
  },
];

export default function Home() {
  useEffect(() => {
    document.title = "Social Calendar — Planifiez et Publiez sur tous vos Réseaux Sociaux";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main>
        {/* ============ HERO SECTION ============ */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-ice to-white pt-16 pb-20 lg:pt-24 lg:pb-32">
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />

          <div className="container relative">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Copy */}
              <AnimatedSection>
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral-light border border-primary/10 mb-6">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Nouveau : Support Bluesky et Threads</span>
                </motion.div>

                <motion.h1 variants={fadeUp} className="font-heading text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight text-navy mb-6">
                  Planifiez, Programmez,{" "}
                  <span className="text-primary">Publiez.</span>
                  <br />
                  Le tout au même endroit.
                </motion.h1>

                <motion.p variants={fadeUp} className="text-lg text-foreground/60 leading-relaxed mb-8 max-w-xl">
                  Le calendrier social ultime pour les créateurs de contenu, les marques et les agences. Connectez vos réseaux sociaux et gérez toutes vos publications depuis un seul calendrier intuitif.
                </motion.p>

                <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 h-12 text-base shadow-xl shadow-primary/25">
                    Commencer gratuitement
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-border/60 text-foreground/70 font-medium px-8 h-12 text-base hover:bg-muted">
                    Voir la démo
                  </Button>
                </motion.div>

                <motion.p variants={fadeUp} className="text-sm text-foreground/40 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Essai gratuit de 7 jours &mdash; Aucune carte de crédit requise
                </motion.p>
              </AnimatedSection>

              {/* Right: Hero Image */}
              <AnimatedSection>
                <motion.div variants={fadeUp} className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-blue-100/30 to-primary/5 rounded-2xl blur-2xl" />
                  <img
                    src={`${CDN}/hero-social-icons_67332849.png`}
                    alt="Social Calendar - Calendrier de planification des réseaux sociaux avec icônes Instagram, TikTok, X, LinkedIn, Facebook, YouTube, Pinterest, Threads et Bluesky"
                    className="relative rounded-2xl w-full max-w-lg mx-auto"
                    loading="eager"
                  />
                </motion.div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ============ SOCIAL PROOF BAR ============ */}
        <section className="py-10 border-y border-border/40 bg-white">
          <div className="container">
            <AnimatedSection className="text-center">
              <motion.p variants={fadeUp} className="text-sm font-medium text-foreground/40 uppercase tracking-wider mb-6">
                Publiez sur toutes les plateformes qui comptent
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-6 md:gap-10">
                {platforms.map((p) => (
                  <span key={p.name} className="text-sm font-semibold text-foreground/50 hover:text-foreground/80 transition-colors">
                    {p.name}
                  </span>
                ))}
              </motion.div>
            </AnimatedSection>
          </div>
        </section>

        {/* ============ PROBLEM SECTION ============ */}
        <section className="py-20 lg:py-28 bg-white">
          <div className="container">
            <AnimatedSection className="max-w-3xl mx-auto text-center mb-16">
              <motion.h2 variants={fadeUp} className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-6">
                Fatigué de jongler entre{" "}
                <span className="text-primary">plusieurs outils</span> ?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-foreground/60 leading-relaxed">
                Créer le contenu dans un outil, le programmer dans un autre, suivre les statistiques dans un troisième... Cette perte de temps et d'énergie vous empêche de vous concentrer sur ce qui compte vraiment : créer du contenu exceptionnel et interagir avec votre communauté.
              </motion.p>
            </AnimatedSection>

            <AnimatedSection className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Clock, value: "10h+", label: "perdues chaque semaine", desc: "à copier-coller entre les outils" },
                { icon: Zap, value: "3-5", label: "outils différents", desc: "pour gérer vos réseaux sociaux" },
                { icon: BarChart3, value: "40%", label: "d'engagement perdu", desc: "en publiant au mauvais moment" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="text-center p-8 rounded-2xl bg-ice border border-border/40 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                  <p className="font-heading text-4xl font-extrabold text-navy mb-1">{stat.value}</p>
                  <p className="font-semibold text-foreground/80 mb-1">{stat.label}</p>
                  <p className="text-sm text-foreground/50">{stat.desc}</p>
                </motion.div>
              ))}
            </AnimatedSection>
          </div>
        </section>

        {/* ============ DASHBOARD SHOWCASE ============ */}
        <section className="py-20 lg:py-28 bg-ice">
          <div className="container">
            <AnimatedSection className="text-center mb-14">
              <motion.h2 variants={fadeUp} className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-6">
                Votre centre de commande{" "}
                <span className="text-primary">unifié</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-foreground/60 max-w-2xl mx-auto">
                Social Calendar centralise l'ensemble de votre stratégie de contenu. Un seul calendrier pour tous vos réseaux, toutes vos publications, toutes vos analyses.
              </motion.p>
            </AnimatedSection>

            <AnimatedSection>
              <motion.div variants={fadeUp} className="relative max-w-5xl mx-auto">
                <div className="absolute -inset-6 bg-gradient-to-r from-primary/10 via-transparent to-blue-200/20 rounded-3xl blur-2xl" />
                <img
                  src={`${CDN}/hero-dashboard_5f7f6273.png`}
                  alt="Tableau de bord Social Calendar - Vue calendrier mensuel avec publications programmées sur Instagram, TikTok, LinkedIn, Facebook, YouTube et X"
                  className="relative rounded-2xl shadow-2xl shadow-navy/10 border border-border/40 w-full"
                  loading="lazy"
                />
              </motion.div>
            </AnimatedSection>

            {/* Badges */}
            <AnimatedSection className="flex flex-wrap justify-center gap-4 mt-10">
              {["Travaillez plus vite", "2x votre productivité", "Économisez 10h+ par mois"].map((badge) => (
                <motion.div
                  key={badge}
                  variants={fadeUp}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-border/40 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-navy">{badge}</span>
                </motion.div>
              ))}
            </AnimatedSection>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section className="py-20 lg:py-28 bg-white">
          <div className="container">
            <AnimatedSection className="text-center mb-16">
              <motion.h2 variants={fadeUp} className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-6">
                Comment ça marche ?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-foreground/60 max-w-2xl mx-auto">
                Commencez à publier en moins de 5 minutes. C'est aussi simple que 1, 2, 3.
              </motion.p>
            </AnimatedSection>

            <AnimatedSection className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {howItWorks.map((item, i) => (
                <motion.div key={i} variants={fadeUp} className="relative">
                  {i < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-primary/30 to-transparent -translate-x-8 z-0" />
                  )}
                  <div className="relative bg-white rounded-2xl p-8 border border-border/40 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                    <span className="font-heading text-5xl font-extrabold text-primary/15 mb-4 block">{item.step}</span>
                    <h3 className="font-heading text-xl font-bold text-navy mb-3">{item.title}</h3>
                    <p className="text-foreground/60 leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatedSection>
          </div>
        </section>

        {/* ============ FEATURES GRID ============ */}
        <section className="py-20 lg:py-28 bg-ice" id="fonctionnalites">
          <div className="container">
            <AnimatedSection className="text-center mb-16">
              <motion.h2 variants={fadeUp} className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-6">
                Des fonctionnalités conçues pour{" "}
                <span className="text-primary">la performance</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-foreground/60 max-w-2xl mx-auto">
                Tout ce dont vous avez besoin pour gérer vos réseaux sociaux comme un pro, sans la complexité des outils traditionnels.
              </motion.p>
            </AnimatedSection>

            <AnimatedSection className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="bg-white rounded-2xl p-7 border border-border/40 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-coral-light flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-navy mb-2">{feature.title}</h3>
                  <p className="text-foreground/60 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </AnimatedSection>

            <AnimatedSection className="text-center mt-10">
              <motion.div variants={fadeUp}>
                <Button asChild variant="outline" className="border-primary/30 text-primary hover:bg-coral-light font-semibold px-8">
                  <Link href="/fonctionnalites">
                    Découvrir toutes les fonctionnalités
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>

        {/* ============ FEATURE SHOWCASE: DRAG & DROP ============ */}
        <section className="py-20 lg:py-28 bg-white">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <AnimatedSection>
                <motion.div variants={fadeUp} className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 to-blue-100/20 rounded-2xl blur-xl" />
                  <img
                    src={`${CDN}/feature-drag-drop_e7e989c8.png`}
                    alt="Fonctionnalité glisser-déposer du calendrier Social Calendar pour réorganiser les publications"
                    className="relative rounded-2xl shadow-xl border border-border/40 w-full"
                    loading="lazy"
                  />
                </motion.div>
              </AnimatedSection>

              <AnimatedSection>
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-coral-light text-primary text-xs font-semibold mb-4">
                  <GripVertical className="w-3.5 h-3.5" />
                  Glisser-Déposer
                </motion.div>
                <motion.h2 variants={fadeUp} className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-6">
                  Réorganisez votre planning{" "}
                  <span className="text-primary">en un geste</span>
                </motion.h2>
                <motion.p variants={fadeUp} className="text-lg text-foreground/60 leading-relaxed mb-6">
                  Un événement est reporté ? Une idée change ? Faites simplement glisser votre publication sur une nouvelle date. C'est aussi simple que ça. Notre calendrier visuel vous donne le contrôle total de votre planning de contenu.
                </motion.p>
                <motion.ul variants={stagger} className="space-y-3">
                  {["Vue mensuelle et hebdomadaire", "Filtres par réseau social et statut", "Reprogrammation instantanée par drag & drop"].map((item) => (
                    <motion.li key={item} variants={fadeUp} className="flex items-center gap-3 text-foreground/70">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ============ FEATURE SHOWCASE: PREVIEW ============ */}
        <section className="py-20 lg:py-28 bg-ice">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <AnimatedSection className="order-2 lg:order-1">
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-coral-light text-primary text-xs font-semibold mb-4">
                  <Eye className="w-3.5 h-3.5" />
                  Prévisualisation
                </motion.div>
                <motion.h2 variants={fadeUp} className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-6">
                  Visualisez avant de{" "}
                  <span className="text-primary">publier</span>
                </motion.h2>
                <motion.p variants={fadeUp} className="text-lg text-foreground/60 leading-relaxed mb-6">
                  Ne vous demandez plus jamais à quoi ressemblera votre post. Notre aperçu en direct se met à jour pendant que vous écrivez, pour chaque plateforme. Fini les mauvaises surprises.
                </motion.p>
                <motion.ul variants={stagger} className="space-y-3">
                  {["Aperçu en temps réel pour chaque réseau", "Support des Stories, Reels et Carrousels", "Bibliothèque de médias intégrée"].map((item) => (
                    <motion.li key={item} variants={fadeUp} className="flex items-center gap-3 text-foreground/70">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </AnimatedSection>

              <AnimatedSection className="order-1 lg:order-2">
                <motion.div variants={fadeUp} className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-bl from-primary/5 to-blue-100/20 rounded-2xl blur-xl" />
                  <img
                    src={`${CDN}/feature-preview_634a9cd2.png`}
                    alt="Prévisualisation en direct des publications sur Instagram, TikTok et LinkedIn dans Social Calendar"
                    className="relative rounded-2xl shadow-xl border border-border/40 w-full"
                    loading="lazy"
                  />
                </motion.div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ============ FEATURE SHOWCASE: ANALYTICS ============ */}
        <section className="py-20 lg:py-28 bg-white">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <AnimatedSection>
                <motion.div variants={fadeUp} className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 to-blue-100/20 rounded-2xl blur-xl" />
                  <img
                    src={`${CDN}/feature-analytics_13aa5e52.png`}
                    alt="Tableau de bord analytique Social Calendar avec métriques d'engagement, croissance des abonnés et statistiques de portée"
                    className="relative rounded-2xl shadow-xl border border-border/40 w-full"
                    loading="lazy"
                  />
                </motion.div>
              </AnimatedSection>

              <AnimatedSection>
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-coral-light text-primary text-xs font-semibold mb-4">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Analyses
                </motion.div>
                <motion.h2 variants={fadeUp} className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-6">
                  Des données qui vous rendent{" "}
                  <span className="text-primary">plus intelligent</span>
                </motion.h2>
                <motion.p variants={fadeUp} className="text-lg text-foreground/60 leading-relaxed mb-6">
                  Prenez des décisions basées sur les données, pas sur des suppositions. Nos outils d'analyse vous montrent ce qui résonne avec votre audience et quand publier pour un impact maximal.
                </motion.p>
                <motion.ul variants={stagger} className="space-y-3">
                  {["Tableau de bord centralisé multi-comptes", "Meilleurs moments pour publier", "Rapports PDF exportables en un clic"].map((item) => (
                    <motion.li key={item} variants={fadeUp} className="flex items-center gap-3 text-foreground/70">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ============ STORIES & REELS SECTION ============ */}
        <section className="py-20 lg:py-28 bg-ice">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <AnimatedSection className="order-2 lg:order-1">
                <motion.h2 variants={fadeUp} className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-6">
                  Stories, Reels,{" "}
                  <span className="text-primary">Carrousels</span>
                </motion.h2>
                <motion.p variants={fadeUp} className="text-lg text-foreground/60 leading-relaxed mb-6">
                  Nous ne nous limitons pas aux posts classiques. Programmez vos Stories Instagram, vos Reels, vos carrousels et même vos YouTube Shorts avec la même facilité que pour un simple post texte.
                </motion.p>
                <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-6">
                  {["Stories", "Reels", "Carrousels", "Shorts", "Threads"].map((type) => (
                    <span key={type} className="px-4 py-2 rounded-full bg-white border border-border/40 text-sm font-semibold text-navy shadow-sm">
                      {type}
                    </span>
                  ))}
                </motion.div>
              </AnimatedSection>

              <AnimatedSection className="order-1 lg:order-2">
                <motion.div variants={fadeUp} className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-bl from-primary/5 to-blue-100/20 rounded-2xl blur-xl" />
                  <img
                    src={`${CDN}/feature-stories-reels_ad21b21c.png`}
                    alt="Programmation de Stories Instagram et Reels dans Social Calendar avec prévisualisation mobile"
                    className="relative rounded-2xl shadow-xl border border-border/40 w-full"
                    loading="lazy"
                  />
                </motion.div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ============ TESTIMONIALS ============ */}
        <section className="py-20 lg:py-28 bg-navy" id="temoignages">
          <div className="container">
            <AnimatedSection className="text-center mb-16">
              <motion.p variants={fadeUp} className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
                Témoignages
              </motion.p>
              <motion.h2 variants={fadeUp} className="font-heading text-3xl sm:text-4xl font-bold text-white mb-6">
                Plus de 2 800 utilisateurs nous font confiance
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-white/50 max-w-2xl mx-auto">
                Découvrez pourquoi les créateurs de contenu, les marques et les agences choisissent Social Calendar pour gérer leurs réseaux sociaux.
              </motion.p>
            </AnimatedSection>

            <AnimatedSection className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed mb-5">"{t.text}"</p>
                  <div>
                    <p className="font-heading font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-white/40">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatedSection>
          </div>
        </section>

        {/* ============ PRICING PREVIEW ============ */}
        <section className="py-20 lg:py-28 bg-white" id="prix">
          <div className="container">
            <AnimatedSection className="text-center mb-16">
              <motion.h2 variants={fadeUp} className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-6">
                Des tarifs{" "}
                <span className="text-primary">simples et transparents</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-foreground/60 max-w-2xl mx-auto">
                Choisissez le plan qui correspond à vos besoins. Tous les plans commencent par un essai gratuit de 7 jours.
              </motion.p>
            </AnimatedSection>

            <AnimatedSection className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  name: "Gratuit",
                  price: "0€",
                  period: "pour toujours",
                  features: ["3 comptes sociaux", "30 posts/mois", "Calendrier visuel", "Analyses de base"],
                  cta: "Commencer",
                  popular: false,
                },
                {
                  name: "Pro",
                  price: "15€",
                  period: "/mois",
                  features: ["10 comptes sociaux", "Posts illimités", "Analyses avancées", "Meilleurs moments", "Support prioritaire"],
                  cta: "Essai gratuit",
                  popular: true,
                },
                {
                  name: "Agence",
                  price: "49€",
                  period: "/mois",
                  features: ["30 comptes sociaux", "5 utilisateurs", "Collaboration d'équipe", "Flux de validation", "Rapports clients", "Support dédié"],
                  cta: "Essai gratuit",
                  popular: false,
                },
              ].map((plan) => (
                <motion.div
                  key={plan.name}
                  variants={fadeUp}
                  className={`rounded-2xl p-7 border transition-all duration-300 ${
                    plan.popular
                      ? "border-primary bg-white shadow-xl shadow-primary/10 relative"
                      : "border-border/40 bg-white hover:border-primary/20 hover:shadow-lg"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-xs font-semibold">
                      Le plus populaire
                    </div>
                  )}
                  <h3 className="font-heading text-lg font-bold text-navy mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="font-heading text-4xl font-extrabold text-navy">{plan.price}</span>
                    <span className="text-sm text-foreground/50">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-foreground/70">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full font-semibold ${
                      plan.popular
                        ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                        : "bg-muted hover:bg-muted/80 text-navy"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </motion.div>
              ))}
            </AnimatedSection>

            <AnimatedSection className="text-center mt-8">
              <motion.div variants={fadeUp}>
                <Link href="/prix" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
                  Voir tous les détails des plans
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>

        {/* ============ FINAL CTA ============ */}
        <section className="py-20 lg:py-28 bg-gradient-to-br from-navy via-navy to-navy/90 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(232,86,74,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />

          <div className="container relative">
            <AnimatedSection className="max-w-3xl mx-auto text-center">
              <motion.h2 variants={fadeUp} className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
                Prêt à révolutionner votre gestion des{" "}
                <span className="text-primary">réseaux sociaux</span> ?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-white/50 mb-8 max-w-xl mx-auto">
                Rejoignez des milliers de créateurs et de marques qui ont déjà fait le saut. Inscrivez-vous gratuitement et découvrez la puissance d'un calendrier social unifié.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold px-10 h-13 text-base shadow-xl shadow-primary/30">
                  Commencer l'aventure Social Calendar
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
              <motion.p variants={fadeUp} className="text-sm text-white/30 mt-4 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Gratuit pour commencer &mdash; Aucune carte de crédit requise
              </motion.p>
            </AnimatedSection>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
