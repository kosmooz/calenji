"use client";

import { motion } from "framer-motion";

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease } }),
};

export default function Privacy() {
  return (
    <section className="pt-20 pb-24 md:pt-28 md:pb-32">
      <div className="container">
        <motion.div className="max-w-2xl mx-auto" initial="hidden" animate="visible" variants={fadeUp}>
          <motion.p variants={fadeUp} custom={0} className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-3">Légal</motion.p>
          <motion.h1 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Politique de Confidentialité</motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-[14px] text-gray-400 mb-12">Dernière mise à jour : 1er mars 2025</motion.p>

          <div className="space-y-10 text-[15px] text-gray-500 leading-[1.8]">
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 mb-3">1. Introduction</h2>
              <p>Chez Calenji, nous accordons une importance primordiale à la protection de vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations lorsque vous utilisez notre plateforme de planification de contenu pour les réseaux sociaux.</p>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 mb-3">2. Données collectées</h2>
              <p className="mb-3">Nous collectons les types de données suivants :</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong className="text-gray-900">Données d&apos;inscription :</strong> Nom, adresse email, mot de passe (chiffré), photo de profil optionnelle.</li>
                <li><strong className="text-gray-900">Données de connexion aux réseaux sociaux :</strong> Tokens d&apos;accès OAuth pour les plateformes connectées. Nous ne stockons jamais vos mots de passe.</li>
                <li><strong className="text-gray-900">Données de contenu :</strong> Publications créées, programmées et publiées via notre plateforme.</li>
                <li><strong className="text-gray-900">Données d&apos;utilisation :</strong> Pages visitées, fonctionnalités utilisées, fréquence d&apos;utilisation.</li>
                <li><strong className="text-gray-900">Données de paiement :</strong> Traitées par Stripe. Nous ne stockons pas vos informations bancaires.</li>
              </ul>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 mb-3">3. Utilisation des données</h2>
              <p>Vos données sont utilisées exclusivement pour fournir et améliorer le service Calenji : publication de vos contenus sur les réseaux sociaux, affichage de vos analyses, personnalisation de votre expérience, et envoi de communications relatives au service. Nous ne vendons jamais vos données personnelles à des tiers.</p>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 mb-3">4. Partage des données</h2>
              <p>Nous ne partageons vos données qu&apos;avec les plateformes de réseaux sociaux connectées (dans le cadre de vos instructions), nos prestataires techniques (hébergement, paiement) soumis à des obligations de confidentialité, et en cas d&apos;obligation légale.</p>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 mb-3">5. Sécurité</h2>
              <p>Vos données sont protégées par chiffrement SSL/TLS, chiffrement au repos pour les données sensibles, authentification à deux facteurs, audits de sécurité réguliers et accès restreint au personnel autorisé.</p>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 mb-3">6. Conservation</h2>
              <p>Vos données sont conservées tant que votre compte est actif. En cas de suppression, vos données sont effacées sous 30 jours, sauf obligation légale de conservation.</p>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 mb-3">7. Vos droits (RGPD)</h2>
              <p className="mb-3">Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Droit d&apos;accès à vos données personnelles</li>
                <li>Droit de rectification des données inexactes</li>
                <li>Droit à l&apos;effacement de vos données</li>
                <li>Droit à la portabilité de vos données</li>
                <li>Droit d&apos;opposition au traitement</li>
              </ul>
              <p className="mt-3">Pour exercer ces droits, contactez-nous à <a href="mailto:privacy@calenji.com" className="text-gray-900 underline underline-offset-2">privacy@calenji.com</a>.</p>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 mb-3">8. Cookies</h2>
              <p>Nous utilisons des cookies essentiels (authentification, préférences) et des cookies analytiques. Vous pouvez configurer votre navigateur pour refuser les cookies non essentiels.</p>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 mb-3">9. Modifications</h2>
              <p>Nous pouvons mettre à jour cette politique. En cas de modification substantielle, nous vous informerons par email ou via l&apos;application.</p>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 mb-3">10. Contact</h2>
              <p>Pour toute question : <a href="mailto:privacy@calenji.com" className="text-gray-900 underline underline-offset-2">privacy@calenji.com</a> — Calenji SAS, Paris, France.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
