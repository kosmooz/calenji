/*
 * Design: Warm SaaS — Features page
 * SEO: "fonctionnalités outil planification réseaux sociaux", "social media calendar features"
 */
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import {
  Calendar, Zap, BarChart3, Users, Eye, GripVertical,
  CheckCircle2, ArrowRight, Globe, Image, MessageSquare,
  Clock, FileText, Bell, Lock, Smartphone
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CDN = "/images";

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

const allFeatures = [
  { icon: Calendar, title: "Calendrier Visuel", desc: "Vue mensuelle et hebdomadaire avec code couleur par plateforme. Visualisez tout votre contenu programmé en un coup d'œil." },
  { icon: GripVertical, title: "Glisser-Déposer", desc: "Réorganisez votre planning en faisant simplement glisser vos publications d'une date à l'autre." },
  { icon: Globe, title: "9 Plateformes", desc: "Instagram, TikTok, X, LinkedIn, Facebook, YouTube, Pinterest, Threads et Bluesky. Toutes les plateformes qui comptent." },
  { icon: Eye, title: "Prévisualisation", desc: "Visualisez exactement à quoi ressembleront vos publications sur chaque plateforme avant de les publier." },
  { icon: Image, title: "Stories & Reels", desc: "Programmez vos Stories Instagram, Reels, carrousels et YouTube Shorts aussi facilement qu'un post classique." },
  { icon: BarChart3, title: "Analyses Avancées", desc: "Suivez la croissance de vos abonnés, votre taux d'engagement et la portée de vos publications." },
  { icon: Clock, title: "Meilleurs Moments", desc: "Notre algorithme analyse votre audience pour vous recommander les meilleurs moments pour publier." },
  { icon: Users, title: "Collaboration", desc: "Invitez votre équipe, assignez des rôles et travaillez ensemble sur les mêmes calendriers." },
  { icon: MessageSquare, title: "Flux de Validation", desc: "Les brouillons doivent être approuvés avant d'être programmés. Garantissez la qualité de votre contenu." },
  { icon: FileText, title: "Rapports PDF", desc: "Créez des rapports professionnels pour vous-même, votre équipe ou vos clients en un seul clic." },
  { icon: Bell, title: "Notifications", desc: "Recevez des alertes quand vos posts sont publiés, quand un post nécessite une validation ou quand vos limites approchent." },
  { icon: Lock, title: "Sécurité", desc: "Chiffrement de bout en bout, authentification à deux facteurs et conformité RGPD pour protéger vos données." },
  { icon: Smartphone, title: "Application Mobile", desc: "Gérez vos publications en déplacement avec notre application mobile responsive (bientôt disponible)." },
  { icon: Zap, title: "Publication Automatique", desc: "Vos publications sont envoyées automatiquement à l'heure programmée. Aucune action manuelle requise." },
];

export default function Features() {
  useEffect(() => {
    document.title = "Fonctionnalités — Social Calendar | Calendrier de Planification Réseaux Sociaux";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-16 pb-12 lg:pt-24 lg:pb-16 bg-gradient-to-b from-ice to-white">
          <div className="container">
            <AnimatedSection className="max-w-3xl mx-auto text-center">
              <motion.h1 variants={fadeUp} className="font-heading text-4xl sm:text-5xl font-extrabold text-navy mb-6 leading-tight">
                Toutes les fonctionnalités dont vous avez besoin pour{" "}
                <span className="text-primary">dominer les réseaux sociaux</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-foreground/60 max-w-xl mx-auto">
                Social Calendar est conçu pour être puissant mais simple. Des outils qui vous font vraiment gagner du temps, sans la complexité superflue.
              </motion.p>
            </AnimatedSection>
          </div>
        </section>

        {/* Feature 1: Calendar */}
        <section className="py-20 lg:py-28 bg-white" id="calendrier">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <AnimatedSection>
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-coral-light text-primary text-xs font-semibold mb-4">
                  <Calendar className="w-3.5 h-3.5" />
                  Calendrier
                </motion.div>
                <motion.h2 variants={fadeUp} className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-6">
                  Au cœur de votre productivité :{" "}
                  <span className="text-primary">Le Calendrier</span>
                </motion.h2>
                <motion.p variants={fadeUp} className="text-lg text-foreground/60 leading-relaxed mb-6">
                  Notre calendrier est le centre de contrôle de votre univers social. Conçu pour la clarté et la vitesse, il vous donne une vue d'ensemble de tout votre contenu programmé sur toutes vos plateformes.
                </motion.p>
                <motion.ul variants={stagger} className="space-y-3">
                  {[
                    "Vue mensuelle et hebdomadaire avec code couleur",
                    "Glisser-déposer intuitif pour réorganiser",
                    "Filtres par réseau social, statut et campagne",
                    "Création rapide de posts directement depuis le calendrier",
                  ].map((item) => (
                    <motion.li key={item} variants={fadeUp} className="flex items-center gap-3 text-foreground/70">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </AnimatedSection>
              <AnimatedSection>
                <motion.div variants={fadeUp} className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 to-blue-100/20 rounded-2xl blur-xl" />
                  <img
                    src={`${CDN}/hero-dashboard_5f7f6273.png`}
                    alt="Calendrier visuel Social Calendar avec vue mensuelle et publications programmées"
                    className="relative rounded-2xl shadow-xl border border-border/40 w-full"
                    loading="lazy"
                  />
                </motion.div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Feature 2: Multi-platform */}
        <section className="py-20 lg:py-28 bg-ice">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <AnimatedSection className="order-2 lg:order-1">
                <motion.div variants={fadeUp} className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-bl from-primary/5 to-blue-100/20 rounded-2xl blur-xl" />
                  <img
                    src={`${CDN}/feature-multiplatform_978f59a1.png`}
                    alt="Connexion multi-plateformes Social Calendar - Instagram, TikTok, X, LinkedIn, Facebook, YouTube, Pinterest, Threads, Bluesky"
                    className="relative rounded-2xl shadow-xl border border-border/40 w-full"
                    loading="lazy"
                  />
                </motion.div>
              </AnimatedSection>
              <AnimatedSection className="order-1 lg:order-2">
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-coral-light text-primary text-xs font-semibold mb-4">
                  <Globe className="w-3.5 h-3.5" />
                  Multi-Plateformes
                </motion.div>
                <motion.h2 variants={fadeUp} className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-6">
                  Planifiez une fois,{" "}
                  <span className="text-primary">publiez partout</span>
                </motion.h2>
                <motion.p variants={fadeUp} className="text-lg text-foreground/60 leading-relaxed mb-6">
                  Connectez tous vos comptes en quelques clics et laissez Social Calendar faire le travail. Nous prenons en charge toutes les plateformes qui comptent pour votre audience.
                </motion.p>
                <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mb-6">
                  {["Instagram", "TikTok", "X (Twitter)", "LinkedIn", "Facebook", "YouTube", "Pinterest", "Threads", "Bluesky"].map((p) => (
                    <span key={p} className="px-3 py-1.5 rounded-full bg-white border border-border/40 text-xs font-semibold text-navy shadow-sm">
                      {p}
                    </span>
                  ))}
                </motion.div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Feature 3: Stories & Reels */}
        <section className="py-20 lg:py-28 bg-white">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <AnimatedSection>
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-coral-light text-primary text-xs font-semibold mb-4">
                  <Image className="w-3.5 h-3.5" />
                  Contenu Riche
                </motion.div>
                <motion.h2 variants={fadeUp} className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-6">
                  Stories, Reels,{" "}
                  <span className="text-primary">Carrousels</span>
                </motion.h2>
                <motion.p variants={fadeUp} className="text-lg text-foreground/60 leading-relaxed mb-6">
                  Nous ne nous limitons pas aux posts classiques. Programmez vos Stories Instagram, vos Reels, vos carrousels et même vos YouTube Shorts avec la même facilité que pour un simple post texte.
                </motion.p>
                <motion.ul variants={stagger} className="space-y-3">
                  {[
                    "Stories Instagram avec séquences multiples",
                    "Reels et vidéos courtes",
                    "Carrousels multi-images",
                    "YouTube Shorts",
                    "Threads multi-posts",
                  ].map((item) => (
                    <motion.li key={item} variants={fadeUp} className="flex items-center gap-3 text-foreground/70">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </AnimatedSection>
              <AnimatedSection>
                <motion.div variants={fadeUp} className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 to-blue-100/20 rounded-2xl blur-xl" />
                  <img
                    src={`${CDN}/feature-stories-reels_ad21b21c.png`}
                    alt="Programmation de Stories et Reels Instagram dans Social Calendar"
                    className="relative rounded-2xl shadow-xl border border-border/40 w-full"
                    loading="lazy"
                  />
                </motion.div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Feature 4: Analytics */}
        <section className="py-20 lg:py-28 bg-ice" id="analyses">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <AnimatedSection className="order-2 lg:order-1">
                <motion.div variants={fadeUp} className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-bl from-primary/5 to-blue-100/20 rounded-2xl blur-xl" />
                  <img
                    src={`${CDN}/feature-analytics_13aa5e52.png`}
                    alt="Tableau de bord analytique Social Calendar avec métriques d'engagement et statistiques"
                    className="relative rounded-2xl shadow-xl border border-border/40 w-full"
                    loading="lazy"
                  />
                </motion.div>
              </AnimatedSection>
              <AnimatedSection className="order-1 lg:order-2">
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-coral-light text-primary text-xs font-semibold mb-4">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Analyses
                </motion.div>
                <motion.h2 variants={fadeUp} className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-6">
                  Des données qui vous rendent{" "}
                  <span className="text-primary">plus intelligent</span>
                </motion.h2>
                <motion.p variants={fadeUp} className="text-lg text-foreground/60 leading-relaxed mb-6">
                  Prenez des décisions basées sur les données. Nos outils d'analyse vous montrent ce qui résonne avec votre audience et quand publier pour un impact maximal.
                </motion.p>
                <motion.ul variants={stagger} className="space-y-3">
                  {[
                    "Tableau de bord centralisé multi-comptes",
                    "Meilleurs moments pour publier",
                    "Suivi de la croissance des abonnés",
                    "Taux d'engagement par post et par plateforme",
                    "Rapports PDF exportables en un clic",
                  ].map((item) => (
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

        {/* Feature 5: Team */}
        <section className="py-20 lg:py-28 bg-white" id="collaboration">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <AnimatedSection>
                <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-coral-light text-primary text-xs font-semibold mb-4">
                  <Users className="w-3.5 h-3.5" />
                  Collaboration
                </motion.div>
                <motion.h2 variants={fadeUp} className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-6">
                  Collaborez en{" "}
                  <span className="text-primary">parfaite harmonie</span>
                </motion.h2>
                <motion.p variants={fadeUp} className="text-lg text-foreground/60 leading-relaxed mb-6">
                  La gestion des réseaux sociaux est un sport d'équipe. Social Calendar facilite la collaboration avec des espaces de travail partagés, des rôles et un flux de validation.
                </motion.p>
                <motion.ul variants={stagger} className="space-y-3">
                  {[
                    "Espaces de travail partagés",
                    "Rôles : Administrateur, Éditeur, Auteur",
                    "Flux de validation avec commentaires",
                    "Historique des modifications",
                  ].map((item) => (
                    <motion.li key={item} variants={fadeUp} className="flex items-center gap-3 text-foreground/70">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </AnimatedSection>
              <AnimatedSection>
                <motion.div variants={fadeUp} className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 to-blue-100/20 rounded-2xl blur-xl" />
                  <img
                    src={`${CDN}/feature-team_7a21c187.png`}
                    alt="Interface de collaboration d'équipe Social Calendar avec rôles et flux de validation"
                    className="relative rounded-2xl shadow-xl border border-border/40 w-full"
                    loading="lazy"
                  />
                </motion.div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* All Features Grid */}
        <section className="py-20 lg:py-28 bg-ice">
          <div className="container">
            <AnimatedSection className="text-center mb-16">
              <motion.h2 variants={fadeUp} className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-4">
                Toutes nos fonctionnalités
              </motion.h2>
              <motion.p variants={fadeUp} className="text-foreground/60 max-w-xl mx-auto">
                Un aperçu complet de tout ce que Social Calendar peut faire pour vous.
              </motion.p>
            </AnimatedSection>

            <AnimatedSection className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-6xl mx-auto">
              {allFeatures.map((f, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="bg-white rounded-xl p-5 border border-border/40 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
                >
                  <f.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-heading font-bold text-navy text-sm mb-1.5">{f.title}</h3>
                  <p className="text-xs text-foreground/50 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </AnimatedSection>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-navy">
          <div className="container text-center">
            <AnimatedSection>
              <motion.h2 variants={fadeUp} className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
                Prêt à essayer Social Calendar ?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-white/50 mb-8 max-w-lg mx-auto">
                Commencez gratuitement et découvrez toutes ces fonctionnalités par vous-même.
              </motion.p>
              <motion.div variants={fadeUp}>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold px-10 h-13 shadow-xl shadow-primary/30">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
