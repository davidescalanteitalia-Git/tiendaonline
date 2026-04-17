'use client'

import PageShell from '../../components/PageShell'
import { useLang } from '../../components/LanguageProvider'
import AnimatedSection from '../../components/AnimatedSection'
import { ShieldCheck, ChevronRight } from 'lucide-react'

const PAGE_T = {
  it: {
    title: 'Privacy Policy',
    subtitle: 'Ultimo aggiornamento: 8 aprile 2026 · Conforme al GDPR (Reg. UE 2016/679) e al D.Lgs. 196/2003',
    langNote: null,
  },
  es: {
    title: 'Política de Privacidad',
    subtitle: 'Última actualización: 8 de abril de 2026 · Conforme al GDPR (Reg. UE 2016/679)',
    langNote: '📋 Este documento legal está disponible en italiano. El contenido jurídico es vinculante en su versión italiana.',
  },
  en: {
    title: 'Privacy Policy',
    subtitle: 'Last updated: 8 April 2026 · Compliant with GDPR (EU Reg. 2016/679)',
    langNote: '📋 This legal document is available in Italian. The Italian version is the legally binding one.',
  },
}

const Li = ({ children }) => (
  <li className="flex items-start gap-3">
    <ChevronRight className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
    <span>{children}</span>
  </li>
)

const Section = ({ title, children, delay = 0 }) => (
  <AnimatedSection delay={delay} className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-200 premium-shadow mb-8 group hover:border-emerald-300 transition-all">
    <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
        <ShieldCheck className="w-6 h-6 text-emerald-600" />
      </div>
      <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
        {title}
      </h2>
    </div>
    <div className="text-slate-600 leading-relaxed text-[15px] space-y-4">
      {children}
    </div>
  </AnimatedSection>
)

export default function PrivacyPage() {
  const { lang } = useLang()
  const pt = PAGE_T[lang] || PAGE_T.it

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
              {pt.title}
            </h1>
            <p className="text-lg md:text-xl text-emerald-50/80 font-medium max-w-2xl mx-auto">
              {pt.subtitle}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Contenuto */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">

          {/* Language note for non-Italian */}
          {pt.langNote && (
            <AnimatedSection className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex items-start gap-4 shadow-sm">
              <span className="text-2xl shrink-0 mt-0.5">📋</span>
              <p className="text-amber-800 text-sm font-medium leading-relaxed m-0">
                {pt.langNote.replace('📋 ', '')}
              </p>
            </AnimatedSection>
          )}

          <AnimatedSection delay={0.1} className="bg-emerald-50/50 border border-emerald-100 rounded-[32px] p-8 mb-12 premium-shadow text-center">
            <p className="text-emerald-900/80 font-medium leading-relaxed text-sm m-0">
              La presente informativa descrive come <strong className="text-emerald-700">TIENDAONLINE</strong> (di seguito "il Titolare") raccoglie, utilizza e protegge i dati personali degli utenti che accedono al sito <strong className="text-emerald-700">tiendaonline.it</strong>, in conformità al Regolamento (UE) 2016/679 (GDPR) e al D.Lgs. 196/2003.
            </p>
          </AnimatedSection>

          <Section title="1. Titolare del trattamento" delay={0.1}>
            <p>Il Titolare del trattamento dei dati personali è:</p>
            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 space-y-2 mt-4">
              <div className="font-bold text-slate-800">TIENDAONLINE</div>
              <div className="text-sm text-slate-500 mb-4">Sviluppato da David Escalante</div>
              
              <div className="flex flex-col gap-2">
                <a href="mailto:davidescalanteitalia@gmail.com" className="flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">✉️</span>
                  davidescalanteitalia@gmail.com
                </a>
                <a href="tel:+393751239515" className="flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">📞</span>
                  +39 375 123 9515
                </a>
              </div>
            </div>
          </Section>

          <Section title="2. Dati raccolti" delay={0.1}>
            <p>In base ai servizi utilizzati, potremmo raccogliere le seguenti categorie di dati:</p>
            <ul className="space-y-3 my-4">
              <Li><strong>Dati di registrazione:</strong> nome, cognome, indirizzo email, numero di telefono (WhatsApp).</Li>
              <Li><strong>Dati del negozio:</strong> nome del negozio, prodotti, prezzi, immagini caricate.</Li>
              <Li><strong>Dati di navigazione:</strong> indirizzo IP, tipo di browser, pagine visitate, orari di accesso.</Li>
              <Li><strong>Dati degli ordini:</strong> prodotti selezionati, quantità, messaggi inviati tramite WhatsApp.</Li>
            </ul>
            <p>I dati degli ordini vengono trasmessi direttamente tramite WhatsApp e non vengono memorizzati sui nostri server.</p>
          </Section>

          <Section title="3. Finalità e base giuridica del trattamento" delay={0.1}>
            <ul className="space-y-4">
              <Li><strong>Erogazione del servizio</strong> (art. 6.1.b GDPR): gestione dell'account, creazione del negozio online, invio degli ordini via WhatsApp.</Li>
              <Li><strong>Obblighi legali</strong> (art. 6.1.c GDPR): adempimento di obblighi fiscali e normativi.</Li>
              <Li><strong>Legittimo interesse</strong> (art. 6.1.f GDPR): miglioramento della piattaforma, sicurezza del servizio, prevenzione di abusi.</Li>
              <Li><strong>Consenso</strong> (art. 6.1.a GDPR): invio di comunicazioni promozionali, se esplicitamente accettato.</Li>
            </ul>
          </Section>

          <Section title="4. Conservazione dei dati" delay={0.1}>
            <p>I dati personali vengono conservati per il tempo strettamente necessario alle finalità per cui sono stati raccolti:</p>
            <ul className="space-y-3 my-4">
              <Li>Dati dell&apos;account: fino alla cancellazione dell&apos;account, e per 12 mesi successivi per obblighi legali.</Li>
              <Li>Dati di navigazione: massimo 12 mesi.</Li>
              <Li>Comunicazioni email: fino alla revoca del consenso.</Li>
            </ul>
          </Section>

          <Section title="5. Condivisione dei dati con terze parti" delay={0.1}>
            <p>I dati non vengono venduti né ceduti a terzi per finalità commerciali. Potremmo condividerli con:</p>
            <ul className="space-y-4 my-4">
              <Li><strong>Supabase Inc.</strong> (USA) – database e autenticazione. Trattamento basato su Clausole Contrattuali Standard UE.</Li>
              <Li><strong>Coolify / Hetzner</strong> – infrastruttura di hosting con server localizzati in Europa (EU-West-2).</Li>
              <Li><strong>PostHog Inc.</strong> – analisi del traffico in forma anonima e aggregata. I dati vengono anonimizzati prima dell&apos;invio. <br /><a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-500 hover:underline">Privacy Policy PostHog ↗</a></Li>
              <Li><strong>Sentry (Functional Software Inc.)</strong> – monitoraggio degli errori tecnici. Non raccoglie dati personali degli utenti finali. <br /><a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-500 hover:underline">Privacy Policy Sentry ↗</a></Li>
              <Li>Autorità competenti (Garante Privacy, Autorità giudiziaria), ove richiesto dalla legge.</Li>
            </ul>
          </Section>

          <Section title="6. Diritti dell'interessato" delay={0.1}>
            <p className="mb-4">In qualità di interessato, hai il diritto di:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <Li>Accedere ai tuoi dati personali</Li>
              <Li>Rettificare dati inesatti</Li>
              <Li>Richiedere la cancellazione (oblio)</Li>
              <Li>Limitare il trattamento</Li>
              <Li>Portabilità dei dati</Li>
              <Li>Opporsi al trattamento</Li>
            </div>
            
            <p className="mb-3">Per esercitare i tuoi diritti, scrivi a: <a href="mailto:davidescalanteitalia@gmail.com" className="text-emerald-600 font-bold hover:text-emerald-700">davidescalanteitalia@gmail.com</a></p>
            <p className="text-sm bg-slate-100 p-4 rounded-xl text-slate-700">
              Hai inoltre il diritto di presentare reclamo al Garante per la protezione dei dati personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-bold hover:underline">www.garanteprivacy.it</a>).
            </p>
          </Section>

          <Section title="7. Cookie" delay={0.1}>
            <p>Il sito utilizza cookie tecnici essenziali e, previo consenso, cookie analitici. I cookie analitici (PostHog) vengono attivati <strong>solo dopo il consenso esplicito</strong> dell&apos;utente, in conformità alle linee guida del Garante del 10 giugno 2021.</p>
            <p className="mt-4">Per informazioni dettagliate sui cookie utilizzati, sulle loro finalità e su come gestirli o revocare il consenso, consulta la nostra <a href="/cookie-policy" className="text-emerald-600 font-bold hover:underline hover:text-emerald-500">Cookie Policy</a>.</p>
          </Section>

          <Section title="7b. Conservazione dei dati analitici" delay={0.1}>
            <ul className="space-y-3">
              <Li>Cookie tecnici (sessione, lingua): durata della sessione o max 12 mesi</Li>
              <Li>Cookie analitici PostHog: <strong>massimo 13 mesi</strong> (limite imposto dal Garante Privacy italiano, provvedimento del 10/06/2021)</Li>
              <Li>Dati di log tecnici: massimo 12 mesi</Li>
            </ul>
          </Section>

          <Section title="8. Sicurezza dei dati" delay={0.1}>
            <p>Adottiamo misure tecniche e organizzative adeguate per proteggere i dati personali contro accessi non autorizzati, perdita o divulgazione accidentale, tra cui: connessioni HTTPS, cifratura dei dati sensibili e accesso limitato ai sistemi di produzione.</p>
          </Section>

          <Section title="9. Modifiche alla presente informativa" delay={0.1}>
            <p>Il Titolare si riserva il diritto di modificare la presente informativa. Le modifiche saranno pubblicate su questa pagina con aggiornamento della data in alto. In caso di modifiche sostanziali, gli utenti registrati saranno informati via email.</p>
          </Section>

        </div>
      </section>

    </PageShell>
  )
}
