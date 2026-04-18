'use client'

import PageShell from '../../components/PageShell'
import { useLang } from '../../components/LanguageProvider'
import AnimatedSection from '../../components/AnimatedSection'
import { ShieldCheck, ChevronRight } from 'lucide-react'

const PAGE_T = {
  it: {
    title: 'Termini di servizio',
    subtitle: 'Ultimo aggiornamento: 8 aprile 2026 · Legge applicabile: diritto italiano (D.Lgs. 206/2005)',
    langNote: null,
  },
  es: {
    title: 'Términos de servicio',
    subtitle: 'Última actualización: 8 de abril de 2026 · Ley aplicable: derecho italiano',
    langNote: '📋 Este documento legal está disponible en italiano. El contenido jurídico es vinculante en su versión italiana.',
  },
  en: {
    title: 'Terms of Service',
    subtitle: 'Last updated: 8 April 2026 · Applicable law: Italian law',
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

export default function TermsPage() {
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
              Leggere attentamente i presenti Termini prima di utilizzare la piattaforma <strong className="text-emerald-700">TIENDAONLINE</strong>. L&apos;utilizzo del servizio implica l&apos;accettazione integrale delle condizioni qui descritte.
            </p>
          </AnimatedSection>

          <Section title="1. Descrizione del servizio" delay={0.1}>
            <p><strong>TIENDAONLINE</strong> è una piattaforma SaaS che consente ai commercianti di creare una vetrina online e ricevere ordini tramite WhatsApp. Il servizio è disponibile in modalità gratuita e, in futuro, in modalità avanzata a pagamento.</p>
          </Section>

          <Section title="2. Accettazione dei termini" delay={0.1}>
            <p>Registrandosi o utilizzando TIENDAONLINE, l&apos;utente dichiara di avere almeno 18 anni di età e di accettare integralmente i presenti Termini di servizio e la <a href="/privacy" className="text-emerald-600 font-bold hover:text-emerald-500 underline underline-offset-2">Privacy Policy</a>.</p>
          </Section>

          <Section title="3. Creazione e gestione dell'account" delay={0.1}>
            <ul className="space-y-3">
              <Li>Ogni utente può registrare un account fornendo dati veritieri e aggiornati.</Li>
              <Li>L&apos;utente è responsabile della riservatezza delle proprie credenziali di accesso.</Li>
              <Li>È vietato cedere, vendere o condividere l&apos;account con terze parti.</Li>
              <Li>TIENDAONLINE si riserva il diritto di sospendere account che violino i presenti Termini.</Li>
            </ul>
          </Section>

          <Section title="4. Piano gratuito" delay={0.1}>
            <p className="font-semibold text-slate-800">Il piano gratuito include:</p>
            <ul className="space-y-3 my-4">
              <Li>Creazione di una vetrina online con sottodominio (es. <em>nomenegozio.tiendaonline.it</em>)</Li>
              <Li>Prodotti illimitati con foto e prezzi</Li>
              <Li>Ricezione ordini via WhatsApp</Li>
              <Li>Supporto multilingua (IT / ES / EN)</Li>
              <Li>Fino a 3 utenti nel team</Li>
            </ul>
            <p className="bg-slate-100 p-4 rounded-xl text-sm font-medium text-slate-700 mt-4">
              Il piano gratuito <strong className="text-emerald-600">non scade</strong> e non richiede carta di credito. TIENDAONLINE si riserva il diritto di modificare le funzionalità incluse nel piano gratuito con preavviso di 30 giorni.
            </p>
          </Section>

          <Section title="5. Contenuti dell'utente" delay={0.1}>
            <p>L&apos;utente è l&apos;unico responsabile dei contenuti pubblicati (prodotti, prezzi, immagini, descrizioni). È espressamente vietato pubblicare contenuti:</p>
            <ul className="space-y-3 my-4">
              <Li>Illegali, diffamatori o che violino diritti di terzi</Li>
              <Li>Che inducano in errore i consumatori sui prodotti o prezzi</Li>
              <Li>Che violino normative in materia di vendita online (D.Lgs. 206/2005)</Li>
            </ul>
            <p>TIENDAONLINE si riserva il diritto di rimuovere contenuti non conformi senza preavviso.</p>
          </Section>

          <Section title="6. Limitazioni di responsabilità" delay={0.1}>
            <p>TIENDAONLINE non è responsabile per:</p>
            <ul className="space-y-3 my-4">
              <Li>Interruzioni temporanee del servizio per manutenzione o cause di forza maggiore</Li>
              <Li>Perdita di dati causata da eventi fuori dal controllo del Titolare</Li>
              <Li>Transazioni commerciali tra l&apos;utente e i propri clienti</Li>
              <Li>Malfunzionamenti di WhatsApp o altri servizi di terze parti</Li>
            </ul>
          </Section>

          <Section title="7. Proprietà intellettuale" delay={0.1}>
            <p>Il marchio, il logo, il codice sorgente e tutti i contenuti originali di TIENDAONLINE sono di proprietà esclusiva del Titolare. È vietata qualsiasi riproduzione o utilizzo non autorizzato.</p>
            <p>I contenuti pubblicati dall&apos;utente (prodotti, immagini) rimangono di proprietà dell&apos;utente. L&apos;utente concede a TIENDAONLINE una licenza non esclusiva per visualizzare tali contenuti nell&apos;ambito del servizio.</p>
          </Section>

          <Section title="8. Cancellazione dell'account" delay={0.1}>
            <p>L&apos;utente può cancellare il proprio account e la propria vetrina in qualsiasi momento dalle impostazioni del pannello di controllo. La cancellazione è immediata e comporta la rimozione definitiva di tutti i dati associati entro 30 giorni.</p>
          </Section>

          <Section title="9. Modifiche ai termini" delay={0.1}>
            <p>TIENDAONLINE si riserva il diritto di aggiornare i presenti Termini. Gli utenti registrati saranno informati via email con almeno 15 giorni di preavviso. Il continuato utilizzo del servizio dopo la modifica costituisce accettazione dei nuovi Termini.</p>
          </Section>

          <Section title="10. Legge applicabile e foro competente" delay={0.1}>
            <p>I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente il Tribunale di riferimento del luogo di residenza del Titolare del servizio. Per i consumatori si applica la normativa europea sulla risoluzione alternativa delle controversie (ODR).</p>
          </Section>

          <Section title="11. Risoluzione alternativa delle controversie (ODR)" delay={0.1}>
            <p>In conformità al Regolamento UE 524/2013, i consumatori residenti nell&apos;UE hanno il diritto di ricorrere alla piattaforma ODR della Commissione Europea per la risoluzione delle controversie online:</p>
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="inline-block mt-3 px-6 py-3 bg-slate-100 hover:bg-emerald-50 text-emerald-700 font-bold rounded-xl transition-colors border border-slate-200 hover:border-emerald-200">
              Visita piattaforma ODR ↗
            </a>
          </Section>

          <Section title="12. Contatti" delay={0.1}>
            <p className="mb-4">Per qualsiasi domanda sui presenti Termini:</p>
            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 space-y-2">
              <div className="font-bold text-slate-800">TIENDAONLINE</div>
              <div className="text-sm text-slate-500 mb-4">© 2026 TIENDAONLINE · Tutti i diritti riservati</div>
              
              <div className="flex flex-col gap-2">
                <a href="mailto:davidescalanteitalia@gmail.com" className="flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">✉️</span>
                  davidescalanteitalia@gmail.com
                </a>
                <a href="https://tiendaonline.it" className="flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">🌐</span>
                  tiendaonline.it
                </a>
              </div>
            </div>
          </Section>

        </div>
      </section>

    </PageShell>
  )
}
