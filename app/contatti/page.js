'use client'

import PageShell from '../../components/PageShell'
import { useLang } from '../../components/LanguageProvider'
import { Mail, Phone, Clock } from 'lucide-react'
import AnimatedSection from '../../components/AnimatedSection'

const T = {
  it: {
    title: 'Contatti',
    subtitle: 'Siamo qui per aiutarti. Scrivici o chiamaci.',
    emailTitle: 'Email',
    emailDesc: 'Rispondiamo entro 24 ore lavorative.',
    phoneTitle: 'Telefono / WhatsApp',
    phoneDesc: 'Disponibili anche su WhatsApp per supporto rapido.',
    hoursTitle: '🕐 Orari di assistenza',
    hours: 'Lunedì – Venerdì: 9:00 – 18:00\nSabato: 9:00 – 13:00\nDomenica: chiuso',
  },
  es: {
    title: 'Contacto',
    subtitle: 'Estamos aquí para ayudarte. Escríbenos o llámanos.',
    emailTitle: 'Email',
    emailDesc: 'Respondemos en 24 horas laborables.',
    phoneTitle: 'Teléfono / WhatsApp',
    phoneDesc: 'También disponibles por WhatsApp para soporte rápido.',
    hoursTitle: '🕐 Horario de atención',
    hours: 'Lunes – Viernes: 9:00 – 18:00\nSábado: 9:00 – 13:00\nDomingo: cerrado',
  },
  en: {
    title: 'Contact',
    subtitle: 'We are here to help. Write to us or call us.',
    emailTitle: 'Email',
    emailDesc: 'We reply within 24 working hours.',
    phoneTitle: 'Phone / WhatsApp',
    phoneDesc: 'Also available on WhatsApp for quick support.',
    hoursTitle: '🕐 Support hours',
    hours: 'Monday – Friday: 9:00 – 18:00\nSaturday: 9:00 – 13:00\nSunday: closed',
  },
}

export default function ContattiPage() {
  const { lang } = useLang()
  const t = T[lang] || T.it

  return (
    <PageShell>

      {/* Hero */}
      <section className="bg-slate-900 pt-24 pb-20 px-6 text-center mesh-gradient relative overflow-hidden">
        {/* Animated Orbs */}
        <div className="hero-glow top-[10%] left-[5%] bg-emerald-500/20" />
        <div className="hero-glow bottom-[10%] right-[10%] bg-blue-500/20" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <AnimatedSection>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
              {t.title}
            </h1>
            <p className="text-lg md:text-xl text-emerald-50/80 font-medium max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Cards di contatto */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

            {/* Email */}
            <AnimatedSection className="bg-white rounded-[32px] p-10 border border-slate-200 premium-shadow text-center group hover:border-emerald-300 transition-all">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Mail className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{t.emailTitle}</h2>
              <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                {t.emailDesc}
              </p>
              <a
                href="mailto:utilizzositemaster@gmail.com"
                className="glow-btn bg-slate-900 text-white font-bold text-sm px-6 py-3.5 rounded-xl inline-block hover:bg-slate-800 transition-all shadow-xl"
              >
                utilizzositemaster@gmail.com
              </a>
            </AnimatedSection>

            {/* Telefono */}
            <AnimatedSection delay={0.1} className="bg-white rounded-[32px] p-10 border border-slate-200 premium-shadow text-center group hover:border-[#25d366]/30 transition-all">
              <div className="w-16 h-16 bg-[#25d366]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Phone className="w-8 h-8 text-[#25d366]" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{t.phoneTitle}</h2>
              <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                {t.phoneDesc}
              </p>
              <a
                href="tel:+393751239515"
                className="glow-btn bg-[#25d366] text-white font-bold text-sm px-6 py-3.5 rounded-xl inline-block hover:bg-[#20bd5a] transition-all shadow-xl shadow-[#25d366]/20"
              >
                +39 375 123 9515
              </a>
            </AnimatedSection>

          </div>

          {/* Info extra */}
          <AnimatedSection delay={0.2} className="bg-emerald-50/50 rounded-[32px] p-10 border border-emerald-100 text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-emerald-600" />
              <h3 className="font-bold text-lg text-emerald-950">
                {t.hoursTitle.replace('🕐 ', '')}
              </h3>
            </div>
            <p className="text-emerald-800/80 font-medium leading-loose text-sm whitespace-pre-line">
              {t.hours}
            </p>
          </AnimatedSection>

        </div>
      </section>

    </PageShell>
  )
}
