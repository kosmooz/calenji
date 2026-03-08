/*
 * Design: Warm SaaS — Privacy Policy page
 * SEO: Legal page for trust and SEO authority
 */
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Privacy() {
  useEffect(() => {
    document.title = "Politique de Confidentialité — Social Calendar";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        <section className="pt-16 pb-20 lg:pt-24 lg:pb-28 bg-white">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-navy mb-8">
                Politique de Confidentialité
              </h1>
              <p className="text-sm text-foreground/40 mb-10">Dernière mise à jour : 1er mars 2025</p>

              <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-navy prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-foreground/70 prose-p:leading-relaxed prose-li:text-foreground/70 prose-strong:text-navy">
                <h2>1. Introduction</h2>
                <p>
                  Chez Social Calendar, nous accordons une importance primordiale à la protection de vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations lorsque vous utilisez notre plateforme de planification de contenu pour les réseaux sociaux.
                </p>
                <p>
                  En utilisant Social Calendar, vous acceptez les pratiques décrites dans cette politique. Si vous n'êtes pas d'accord avec ces pratiques, veuillez ne pas utiliser notre service.
                </p>

                <h2>2. Données collectées</h2>
                <p>Nous collectons les types de données suivants :</p>
                <ul>
                  <li><strong>Données d'inscription :</strong> Nom, adresse email, mot de passe (chiffré), photo de profil optionnelle.</li>
                  <li><strong>Données de connexion aux réseaux sociaux :</strong> Tokens d'accès OAuth pour les plateformes que vous connectez (Instagram, TikTok, X, LinkedIn, Facebook, YouTube, Pinterest, Threads, Bluesky). Nous ne stockons jamais vos mots de passe de réseaux sociaux.</li>
                  <li><strong>Données de contenu :</strong> Les publications que vous créez, programmez et publiez via notre plateforme, y compris les textes, images et vidéos.</li>
                  <li><strong>Données d'utilisation :</strong> Informations sur votre utilisation de la plateforme, pages visitées, fonctionnalités utilisées, fréquence d'utilisation.</li>
                  <li><strong>Données techniques :</strong> Adresse IP, type de navigateur, système d'exploitation, identifiant d'appareil.</li>
                  <li><strong>Données de paiement :</strong> Traitées de manière sécurisée par notre partenaire Stripe. Nous ne stockons pas vos informations de carte bancaire.</li>
                </ul>

                <h2>3. Utilisation des données</h2>
                <p>Nous utilisons vos données pour :</p>
                <ul>
                  <li>Fournir, maintenir et améliorer notre service de planification de contenu</li>
                  <li>Publier vos contenus sur les réseaux sociaux aux heures programmées</li>
                  <li>Vous fournir des analyses et des recommandations personnalisées</li>
                  <li>Calculer les meilleurs moments pour publier en fonction de votre audience</li>
                  <li>Vous envoyer des notifications importantes concernant votre compte</li>
                  <li>Assurer la sécurité de votre compte et prévenir les fraudes</li>
                  <li>Améliorer notre plateforme grâce à l'analyse anonymisée des usages</li>
                </ul>

                <h2>4. Partage des données</h2>
                <p>
                  Nous ne vendons jamais vos données personnelles. Nous partageons vos données uniquement dans les cas suivants :
                </p>
                <ul>
                  <li><strong>Réseaux sociaux :</strong> Nous transmettons votre contenu aux plateformes que vous avez connectées, conformément à vos instructions de publication.</li>
                  <li><strong>Prestataires de services :</strong> Nous utilisons des services tiers pour l'hébergement (AWS), le paiement (Stripe) et l'analyse (anonymisée).</li>
                  <li><strong>Obligations légales :</strong> Nous pouvons divulguer vos données si la loi l'exige.</li>
                </ul>

                <h2>5. Sécurité des données</h2>
                <p>
                  Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données :
                </p>
                <ul>
                  <li>Chiffrement SSL/TLS pour toutes les communications</li>
                  <li>Chiffrement des données sensibles au repos</li>
                  <li>Authentification à deux facteurs disponible</li>
                  <li>Audits de sécurité réguliers</li>
                  <li>Accès restreint aux données par le personnel autorisé uniquement</li>
                </ul>

                <h2>6. Conservation des données</h2>
                <p>
                  Nous conservons vos données aussi longtemps que votre compte est actif. Si vous supprimez votre compte, nous supprimerons vos données personnelles dans un délai de 30 jours, sauf obligation légale de conservation plus longue.
                </p>

                <h2>7. Vos droits (RGPD)</h2>
                <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
                <ul>
                  <li><strong>Droit d'accès :</strong> Vous pouvez demander une copie de vos données personnelles.</li>
                  <li><strong>Droit de rectification :</strong> Vous pouvez corriger vos données inexactes.</li>
                  <li><strong>Droit à l'effacement :</strong> Vous pouvez demander la suppression de vos données.</li>
                  <li><strong>Droit à la portabilité :</strong> Vous pouvez exporter vos données dans un format structuré.</li>
                  <li><strong>Droit d'opposition :</strong> Vous pouvez vous opposer au traitement de vos données à des fins de marketing.</li>
                </ul>
                <p>
                  Pour exercer ces droits, contactez-nous à <strong>privacy@socialcalendar.app</strong>.
                </p>

                <h2>8. Cookies</h2>
                <p>
                  Nous utilisons des cookies essentiels pour le fonctionnement de notre plateforme (authentification, préférences). Nous utilisons également des cookies analytiques pour comprendre comment vous utilisez notre service. Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
                </p>

                <h2>9. Modifications</h2>
                <p>
                  Nous pouvons mettre à jour cette politique de confidentialité de temps en temps. Nous vous informerons de tout changement significatif par email ou via une notification dans l'application.
                </p>

                <h2>10. Contact</h2>
                <p>
                  Pour toute question concernant cette politique de confidentialité, contactez notre Délégué à la Protection des Données :
                </p>
                <ul>
                  <li>Email : <strong>privacy@socialcalendar.app</strong></li>
                  <li>Adresse : Social Calendar SAS, Paris, France</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
