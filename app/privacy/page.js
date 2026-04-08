import PageShell from '../../components/PageShell'

export const metadata = {
  title: 'Privacy Policy — TIENDAONLINE',
  description: 'Informativa sul trattamento dei dati personali ai sensi del GDPR (Reg. UE 2016/679) e delle linee guida del Garante Privacy italiano.',
}

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

export default function PrivacyPage() {
  return (
    <PageShell>

      {/* Hero */}
      <section className="gradient-bg" style={{
        padding:    '64px 20px 56px',
        textAlign:  'center',
      }}>
        <h1 style={{ color: C.white, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-1px' }}>
          Privacy Policy
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.95rem', margin: 0 }}>
          Ultimo aggiornamento: 8 aprile 2026 · Conforme al GDPR (Reg. UE 2016/679) e al D.Lgs. 196/2003
        </p>
      </section>

      {/* Contenuto */}
      <section style={{ background: C.white, padding: '64px 20px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

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
            La presente informativa descrive come <strong>TIENDAONLINE</strong> (di seguito "il Titolare") raccoglie, utilizza e protegge i dati personali degli utenti che accedono al sito <strong>tiendaonline.it</strong>, in conformità al Regolamento (UE) 2016/679 (GDPR) e al D.Lgs. 196/2003.
          </div>

          <Section title="1. Titolare del trattamento">
            <p>Il Titolare del trattamento dei dati personali è:</p>
            <p style={{ background: C.greenBg, padding: '14px 18px', borderRadius: '8px', border: `1px solid ${C.greenBorder}` }}>
              <strong>TIENDAONLINE</strong><br />
              Sviluppato da David Escalante<br />
              Email: <a href="mailto:davidescalanteitalia@gmail.com" style={{ color: C.green }}>davidescalanteitalia@gmail.com</a><br />
              Telefono: <a href="tel:+393717701185" style={{ color: C.green }}>+39 371 770 1185</a>
            </p>
          </Section>

          <Section title="2. Dati raccolti">
            <p>In base ai servizi utilizzati, potremmo raccogliere le seguenti categorie di dati:</p>
            <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
              <li style={{ marginBottom: '6px' }}><strong>Dati di registrazione:</strong> nome, cognome, indirizzo email, numero di telefono (WhatsApp).</li>
              <li style={{ marginBottom: '6px' }}><strong>Dati del negozio:</strong> nome del negozio, prodotti, prezzi, immagini caricate.</li>
              <li style={{ marginBottom: '6px' }}><strong>Dati di navigazione:</strong> indirizzo IP, tipo di browser, pagine visitate, orari di accesso.</li>
              <li style={{ marginBottom: '6px' }}><strong>Dati degli ordini:</strong> prodotti selezionati, quantità, messaggi inviati tramite WhatsApp.</li>
            </ul>
            <p>I dati degli ordini vengono trasmessi direttamente tramite WhatsApp e non vengono memorizzati sui nostri server.</p>
          </Section>

          <Section title="3. Finalità e base giuridica del trattamento">
            <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
              <li style={{ marginBottom: '8px' }}><strong>Erogazione del servizio</strong> (art. 6.1.b GDPR): gestione dell'account, creazione del negozio online, invio degli ordini via WhatsApp.</li>
              <li style={{ marginBottom: '8px' }}><strong>Obblighi legali</strong> (art. 6.1.c GDPR): adempimento di obblighi fiscali e normativi.</li>
              <li style={{ marginBottom: '8px' }}><strong>Legittimo interesse</strong> (art. 6.1.f GDPR): miglioramento della piattaforma, sicurezza del servizio, prevenzione di abusi.</li>
              <li style={{ marginBottom: '8px' }}><strong>Consenso</strong> (art. 6.1.a GDPR): invio di comunicazioni promozionali, se esplicitamente accettato.</li>
            </ul>
          </Section>

          <Section title="4. Conservazione dei dati">
            <p>I dati personali vengono conservati per il tempo strettamente necessario alle finalità per cui sono stati raccolti:</p>
            <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
              <li style={{ marginBottom: '6px' }}>Dati dell&apos;account: fino alla cancellazione dell&apos;account, e per 12 mesi successivi per obblighi legali.</li>
              <li style={{ marginBottom: '6px' }}>Dati di navigazione: massimo 12 mesi.</li>
              <li style={{ marginBottom: '6px' }}>Comunicazioni email: fino alla revoca del consenso.</li>
            </ul>
          </Section>

          <Section title="5. Condivisione dei dati con terze parti">
            <p>I dati non vengono venduti né ceduti a terzi per finalità commerciali. Potremmo condividerli con:</p>
            <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
              <li style={{ marginBottom: '6px' }}><strong>Supabase Inc.</strong> (USA) – database e autenticazione. Trattamento basato su Clausole Contrattuali Standard UE.</li>
              <li style={{ marginBottom: '6px' }}><strong>Coolify / Hetzner</strong> – infrastruttura di hosting con server localizzati in Europa (EU-West-2).</li>
              <li style={{ marginBottom: '6px' }}><strong>PostHog Inc.</strong> – analisi del traffico in forma anonima e aggregata. I dati vengono anonimizzati prima dell&apos;invio. <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: C.green }}>Privacy Policy PostHog</a></li>
              <li style={{ marginBottom: '6px' }}><strong>Sentry (Functional Software Inc.)</strong> – monitoraggio degli errori tecnici. Non raccoglie dati personali degli utenti finali. <a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer" style={{ color: C.green }}>Privacy Policy Sentry</a></li>
              <li style={{ marginBottom: '6px' }}>Autorità competenti (Garante Privacy, Autorità giudiziaria), ove richiesto dalla legge.</li>
            </ul>
          </Section>

          <Section title="6. Diritti dell'interessato">
            <p>In qualità di interessato, hai il diritto di:</p>
            <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
              <li style={{ marginBottom: '6px' }}>Accedere ai tuoi dati personali (art. 15 GDPR)</li>
              <li style={{ marginBottom: '6px' }}>Rettificare dati inesatti (art. 16 GDPR)</li>
              <li style={{ marginBottom: '6px' }}>Richiedere la cancellazione dei dati ("diritto all&apos;oblio", art. 17 GDPR)</li>
              <li style={{ marginBottom: '6px' }}>Limitare il trattamento (art. 18 GDPR)</li>
              <li style={{ marginBottom: '6px' }}>Portabilità dei dati (art. 20 GDPR)</li>
              <li style={{ marginBottom: '6px' }}>Opporsi al trattamento (art. 21 GDPR)</li>
            </ul>
            <p>Per esercitare i tuoi diritti, scrivi a: <a href="mailto:davidescalanteitalia@gmail.com" style={{ color: C.green, fontWeight: 600 }}>davidescalanteitalia@gmail.com</a></p>
            <p>Hai inoltre il diritto di presentare reclamo al Garante per la protezione dei dati personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" style={{ color: C.green }}>www.garanteprivacy.it</a>).</p>
          </Section>

          <Section title="7. Cookie">
            <p>Il sito utilizza cookie tecnici essenziali e, previo consenso, cookie analitici. I cookie analitici (PostHog) vengono attivati <strong>solo dopo il consenso esplicito</strong> dell&apos;utente, in conformità alle linee guida del Garante del 10 giugno 2021.</p>
            <p style={{ marginTop: '10px' }}>Per informazioni dettagliate sui cookie utilizzati, sulle loro finalità e su come gestirli o revocare il consenso, consulta la nostra <a href="/cookie-policy" style={{ color: C.green, fontWeight: 600 }}>Cookie Policy</a>.</p>
          </Section>

          <Section title="7b. Conservazione dei dati analitici">
            <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
              <li style={{ marginBottom: '6px' }}>Cookie tecnici (sessione, lingua): durata della sessione o max 12 mesi</li>
              <li style={{ marginBottom: '6px' }}>Cookie analitici PostHog: <strong>massimo 13 mesi</strong> (limite imposto dal Garante Privacy italiano, provvedimento del 10/06/2021)</li>
              <li style={{ marginBottom: '6px' }}>Dati di log tecnici: massimo 12 mesi</li>
            </ul>
          </Section>

          <Section title="8. Sicurezza dei dati">
            <p>Adottiamo misure tecniche e organizzative adeguate per proteggere i dati personali contro accessi non autorizzati, perdita o divulgazione accidentale, tra cui: connessioni HTTPS, cifratura dei dati sensibili e accesso limitato ai sistemi di produzione.</p>
          </Section>

          <Section title="9. Modifiche alla presente informativa">
            <p>Il Titolare si riserva il diritto di modificare la presente informativa. Le modifiche saranno pubblicate su questa pagina con aggiornamento della data in alto. In caso di modifiche sostanziali, gli utenti registrati saranno informati via email.</p>
          </Section>

        </div>
      </section>

    </PageShell>
  )
}
