/*
 * Design: Warm SaaS — Terms of Service page
 * SEO: Legal page for trust and SEO authority
 */
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Terms() {
  useEffect(() => {
    document.title = "Conditions Générales d'Utilisation — Social Calendar";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        <section className="pt-16 pb-20 lg:pt-24 lg:pb-28 bg-white">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-navy mb-8">
                Conditions Générales d'Utilisation
              </h1>
              <p className="text-sm text-foreground/40 mb-10">Dernière mise à jour : 1er mars 2025</p>

              <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-navy prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-foreground/70 prose-p:leading-relaxed prose-li:text-foreground/70 prose-strong:text-navy">
                <h2>1. Objet</h2>
                <p>
                  Les présentes Conditions Générales d'Utilisation (ci-après "CGU") régissent l'utilisation de la plateforme Social Calendar, un service de planification et de publication de contenu sur les réseaux sociaux, édité par Social Calendar SAS (ci-après "nous", "notre" ou "Social Calendar").
                </p>
                <p>
                  En créant un compte ou en utilisant notre service, vous acceptez d'être lié par ces CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser Social Calendar.
                </p>

                <h2>2. Description du service</h2>
                <p>Social Calendar est une plateforme qui permet aux utilisateurs de :</p>
                <ul>
                  <li>Planifier et programmer des publications sur plusieurs réseaux sociaux (Instagram, TikTok, X, LinkedIn, Facebook, YouTube, Pinterest, Threads, Bluesky)</li>
                  <li>Gérer un calendrier éditorial visuel</li>
                  <li>Prévisualiser les publications avant leur mise en ligne</li>
                  <li>Analyser les performances de leurs publications</li>
                  <li>Collaborer en équipe sur la création de contenu</li>
                </ul>

                <h2>3. Inscription et compte</h2>
                <p>
                  Pour utiliser Social Calendar, vous devez créer un compte en fournissant des informations exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toutes les activités effectuées sous votre compte.
                </p>
                <p>
                  Vous devez avoir au moins 16 ans pour créer un compte. Si vous utilisez Social Calendar pour le compte d'une entreprise, vous déclarez avoir l'autorité nécessaire pour lier cette entreprise aux présentes CGU.
                </p>

                <h2>4. Utilisation acceptable</h2>
                <p>En utilisant Social Calendar, vous vous engagez à :</p>
                <ul>
                  <li>Respecter les lois et réglementations applicables</li>
                  <li>Respecter les conditions d'utilisation de chaque réseau social connecté</li>
                  <li>Ne pas publier de contenu illégal, diffamatoire, haineux ou portant atteinte aux droits d'autrui</li>
                  <li>Ne pas utiliser le service pour du spam ou de la publicité non sollicitée</li>
                  <li>Ne pas tenter de contourner les limitations de votre plan d'abonnement</li>
                  <li>Ne pas utiliser de bots ou de scripts automatisés non autorisés</li>
                </ul>

                <h2>5. Contenu de l'utilisateur</h2>
                <p>
                  Vous conservez tous les droits de propriété intellectuelle sur le contenu que vous créez et publiez via Social Calendar. En utilisant notre service, vous nous accordez une licence limitée pour stocker, traiter et transmettre votre contenu aux réseaux sociaux conformément à vos instructions.
                </p>
                <p>
                  Vous êtes seul responsable du contenu que vous publiez. Social Calendar n'exerce aucun contrôle éditorial sur votre contenu et ne peut être tenu responsable de son caractère inapproprié ou illégal.
                </p>

                <h2>6. Abonnements et paiement</h2>
                <p>
                  Social Calendar propose plusieurs plans d'abonnement, dont un plan gratuit avec des fonctionnalités limitées. Les plans payants sont facturés mensuellement ou annuellement, selon votre choix.
                </p>
                <ul>
                  <li>Les prix sont indiqués en euros, toutes taxes comprises</li>
                  <li>Le paiement est traité de manière sécurisée par Stripe</li>
                  <li>Les abonnements sont renouvelés automatiquement sauf annulation</li>
                  <li>Vous pouvez annuler votre abonnement à tout moment depuis les paramètres de votre compte</li>
                  <li>Un remboursement est possible dans les 14 jours suivant le premier paiement</li>
                </ul>

                <h2>7. Disponibilité du service</h2>
                <p>
                  Nous nous efforçons de maintenir Social Calendar disponible 24h/24, 7j/7, avec un objectif de disponibilité de 99,9%. Cependant, nous ne pouvons garantir une disponibilité ininterrompue. Des interruptions peuvent survenir pour des raisons de maintenance, de mise à jour ou de force majeure.
                </p>

                <h2>8. Limitation de responsabilité</h2>
                <p>
                  Social Calendar est fourni "en l'état". Nous ne garantissons pas que le service sera exempt d'erreurs ou d'interruptions. Notre responsabilité est limitée au montant des frais d'abonnement payés au cours des 12 derniers mois.
                </p>
                <p>
                  Nous ne sommes pas responsables des dommages indirects, y compris la perte de données, la perte de revenus ou les dommages à la réputation résultant de l'utilisation de notre service.
                </p>

                <h2>9. Résiliation</h2>
                <p>
                  Vous pouvez résilier votre compte à tout moment depuis les paramètres. Nous nous réservons le droit de suspendre ou de résilier votre compte en cas de violation des présentes CGU, sans préavis.
                </p>

                <h2>10. Propriété intellectuelle</h2>
                <p>
                  Social Calendar, y compris son logo, son interface, ses fonctionnalités et son code source, est protégé par les lois sur la propriété intellectuelle. Toute reproduction, modification ou distribution non autorisée est interdite.
                </p>

                <h2>11. Droit applicable</h2>
                <p>
                  Les présentes CGU sont régies par le droit français. En cas de litige, les tribunaux de Paris seront compétents, sauf disposition légale contraire.
                </p>

                <h2>12. Contact</h2>
                <p>
                  Pour toute question concernant ces CGU, contactez-nous à <strong>legal@socialcalendar.app</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
