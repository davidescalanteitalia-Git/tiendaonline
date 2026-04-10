'use client'

import PageShell from '../../components/PageShell'
import { useLang } from '../../components/LanguageProvider'

const C = {
  green:      '#059669',
  greenLight: '#10b981',
  greenDark:  '#047857',
  greenBg:    '#f0fdf4',
  greenBorder:'#d1fae5',
  white:      '#ffffff',
  text:       '#0f172a',
  textMuted:  '#64748b',
  amber:      '#f59e0b',
  amberBg:    '#fffbeb',
  amberText:  '#92400e',
  grayBorder: '#e2e8f0',
  grayBg:     '#f8fafc',
  grayText:   '#94a3b8',
}

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

const Section = ({ title, children }) => (
  <div className="premium-shadow" style={{ 
    marginBottom: '36px',
    background: C.white,
    padding: '28px',
    borderRadius: '16px',
    border: `1px solid ${C.greenBorder}`
  }}>
    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: C.green, margin: '0 0 12px', paddingBottom: '8px', borderBottom: `2px solid ${C.greenBorder}` }}>
      {title}
    </h2>
    <div style={{ color: C.text, lineHeight: 1.75, fontSize: '0.95rem' }}>
      {children}
    </div>
  </div>
)

export default function TermsPage() {
  const { lang } = useLang()
  const pt = PAGE_T[lang] || PAGE_T.it

  return (
    <PageShell>

      {/* Hero */}
      <section className="gradient-bg" style={{
        padding:    '64px 20px 56px',
        textAlign:  'center',
      }}>
        <h1 style={{ color: C.white, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-1px' }}>
          {pt.title}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.95rem', margin: 0 }}>
          {pt.subtitle}
        </p>
      </section>

      {/* Contenuto */}
      <section style={{ background: C.white, padding: '64px 20px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          {pt.langNote && (
            <div style={{
              background:   '#fffbeb',
              border:       '1px solid #fcd34d',
              borderRadius: '10px',
              padding:      '14px 18px',
              marginBottom: '24px',
              fontSize:     '0.88rem',
              color:        '#92400e',
              lineHeight:   1.5,
            }}>
              {pt.langNote}
            </div>
          )}

          <div className="premium-shadow" style={{
            background:   C.greenBg,
            border:       `1px solid ${C.greenBorder}`,
            borderRadius: '12px',
            padding:      '18px 22px',
            marginBottom: '40px',
            fontSize:     '0.92rem',
            color:        C.textMuted,
            lineHeight:   1.65,
          }}>
            Leggere attentamente i presenti Termini prima di utilizzare la piattaforma <strong>TIENDAONLINE</strong>. L&apos;utilizzo del servizio implica l&apos;accettazione integrale delle condizioni qui descritte.
          </div>

          <Section title="1. Descrizione del servizio">
            <p><strong>TIENDAONLINE</strong> è una piattaforma SaaS che consente ai commercianti di creare una vetrina online e ricevere ordini tramite WhatsApp. Il servizio è disponibile in modalità gratuita e, in futuro, in modalità avanzata a pagamento.</p>
          </Section>

          <Section title="2. Accettazione dei termini">
            <p>Registrandosi o utilizzando TIENDAONLINE, l&apos;utente dichiara di avere almeno 18 anni di età e di accettare integralmente i presenti Termini di servizio e la <a href="/privacy" style={{ color: C.green }}>Privacy Policy</a>.</p>
          </Section>

          <Section title="3. Creazione e gestione dell'account">
            <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
              <li style={{ marginBottom: '6px' }}>Ogni utente può registrare un account fornendo dati veritieri e aggiornati.</li>
              <li style={{ marginBottom: '6px' }}>L&apos;utente è responsabile della riservatezza delle proprie credenziali di accesso.</li>
              <li style={{ marginBottom: '6px' }}>È vietato cedere, vendere o condividere l&apos;account con terze parti.</li>
              <li style={{ marginBottom: '6px' }}>TIENDAONLINE si riserva il diritto di sospendere account che violino i presenti Termini.</li>
            </ul>
          </Section>

          <Section title="4. Piano gratuito">
            <p>Il piano gratuito include:</p>
            <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
              <li style={{ marginBottom: '6px' }}>Creazione di una vetrina online con sottodominio (es. <em>nomenegozio.tiendaonline.it</em>)</li>
              <li style={{ marginBottom: '6px' }}>Prodotti illimitati con foto e prezzi</li>
              <li style={{ marginBottom: '6px' }}>Ricezione ordini via WhatsApp</li>
              <li style={{ marginBottom: '6px' }}>Supporto multilingua (IT / ES / EN)</li>
              <li style={{ marginBottom: '6px' }}>Fino a 3 utenti nel team</li>
            </ul>
            <p>Il piano gratuito <strong>non scade</strong> e non richiede carta di credito. TIENDAONLINE si riserva il diritto di modificare le funzionalità incluse nel piano gratuito con preavviso di 30 giorni.</p>
          </Section>

          <Section title="5. Contenuti dell'utente">
            <p>L&apos;utente è l&apos;unico responsabile dei contenuti pubblicati (prodotti, prezzi, immagini, descrizioni). È espressamente vietato pubblicare contenuti:</p>
            <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
              <li style={{ marginBottom: '6px' }}>Illegali, diffamatori o che violino diritti di terzi</li>
              <li style={{ marginBottom: '6px' }}>Che inducano in errore i consumatori sui prodotti o prezzi</li>
              <li style={{ marginBottom: '6px' }}>Che violino normative in materia di vendita online (D.Lgs. 206/2005)</li>
            </ul>
            <p>TIENDAONLINE si riserva il diritto di rimuovere contenuti non conformi senza preavviso.</p>
          </Section>

          <Section title="6. Limitazioni di responsabilità">
            <p>TIENDAONLINE non è responsabile per:</p>
            <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
              <li style={{ marginBottom: '6px' }}>Interruzioni temporanee del servizio per manutenzione o cause di forza maggiore</li>
              <li style={{ marginBottom: '6px' }}>Perdita di dati causata da eventi fuori dal controllo del Titolare</li>
              <li style={{ marginBottom: '6px' }}>Transazioni commerciali tra l&apos;utente e i propri clienti</li>
              <li style={{ marginBottom: '6px' }}>Malfunzionamenti di WhatsApp o altri servizi di terze parti</li>
            </ul>
          </Section>

          <Section title="7. Proprietà intellettuale">
            <p>Il marchio, il logo, il codice sorgente e tutti i contenuti originali di TIENDAONLINE sono di proprietà esclusiva del Titolare. È vietata qualsiasi riproduzione o utilizzo non autorizzato.</p>
            <p>I contenuti pubblicati dall&apos;utente (prodotti, immagini) rimangono di proprietà dell&apos;utente. L&apos;utente concede a TIENDAONLINE una licenza non esclusiva per visualizzare tali contenuti nell&apos;ambito del servizio.</p>
          </Section>

          <Section title="8. Cancellazione dell'account">
            <p>L&apos;utente può cancellare il proprio account e la propria vetrina in qualsiasi momento dalle impostazioni del pannello di controllo. La cancellazione è immediata e comporta la rimozione definitiva di tutti i dati associati entro 30 giorni.</p>
          </Section>

          <Section title="9. Modifiche ai termini">
            <p>TIENDAONLINE si riserva il diritto di aggiornare i presenti Termini. Gli utenti registrati saranno informati via email con almeno 15 giorni di preavviso. Il continuato utilizzo del servizio dopo la modifica costituisce accettazione dei nuovi Termini.</p>
          </Section>

          <Section title="10. Legge applicabile e foro competente">
            <p>I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente il Tribunale di riferimento del luogo di residenza del Titolare del servizio. Per i consumatori si applica la normativa europea sulla risoluzione alternativa delle controversie (ODR).</p>
          </Section>

          <Section title="11. Risoluzione alternativa delle controversie (ODR)">
            <p>In conformità al Regolamento UE 524/2013, i consumatori residenti nell&apos;UE hanno il diritto di ricorrere alla piattaforma ODR della Commissione Europea per la risoluzione delle controversie online:</p>
            <p><a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: C.green, fontWeight: 600 }}>https://ec.europa.eu/consumers/odr</a></p>
          </Section>

          <Section title="12. Contatti">
            <p>Per qualsiasi domanda sui presenti Termini:</p>
            <p style={{ background: C.greenBg, padding: '14px 18px', borderRadius: '8px', border: `1px solid ${C.greenBorder}` }}>
              <strong>TIENDAONLINE</strong> · sviluppato da David Escalante<br />
              Email: <a href="mailto:davidescalanteitalia@gmail.com" style={{ color: C.green, fontWeight: 600 }}>davidescalanteitalia@gmail.com</a><br />
              Sito: <a href="https://tiendaonline.it" style={{ color: C.green }}>tiendaonline.it</a>
            </p>
          </Section>

        </div>
      </section>

    </PageShell>
  )
}
