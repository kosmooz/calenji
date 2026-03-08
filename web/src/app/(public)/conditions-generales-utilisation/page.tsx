"use client";

import { motion } from "framer-motion";

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease } }),
};

export default function Terms() {
  return (
    <section className="pt-20 pb-24 md:pt-28 md:pb-32">
      <div className="container">
        <motion.div className="max-w-2xl mx-auto" initial="hidden" animate="visible" variants={fadeUp}>
          <motion.p variants={fadeUp} custom={0} className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-3">Légal</motion.p>
          <motion.h1 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Conditions Générales d&apos;Utilisation</motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-[14px] text-gray-400 mb-12">Dernière mise à jour : 1er mars 2025</motion.p>

          <div className="space-y-10 text-[15px] text-gray-500 leading-[1.8]">
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 mb-3">1. Objet</h2>
              <p>Les présentes Conditions Générales d&apos;Utilisation régissent l&apos;utilisation de la plateforme Calenji, un service de planification et de publication de contenu sur les réseaux sociaux, édité par Calenji SAS. En créant un compte ou en utilisant notre service, vous acceptez d&apos;être lié par ces CGU.</p>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 mb-3">2. Description du service</h2>
              <p className="mb-3">Calenji permet de :</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Planifier et programmer des publications sur 5 réseaux sociaux (Instagram, Facebook, TikTok, LinkedIn, X)</li>
                <li>Gérer un calendrier éditorial visuel avec drag & drop</li>
                <li>Prévisualiser les publications avant mise en ligne</li>
                <li>Analyser les performances des publications</li>
                <li>Collaborer en équipe sur la création de contenu</li>
              </ul>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 mb-3">3. Inscription et compte</h2>
              <p>Pour utiliser Calenji, vous devez créer un compte avec des informations exactes. Vous êtes responsable de la confidentialité de vos identifiants et de toutes les activités sous votre compte. Vous devez avoir au moins 16 ans pour créer un compte.</p>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 mb-3">4. Utilisation acceptable</h2>
              <p className="mb-3">Vous vous engagez à :</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Respecter les lois et réglementations applicables</li>
                <li>Respecter les conditions d&apos;utilisation de chaque réseau social</li>
                <li>Ne pas publier de contenu illégal, diffamatoire ou haineux</li>
                <li>Ne pas utiliser le service pour du spam</li>
                <li>Ne pas contourner les limitations de votre plan</li>
              </ul>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 mb-3">5. Contenu de l&apos;utilisateur</h2>
              <p>Vous conservez tous les droits de propriété intellectuelle sur votre contenu. Vous nous accordez une licence limitée pour stocker, traiter et transmettre votre contenu aux réseaux sociaux conformément à vos instructions. Vous êtes seul responsable du contenu que vous publiez.</p>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 mb-3">6. Abonnements et paiement</h2>
              <p>Calenji propose un plan gratuit et des plans payants facturés mensuellement ou annuellement. Les prix sont en euros TTC. Le paiement est traité par Stripe. Les abonnements sont renouvelés automatiquement. Remboursement possible sous 14 jours après le premier paiement.</p>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 mb-3">7. Disponibilité</h2>
              <p>Nous visons une disponibilité de 99,9%. Des interruptions peuvent survenir pour maintenance, mise à jour ou force majeure.</p>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 mb-3">8. Limitation de responsabilité</h2>
              <p>Calenji est fourni &ldquo;en l&apos;état&rdquo;. Notre responsabilité est limitée au montant des frais d&apos;abonnement payés au cours des 12 derniers mois. Nous ne sommes pas responsables des dommages indirects.</p>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 mb-3">9. Résiliation</h2>
              <p>Vous pouvez résilier votre compte à tout moment. Nous nous réservons le droit de suspendre ou résilier votre compte en cas de violation des CGU.</p>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 mb-3">10. Propriété intellectuelle</h2>
              <p>Calenji, son logo, son interface et son code source sont protégés par les lois sur la propriété intellectuelle. Toute reproduction non autorisée est interdite.</p>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 mb-3">11. Droit applicable</h2>
              <p>Les présentes CGU sont régies par le droit français. En cas de litige, les tribunaux de Paris seront compétents.</p>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 mb-3">12. Contact</h2>
              <p>Pour toute question : <a href="mailto:legal@calenji.com" className="text-gray-900 underline underline-offset-2">legal@calenji.com</a></p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
