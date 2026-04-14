'use client'

import PageShell from '../../components/PageShell'
import { useLang } from '../../components/LanguageProvider'
import AnimatedSection from '../../components/AnimatedSection'
import { Cookie, Settings2, HelpCircle, Check, X, ShieldCheck } from 'lucide-react'

const PAGE_T = {
  it: {
    title: 'Cookie Policy',
    subtitle: 'Ultimo aggiornamento: 8 aprile 2026\nConforme alle Linee Guida del Garante Privacy italiano — Provvedimento del 10 giugno 2021',
    langNote: null,
  },
  es: {
    title: 'Política de Cookies',
    subtitle: 'Última actualización: 8 de abril de 2026\nConforme a las directrices del Garante Privacy italiano',
    langNote: '📋 Este documento legal está disponible en italiano. El contenido jurídico es vinculante en su versión italiana.',
  },
  en: {
    title: 'Cookie Policy',
    subtitle: 'Last updated: 8 April 2026\nCompliant with Italian Garante Privacy guidelines — Provision of 10 June 2021',
    langNote: '📋 This legal document is available in Italian. The Italian version is the legally binding one.',
  },
}

const Section = ({ title, children, accent, delay = 0 }) => (
  <AnimatedSection delay={delay} className={`bg-white rounded-[32px] p-8 md:p-10 border premium-shadow mb-8 group transition-all ${accent ? 'border-emerald-300 shadow-emerald-500/10' : 'border-slate-200 hover:border-emerald-300'}`}>
    <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${accent ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
        <Cookie className="w-6 h-6" />
      </div>
      <h2 className={`text-xl md:text-2xl font-bold tracking-tight ${accent ? 'text-emerald-700' : 'text-slate-900'}`}>
        {title}
      </h2>
    </div>
    <div className="text-slate-600 leading-relaxed text-[15px] space-y-4">
      {children}
    </div>
  </AnimatedSection>
)

const CookieTable = ({ cookies }) => (
  <div className="overflow-x-auto mt-6 border border-slate-200 rounded-2xl">
    <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
      <thead>
        <tr className="bg-emerald-50 border-b border-emerald-100">
          {['Nome', 'Tipo', 'Durata', 'Finalità'].map(h => (
            <th key={h} className="px-5 py-4 font-bold text-emerald-800">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {cookies.map((c, i) => (
          <tr key={i} className="hover:bg-slate-50 transition-colors">
            <td className="px-5 py-4 font-mono font-semibold text-emerald-600">{c.name}</td>
            <td className="px-5 py-4">
              <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${c.type === 'Tecnico' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                {c.type}
              </span>
            </td>
            <td className="px-5 py-4 text-slate-500 font-medium">{c.duration}</td>
            <td className="px-5 py-4 text-slate-600 min-w-[200px]">{c.purpose}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default function CookiePolicyPage() {
  const { lang } = useLang()
  const pt = PAGE_T[lang] || PAGE_T.it

  const technicalCookies = [
    { name: 'sb-*-auth-token', type: 'Tecnico', duration: 'Sessione / 1 ora', purpose: 'Token di autenticazione Supabase. Necessario per mantenere la sessione dell\'utente loggato.' },
    { name: 'appLang', type: 'Tecnico', duration: '12 mesi', purpose: 'Memorizza la preferenza di lingua. Non raccoglie dati personali.' },
    { name: '__cf_bm', type: 'Tecnico', duration: '30 minuti', purpose: 'Cookie Cloudflare per la sicurezza (bot/DDoS).' },
  ]

  const analyticsCookies = [
    { name: 'ph_*', type: 'Analitico', duration: 'Massimo 13 mesi', purpose: 'PostHog: analisi uso in forma anonima. Attivato solo con consenso.' },
    { name: 'posthog_session', type: 'Analitico', duration: 'Sessione', purpose: 'PostHog: identifica sessione di navigazione corrente.' },
  ]

  return (
    <PageShell>

      {/* Hero */}
      <section className="bg-slate-900 pt-24 pb-20 px-6 text-center mesh-gradient relative overflow-hidden">
        <div className="hero-glow top-[10%] left-[5%] bg-emerald-500/20" />
        <div className="hero-glow bottom-[10%] right-[10%] bg-blue-500/20" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <AnimatedSection className="flex flex-col items-center">
            <div className="text-5xl mb-6">🍪</div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
              {pt.title}
            </h1>
            <p className="text-lg md:text-xl text-emerald-50/80 font-medium max-w-2xl mx-auto whitespace-pre-line">
              {pt.subtitle}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Contenuto */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">

          {pt.langNote && (
            <AnimatedSection className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex items-start gap-4 shadow-sm">
              <span className="text-2xl shrink-0 mt-0.5">📋</span>
              <p className="text-amber-800 text-sm font-medium leading-relaxed m-0">
                {pt.langNote.replace('📋 ', '')}
              </p>
            </AnimatedSection>
          )}

          {/* Intro */}
          <AnimatedSection delay={0.1} className="bg-emerald-50/50 border border-emerald-100 rounded-[32px] p-8 mb-12 premium-shadow text-center">
            <p className="text-emerald-900/80 font-medium leading-relaxed text-sm m-0">
              La presente Cookie Policy descrive come <strong className="text-emerald-700">TIENDAONLINE</strong> utilizza i cookie e tecnologie simili, in conformità al GDPR (Reg. UE 2016/679), alla Direttiva ePrivacy 2002/58/CE e alle Linee Guida del Garante per la Protezione dei Dati Personali (Provv. 10 giugno 2021).
            </p>
          </AnimatedSection>

          <Section title="1. Cosa sono i cookie?" accent delay={0.1}>
            <p>I cookie sono piccoli file di testo che i siti web salvano sul dispositivo dell&apos;utente (computer, smartphone, tablet) durante la navigazione. Vengono utilizzati per:</p>
            <ul className="list-disc list-inside space-y-2 mt-4 text-slate-700">
              <li>Mantenere la sessione dell&apos;utente attiva</li>
              <li>Ricordare le preferenze dell&apos;utente (es. lingua)</li>
              <li>Analizzare il traffico e migliorare il servizio (solo con consenso)</li>
            </ul>
            <p className="mt-4 bg-emerald-50 p-4 rounded-xl text-emerald-800 font-medium text-sm">
              I cookie <strong>non contengono virus</strong> e non possono eseguire programmi sul tuo dispositivo.
            </p>
          </Section>

          <Section title="2. Cookie tecnici — Sempre attivi" delay={0.1}>
            <p>I cookie tecnici sono strettamente necessari per il funzionamento del sito e non richiedono il tuo consenso ai sensi dell&apos;art. 122 del D.Lgs. 196/2003.</p>
            <CookieTable cookies={technicalCookies} />
            <p className="text-[13px] text-slate-500 mt-4 leading-relaxed font-medium">
              ℹ️ Questi cookie non raccolgono informazioni identificabili personalmente e non vengono condivisi con terzi a fini pubblicitari.
            </p>
          </Section>

          <Section title="3. Cookie analitici — Solo con consenso" delay={0.1}>
            <p>I cookie analitici ci aiutano a capire come gli utenti utilizzano il sito (quali pagine visitano, tempo di permanenza). Utilizziamo <strong>PostHog</strong>.</p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 font-medium text-sm mt-4 shadow-sm flex gap-3">
              <span className="shrink-0">⚠️</span> 
              <span>Vengono attivati <strong>solo dopo il tuo consenso esplicito</strong>. Puoi revocare il consenso in qualsiasi momento.</span>
            </div>
            <CookieTable cookies={analyticsCookies} />
            <p className="text-[13px] text-slate-500 mt-4 leading-relaxed font-medium">
              PostHog è configurato con <strong>IP anonimizzato</strong> e <strong>senza cross-site tracking</strong>. I dati vengono conservati per max <strong>13 mesi</strong>.
            </p>
          </Section>

          <Section title="4. Cookie di terze parti" delay={0.1}>
            <p>Alcuni cookie provengono da servizi integrati nel sito:</p>
            <div className="overflow-x-auto mt-6 border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-emerald-50 border-b border-emerald-100 text-emerald-800 font-bold">
                    <th className="px-5 py-4">Servizio</th>
                    <th className="px-5 py-4">Finalità</th>
                    <th className="px-5 py-4">Consenso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-bold text-slate-800">Supabase</td>
                    <td className="px-5 py-4 text-slate-600">Autenticazione sicura</td>
                    <td className="px-5 py-4"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg uppercase">Non richiesto</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50 bg-slate-50/50">
                    <td className="px-5 py-4 font-bold text-slate-800">Cloudflare</td>
                    <td className="px-5 py-4 text-slate-600">Sicurezza e CDN</td>
                    <td className="px-5 py-4"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg uppercase">Non richiesto</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-bold text-slate-800">PostHog</td>
                    <td className="px-5 py-4 text-slate-600">Analisi traffico</td>
                    <td className="px-5 py-4"><span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg uppercase">Richiesto</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="5. Come gestire i cookie" delay={0.1}>
            <p>Hai pieno controllo sui cookie:</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {[
                { icon: <Settings2 className="w-6 h-6"/>, title: 'Banner cookie', desc: 'Usa il banner alla prima visita per accettare/rifiutare non essenziali.' },
                { icon: <ShieldCheck className="w-6 h-6"/>, title: 'Browser', desc: 'Blocca/elimina cookie nelle impostazioni del tuo browser.' },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">{item.icon}</div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-[13px] font-medium text-slate-500 mt-6">
              <strong>Guide browser:</strong>{' '}
              <a href="https://support.google.com/chrome/answer/95647" className="text-emerald-600 hover:underline">Chrome</a> ·{' '}
              <a href="https://support.mozilla.org/it/kb/Attivare%20e%20disattivare%20i%20cookie" className="text-emerald-600 hover:underline">Firefox</a> ·{' '}
              <a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" className="text-emerald-600 hover:underline">Safari</a> ·{' '}
              <a href="https://support.microsoft.com/it-it/microsoft-edge" className="text-emerald-600 hover:underline">Edge</a>
            </p>
          </Section>

          <Section title="6. Conseguenze del rifiuto" delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                <div className="flex items-center gap-2 font-bold text-emerald-800 mb-4">
                  <Check className="w-5 h-5 text-emerald-600" /> Se accetti (Analitici)
                </div>
                <ul className="text-sm text-emerald-900/80 space-y-2 list-disc list-inside">
                  <li>Ci aiuti a migliorare</li>
                  <li>Dati sempre anonimi</li>
                </ul>
              </div>
              <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center gap-2 font-bold text-slate-700 mb-4">
                  <X className="w-5 h-5 text-slate-500" /> Se rifiuti (Analitici)
                </div>
                <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                  <li>Sito funziona normalmente</li>
                  <li>Nessun cookie analitico</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="7. Riferimenti Normativi & Contatti" delay={0.1}>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              <li>GDPR (UE 2016/679)</li>
              <li>Direttiva ePrivacy 2002/58/CE</li>
              <li>Provvedimento Garante Privacy 10 giu 2021</li>
            </ul>
          </Section>

          {/* CTA contatti */}
          <AnimatedSection delay={0.2} className="bg-slate-900 text-white rounded-[32px] p-10 text-center mt-6 shadow-2xl relative overflow-hidden">
            <div className="hero-glow top-0 left-0 bg-emerald-500/20" />
            <div className="relative z-10 w-full flex flex-col items-center">
              <HelpCircle className="w-12 h-12 text-emerald-400 mb-6" />
              <h3 className="font-bold text-2xl mb-3 tracking-tight">Domande sulla privacy?</h3>
              <p className="text-slate-300 font-medium mb-8 max-w-md text-sm">
                Rispondiamo entro 72 ore. Siamo a disposizione per chiarire qualsiasi aspetto sui cookie.
              </p>
              <a href="mailto:davidescalanteitalia@gmail.com" className="glow-btn bg-emerald-500 text-white font-bold text-sm px-8 py-4 rounded-xl border border-emerald-400/50 shadow-xl shadow-emerald-500/30 transition-transform hover:-translate-y-1">
                davidescalanteitalia@gmail.com
              </a>
            </div>
          </AnimatedSection>

        </div>
      </section>

    </PageShell>
  )
}
