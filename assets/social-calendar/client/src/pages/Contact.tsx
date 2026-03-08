/*
 * Design: Warm SaaS — Contact page
 * SEO: "contact social calendar", "support outil planification réseaux sociaux"
 */
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import { Mail, MessageSquare, Clock, ArrowRight, Send, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

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

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  useEffect(() => {
    document.title = "Contact — Social Calendar | Nous Contacter";
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message envoyé avec succès ! Nous vous répondrons sous 24h.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-16 pb-8 lg:pt-24 lg:pb-12 bg-gradient-to-b from-ice to-white">
          <div className="container">
            <AnimatedSection className="max-w-3xl mx-auto text-center">
              <motion.h1 variants={fadeUp} className="font-heading text-4xl sm:text-5xl font-extrabold text-navy mb-6 leading-tight">
                Nous sommes là pour <span className="text-primary">vous aider</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-foreground/60 max-w-xl mx-auto">
                Une question, une suggestion ou besoin d'aide ? Notre équipe est disponible pour vous accompagner dans votre utilisation de Social Calendar.
              </motion.p>
            </AnimatedSection>
          </div>
        </section>

        {/* Contact cards + Form */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="container">
            {/* Contact cards */}
            <AnimatedSection className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
              {[
                { icon: Mail, title: "Email", desc: "Envoyez-nous un email et nous vous répondrons sous 24h.", value: "support@socialcalendar.app" },
                { icon: MessageSquare, title: "Chat en direct", desc: "Discutez avec notre équipe en temps réel pendant les heures de bureau.", value: "Disponible du lundi au vendredi" },
                { icon: Clock, title: "Temps de réponse", desc: "Nous nous engageons à répondre rapidement à toutes vos demandes.", value: "Moins de 24h en moyenne" },
              ].map((card, i) => (
                <motion.div key={i} variants={fadeUp} className="text-center p-6 rounded-2xl bg-ice border border-border/40">
                  <div className="w-12 h-12 rounded-xl bg-coral-light flex items-center justify-center mx-auto mb-4">
                    <card.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-navy mb-2">{card.title}</h3>
                  <p className="text-sm text-foreground/50 mb-2">{card.desc}</p>
                  <p className="text-sm font-semibold text-primary">{card.value}</p>
                </motion.div>
              ))}
            </AnimatedSection>

            {/* Form */}
            <AnimatedSection className="max-w-2xl mx-auto">
              <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-border/40 p-8 shadow-lg">
                <h2 className="font-heading text-2xl font-bold text-navy mb-2">Envoyez-nous un message</h2>
                <p className="text-foreground/50 mb-8">Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-navy mb-1.5">Nom complet</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-foreground/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Jean Dupont"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy mb-1.5">Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-foreground/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="jean@exemple.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1.5">Sujet</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="question">Question générale</option>
                      <option value="support">Support technique</option>
                      <option value="billing">Facturation</option>
                      <option value="partnership">Partenariat</option>
                      <option value="feedback">Suggestion</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1.5">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-foreground/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                      placeholder="Décrivez votre demande..."
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-12 shadow-lg shadow-primary/20">
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer le message
                  </Button>
                </form>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>

        {/* FAQ rapide */}
        <section className="py-16 bg-ice">
          <div className="container">
            <AnimatedSection className="max-w-3xl mx-auto text-center">
              <motion.h2 variants={fadeUp} className="font-heading text-2xl font-bold text-navy mb-4">
                Avant de nous contacter
              </motion.h2>
              <motion.p variants={fadeUp} className="text-foreground/50 mb-8">
                Consultez nos ressources pour trouver rapidement une réponse à votre question.
              </motion.p>
              <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: "FAQ", desc: "Réponses aux questions les plus fréquentes", href: "/prix#faq" },
                  { title: "Blog", desc: "Guides, tutoriels et bonnes pratiques", href: "/blog" },
                ].map((link) => (
                  <a
                    key={link.title}
                    href={link.href}
                    className="p-5 rounded-xl bg-white border border-border/40 hover:border-primary/20 hover:shadow-lg transition-all text-left group"
                  >
                    <h3 className="font-heading font-bold text-navy mb-1 group-hover:text-primary transition-colors">{link.title}</h3>
                    <p className="text-sm text-foreground/50">{link.desc}</p>
                  </a>
                ))}
              </motion.div>
            </AnimatedSection>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
