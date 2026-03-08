/*
 * Design: Warm SaaS — Pricing page
 * SEO: Optimized for "prix outil planification réseaux sociaux", "social media scheduler pricing"
 */
import { useEffect } from "react";
import { useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import { CheckCircle2, X, ArrowRight, HelpCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

const plans = [
  {
    name: "Gratuit",
    description: "Idéal pour les créateurs qui débutent",
    price: "0€",
    period: "pour toujours",
    features: [
      { name: "Comptes sociaux", value: "3" },
      { name: "Utilisateurs", value: "1" },
      { name: "Posts par mois", value: "30" },
      { name: "Calendrier visuel", included: true },
      { name: "Planification Posts, Stories, Reels", included: true },
      { name: "Prévisualisation des posts", included: true },
      { name: "Analyses de base", included: true },
      { name: "Analyses avancées", included: false },
      { name: "Meilleurs moments pour publier", included: false },
      { name: "Collaboration d'équipe", included: false },
      { name: "Flux de validation", included: false },
      { name: "Rapports clients PDF", included: false },
      { name: "Support par email", included: true },
      { name: "Support prioritaire", included: false },
    ],
    cta: "Commencer gratuitement",
    popular: false,
  },
  {
    name: "Pro",
    description: "Pour les créateurs et marques en croissance",
    price: "15€",
    period: "/mois",
    annualPrice: "12€",
    features: [
      { name: "Comptes sociaux", value: "10" },
      { name: "Utilisateurs", value: "1" },
      { name: "Posts par mois", value: "Illimités" },
      { name: "Calendrier visuel", included: true },
      { name: "Planification Posts, Stories, Reels", included: true },
      { name: "Prévisualisation des posts", included: true },
      { name: "Analyses de base", included: true },
      { name: "Analyses avancées", included: true },
      { name: "Meilleurs moments pour publier", included: true },
      { name: "Collaboration d'équipe", included: false },
      { name: "Flux de validation", included: false },
      { name: "Rapports clients PDF", included: true },
      { name: "Support par email", included: true },
      { name: "Support prioritaire", included: true },
    ],
    cta: "Essai gratuit de 7 jours",
    popular: true,
  },
  {
    name: "Agence",
    description: "Pour les agences et les grandes équipes",
    price: "49€",
    period: "/mois",
    annualPrice: "39€",
    features: [
      { name: "Comptes sociaux", value: "30" },
      { name: "Utilisateurs", value: "5" },
      { name: "Posts par mois", value: "Illimités" },
      { name: "Calendrier visuel", included: true },
      { name: "Planification Posts, Stories, Reels", included: true },
      { name: "Prévisualisation des posts", included: true },
      { name: "Analyses de base", included: true },
      { name: "Analyses avancées", included: true },
      { name: "Meilleurs moments pour publier", included: true },
      { name: "Collaboration d'équipe", included: true },
      { name: "Flux de validation", included: true },
      { name: "Rapports clients PDF", included: true },
      { name: "Support par email", included: true },
      { name: "Support prioritaire", included: true },
    ],
    cta: "Essai gratuit de 7 jours",
    popular: false,
  },
];

const faqs = [
  {
    q: "Puis-je changer de plan plus tard ?",
    a: "Oui, vous pouvez faire évoluer ou réduire votre plan à tout moment depuis les paramètres de votre compte. Les changements prennent effet immédiatement et le montant est calculé au prorata.",
  },
  {
    q: "Proposez-vous des réductions pour la facturation annuelle ?",
    a: "Oui ! Nous offrons une réduction de 20% sur tous nos plans payants si vous choisissez la facturation annuelle. C'est l'équivalent de 2 mois gratuits.",
  },
  {
    q: "Quels moyens de paiement acceptez-vous ?",
    a: "Nous acceptons toutes les principales cartes de crédit (Visa, MasterCard, American Express) via notre partenaire de paiement sécurisé Stripe. Les paiements par virement bancaire sont disponibles pour le plan Agence.",
  },
  {
    q: "Y a-t-il une période d'essai ?",
    a: "Oui, tous nos plans payants commencent avec une période d'essai gratuite de 7 jours. Vous pouvez annuler à tout moment pendant cette période sans être facturé.",
  },
  {
    q: "Que se passe-t-il si je dépasse les limites de mon plan ?",
    a: "Nous vous enverrons une notification lorsque vous approchez de vos limites. Vous pourrez alors choisir de passer au plan supérieur ou d'attendre le prochain cycle de facturation.",
  },
  {
    q: "Puis-je obtenir un remboursement ?",
    a: "Oui, nous offrons un remboursement complet dans les 14 jours suivant votre premier paiement. Contactez notre support pour en faire la demande.",
  },
];

export default function Pricing() {
  useEffect(() => {
    document.title = "Prix et Tarifs — Social Calendar | Planification Réseaux Sociaux";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-16 pb-8 lg:pt-24 lg:pb-12 bg-gradient-to-b from-ice to-white">
          <div className="container">
            <AnimatedSection className="max-w-3xl mx-auto text-center">
              <motion.h1 variants={fadeUp} className="font-heading text-4xl sm:text-5xl font-extrabold text-navy mb-6 leading-tight">
                Des tarifs <span className="text-primary">simples et transparents</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-foreground/60 max-w-xl mx-auto mb-4">
                Commencez gratuitement, évoluez quand vous êtes prêt. Tous les plans payants incluent un essai gratuit de 7 jours sans carte de crédit.
              </motion.p>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 text-sm font-medium text-green-700">
                Économisez 20% avec la facturation annuelle
              </motion.div>
            </AnimatedSection>
          </div>
        </section>

        {/* Plans */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container">
            <AnimatedSection className="grid sm:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <motion.div
                  key={plan.name}
                  variants={fadeUp}
                  className={`rounded-2xl p-7 border transition-all duration-300 ${
                    plan.popular
                      ? "border-primary bg-white shadow-2xl shadow-primary/10 relative scale-[1.02]"
                      : "border-border/40 bg-white hover:border-primary/20 hover:shadow-lg"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-xs font-semibold shadow-lg shadow-primary/30">
                      Le plus populaire
                    </div>
                  )}
                  <h3 className="font-heading text-xl font-bold text-navy">{plan.name}</h3>
                  <p className="text-sm text-foreground/50 mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="font-heading text-4xl font-extrabold text-navy">{plan.price}</span>
                    <span className="text-sm text-foreground/50">{plan.period}</span>
                  </div>
                  {plan.annualPrice && (
                    <p className="text-xs text-green-600 font-medium mb-4 -mt-4">
                      ou {plan.annualPrice}/mois facturé annuellement
                    </p>
                  )}

                  <Button
                    className={`w-full font-semibold mb-6 ${
                      plan.popular
                        ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                        : "bg-muted hover:bg-muted/80 text-navy"
                    }`}
                  >
                    {plan.cta}
                  </Button>

                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f.name} className="flex items-center gap-2.5 text-sm">
                        {f.value ? (
                          <>
                            <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                              {f.value.charAt(0) === "I" ? "∞" : f.value}
                            </span>
                            <span className="text-foreground/70">{f.name}</span>
                          </>
                        ) : f.included ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            <span className="text-foreground/70">{f.name}</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-foreground/20 shrink-0" />
                            <span className="text-foreground/30">{f.name}</span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </AnimatedSection>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 lg:py-28 bg-ice" id="faq">
          <div className="container">
            <AnimatedSection className="text-center mb-14">
              <motion.h2 variants={fadeUp} className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-4">
                Questions fréquentes
              </motion.h2>
              <motion.p variants={fadeUp} className="text-foreground/60 max-w-xl mx-auto">
                Vous ne trouvez pas la réponse à votre question ? Contactez notre équipe support.
              </motion.p>
            </AnimatedSection>

            <AnimatedSection className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, i) => (
                <motion.details
                  key={i}
                  variants={fadeUp}
                  className="group bg-white rounded-xl border border-border/40 overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-5 cursor-pointer font-heading font-semibold text-navy hover:text-primary transition-colors">
                    <span className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                      {faq.q}
                    </span>
                    <ArrowRight className="w-4 h-4 text-foreground/30 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-5 pb-5 pl-13 text-foreground/60 leading-relaxed">
                    {faq.a}
                  </div>
                </motion.details>
              ))}
            </AnimatedSection>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-navy">
          <div className="container text-center">
            <AnimatedSection>
              <motion.h2 variants={fadeUp} className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
                Prêt à commencer ?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-white/50 mb-8 max-w-lg mx-auto">
                Rejoignez plus de 2 800 créateurs et marques qui utilisent Social Calendar pour gérer leurs réseaux sociaux.
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
