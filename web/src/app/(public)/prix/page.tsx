"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ArrowRight, Minus } from "lucide-react";

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease } }),
};

const plans = [
  {
    name: "Gratuit", desc: "Pour découvrir", priceMonthly: 0, priceYearly: 0, popular: false, cta: "Commencer",
    features: [
      { text: "3 comptes sociaux", included: true }, { text: "30 publications/mois", included: true },
      { text: "Calendrier visuel", included: true }, { text: "Prévisualisation", included: true },
      { text: "1 utilisateur", included: true }, { text: "Analyses basiques", included: true },
      { text: "IA intégrée", included: false }, { text: "Collaboration", included: false },
      { text: "Rapports PDF", included: false }, { text: "Support prioritaire", included: false },
    ],
  },
  {
    name: "Pro", desc: "Pour les créateurs", priceMonthly: 15, priceYearly: 12, popular: true, cta: "Commencer",
    features: [
      { text: "10 comptes sociaux", included: true }, { text: "Publications illimitées", included: true },
      { text: "Calendrier visuel", included: true }, { text: "Prévisualisation", included: true },
      { text: "3 utilisateurs", included: true }, { text: "Analyses avancées", included: true },
      { text: "IA intégrée", included: true }, { text: "Recyclage de contenu", included: true },
      { text: "Rapports PDF", included: true }, { text: "Support prioritaire", included: true },
    ],
  },
  {
    name: "Agence", desc: "Pour les équipes", priceMonthly: 49, priceYearly: 39, popular: false, cta: "Contacter les ventes",
    features: [
      { text: "Comptes illimités", included: true }, { text: "Publications illimitées", included: true },
      { text: "Calendrier visuel", included: true }, { text: "Prévisualisation", included: true },
      { text: "Utilisateurs illimités", included: true }, { text: "Analyses avancées", included: true },
      { text: "IA intégrée", included: true }, { text: "Collaboration d'équipe", included: true },
      { text: "Rapports clients PDF", included: true }, { text: "Support dédié + API", included: true },
    ],
  },
];

const faqs = [
  { q: "Puis-je essayer gratuitement ?", a: "Oui, le plan Gratuit est disponible sans limite de temps et sans carte de crédit. Vous pouvez connecter jusqu'à 3 comptes sociaux et programmer 30 publications par mois." },
  { q: "Comment fonctionne la facturation ?", a: "Vous pouvez choisir une facturation mensuelle ou annuelle. La facturation annuelle vous fait économiser 20%. Vous pouvez changer de plan ou annuler à tout moment." },
  { q: "Quelles plateformes sont supportées ?", a: "Calenji supporte Instagram, Facebook, TikTok, LinkedIn et X (Twitter). Nous ajoutons régulièrement de nouvelles plateformes." },
  { q: "Puis-je changer de plan à tout moment ?", a: "Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. Le changement prend effet immédiatement et la facturation est ajustée au prorata." },
  { q: "Mes données sont-elles sécurisées ?", a: "Absolument. Nous utilisons le chiffrement SSL, l'authentification OAuth pour les connexions aux réseaux sociaux, et nous sommes conformes au RGPD. Vos données ne sont jamais partagées." },
  { q: "Proposez-vous un support client ?", a: "Oui. Le plan Gratuit inclut un support par email. Le plan Pro offre un support prioritaire avec réponse sous 24h. Le plan Agence inclut un support dédié avec un interlocuteur attitré." },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <>
      <section className="pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="container">
          <motion.div className="max-w-3xl mx-auto text-center" initial="hidden" animate="visible" variants={fadeUp}>
            <motion.p variants={fadeUp} custom={0} className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-3">Prix</motion.p>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
              Gratuit pour commencer.{" "}<span className="text-gray-300">Pro quand vous êtes prêt.</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-gray-500 max-w-xl mx-auto mb-8">Pas de surprise. Pas de frais cachés. Choisissez le plan qui correspond à vos besoins.</motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex items-center justify-center gap-3">
              <span className={`text-[14px] ${!yearly ? "text-gray-900 font-medium" : "text-gray-400"}`}>Mensuel</span>
              <button onClick={() => setYearly(!yearly)} className={`relative w-12 h-6 rounded-full transition-colors ${yearly ? "bg-gray-900" : "bg-gray-200"}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${yearly ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
              <span className={`text-[14px] ${yearly ? "text-gray-900 font-medium" : "text-gray-400"}`}>Annuel <span className="text-green-600 text-[12px] font-medium">-20%</span></span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 md:pb-32">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div key={plan.name} initial="hidden" animate="visible" variants={fadeUp} custom={i}
                className={`rounded-xl p-7 ${plan.popular ? "border-2 border-gray-900 relative" : "border border-gray-200"} bg-white`}>
                {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[11px] font-medium px-3 py-1 rounded-full">Populaire</div>}
                <h3 className="text-[15px] font-semibold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-[13px] text-gray-400 mb-5">{plan.desc}</p>
                <div className="mb-6"><span className="text-4xl font-extrabold text-gray-900">{yearly ? plan.priceYearly : plan.priceMonthly}€</span><span className="text-[14px] text-gray-400 ml-1">/mois</span></div>
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-center gap-2.5 text-[14px]">
                      {f.included ? <Check size={15} className={plan.popular ? "text-gray-900" : "text-gray-400"} /> : <Minus size={15} className="text-gray-200" />}
                      <span className={f.included ? "text-gray-600" : "text-gray-300"}>{f.text}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/contact" className={`block text-center py-2.5 rounded-lg text-[14px] font-medium transition-colors ${plan.popular ? "bg-gray-900 text-white hover:bg-gray-800" : "border border-gray-200 text-gray-700 hover:bg-gray-50"}`}>{plan.cta}</Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-24 md:py-32 bg-[#F7F7F5]">
        <div className="container">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Questions fréquentes</h2>
          </motion.div>
          <div className="max-w-2xl mx-auto space-y-6">
            {faqs.map((faq, i) => (
              <motion.div key={faq.q} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp} custom={i % 3}>
                <h3 className="text-[15px] font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-gray-900">
        <div className="container">
          <motion.div className="max-w-2xl mx-auto text-center" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-5">Commencez gratuitement aujourd&apos;hui.</h2>
            <p className="text-lg text-gray-400 mb-8">Aucune carte de crédit requise. Passez au plan supérieur quand vous êtes prêt.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-gray-900 font-medium px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-[15px]">Commencer gratuitement <ArrowRight size={16} /></Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
