/*
 * Design: Notion/Tally style — minimal contact page
 */
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Clock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease }
  }),
};

const contactCards = [
  { icon: Mail, title: "Email", desc: "Envoyez-nous un email à tout moment.", value: "contact@calenji.com" },
  { icon: MessageSquare, title: "Chat en direct", desc: "Disponible du lundi au vendredi.", value: "9h - 18h CET" },
  { icon: Clock, title: "Temps de réponse", desc: "Nous répondons rapidement.", value: "< 24 heures" },
];

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  useEffect(() => {
    document.title = "Contact — Calenji";
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message envoyé ! Nous vous répondrons sous 24h.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="container">
          <motion.div className="max-w-2xl mx-auto text-center mb-16" initial="hidden" animate="visible" variants={fadeUp}>
            <motion.p variants={fadeUp} custom={0} className="text-[13px] font-medium text-gray-400 uppercase tracking-wider mb-3">Contact</motion.p>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-5">
              Parlons de votre projet.
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-gray-500">
              Une question, une suggestion ou un besoin spécifique ? Nous sommes là pour vous aider.
            </motion.p>
          </motion.div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-3 gap-5 max-w-3xl mx-auto mb-16">
            {contactCards.map((card, i) => (
              <motion.div key={card.title} initial="hidden" animate="visible" variants={fadeUp} custom={i} className="p-5 rounded-xl border border-gray-100 text-center">
                <card.icon size={22} className="text-gray-900 mx-auto mb-3" strokeWidth={1.8} />
                <h3 className="text-[15px] font-semibold text-gray-900 mb-1">{card.title}</h3>
                <p className="text-[13px] text-gray-400 mb-2">{card.desc}</p>
                <p className="text-[14px] font-medium text-gray-900">{card.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Form */}
          <motion.div className="max-w-xl mx-auto" initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Nom</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors" placeholder="Votre nom" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Email</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors" placeholder="vous@exemple.com" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Sujet</label>
                <select value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-900 focus:outline-none focus:border-gray-400 transition-colors">
                  <option value="">Choisir un sujet</option>
                  <option value="demo">Demander une démo</option>
                  <option value="support">Support technique</option>
                  <option value="sales">Question commerciale</option>
                  <option value="partnership">Partenariat</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Message</label>
                <textarea required rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-[14px] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors resize-none" placeholder="Décrivez votre besoin..." />
              </div>
              <button type="submit" className="w-full bg-gray-900 text-white font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-[14px] flex items-center justify-center gap-2">
                Envoyer le message <ArrowRight size={16} />
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
