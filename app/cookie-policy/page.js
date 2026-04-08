
import PageShell from '../../components/PageShell'
import { C } from '../../lib/theme'

export const metadata = {
  title: 'Cookie Policy — TIENDAONLINE',
  description: 'Informativa sull\'uso dei cookie su tiendaonline.it, conforme alle linee guida del Garante Privacy italiano del 10 giugno 2021.',
}

const Section = ({ title, children, accent }) => (
  <div style={{
    marginBottom: '36px',
    background: C.white,
    padding: '28px',
    borderRadius: '16px',
    border: `1px solid ${accent ? C.greenBorder : C.grayBorder}`,
    borderLeft: accent ? `4px solid ${C.green}` : undefined,
  }}>
    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: C.green, margin: '0 0 14px', paddingBottom: '10px', borderBottom: `2px solid ${C.greenBorder}` }}>
      {title}
    </h2>
    <div style={{ color: C.text, lineHeight: 1.75, fontSize: '0.95rem' }}>
      {children}
    </div>
  </div>
)

const CookieTable = ({ cookies }) => (
  <div style={{ overflowX: 'auto', marginTop: '12px' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
      <thead>
        <tr style={{ background: C.greenBg }}>
          {['Nome', 'Tipo', 'Durata', 'Finalità'].map(h => (
            <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: C.greenDark, borderBottom: `2px solid ${C.greenBorder}` }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {cookies.map((c, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : C.grayBg, borderBottom: `1px solid ${C.grayBorder}` }}>
            <td style={{ padding: '10px 14px', fontWeight: 600, fontFamily: 'monospace', color: C.green }}>{c.name}</td>
            <td style={{ padding: '10px 14px' }}>
              <span style={{ background: c.type === 'Tecnico' ? C.greenBg : '#fef3c7', color: c.type === 'Tecnico' ? C.greenDark : '#92400e', padding: '2px 8px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>{c.type}</span>
            </td>
            <td style={{ padding: '10px 14px', color: C.textMuted }}>{c.duration}</td>
            <td style={{ padding: '10px 14px', color: C.textMuted }}>{c.purpose}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default function CookiePolicyPage() {
  const technicalCookies = [
    { name: 'sb-*-auth-token', type: 'Tecnico', duration: 'Sessione / 1 ora', purpose: 'Token di autenticazione Supabase. Necessario per mantenere la sessione dell\'utente loggato.' },
    { name: 'appLang', type: 'Tecnico', duration: '12 mesi', purpose: 'Memorizza la preferenza di lingua scelta dall\'utente (IT/ES/EN). Non raccoglie dati personali.' },
    { name: '__cf_bm', type: 'Tecnico', duration: '30 minuti', purpose: 'Cookie Cloudflare per la protezione da bot e attacchi DDoS. Necessario per la sicurezza del sito.' },
  ]

  const analyticsCookies = [
    { name: 'ph_*', type: 'Analitico', duration: 'Massimo 13 mesi', purpose: 'PostHog: analisi del comportamento degli utenti in forma aggregata e anonima. Attivato solo con consenso.' },
    { name: 'posthog_session', type: 'Analitico', duration: 'Sessione', purpose: 'PostHog: identifica la sessione di navigazione corrente per l\'analisi del percorso utente.' },
  ]

  return (
    <PageShell>

      {/* Hero */}
      <section className="gradient-bg" style={{ padding: '64px 20px 56px', textAlign: 'center' }}>
        <div style={{ fontSize: '2.6rem', marginBottom: '12px' }}>🍪</div>
        <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-1px' }}>
          Cookie Policy
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.93rem', margin: '0 auto', maxWidth: '600px', lineHeight: 1.6 }}>
          Ultimo aggiornamento: 8 aprile 2026<br />
          Conforme alle Linee Guida del Garante Privacy italiano — Provvedimento del 10 giugno 2021
        </p>
      </section>

      {/* Contenuto */}
      <section style={{ background: '#f8fafc', padding: '48px 20px 80px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* Intro */}
          <div style={{ background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: '14px', padding: '20px 24px', marginBottom: '36px', fontSize: '0.93rem', color: C.textMuted, lineHeight: 1.7 }}>
            La presente Cookie Policy descrive come <strong style={{ color: C.text }}>TIENDAONLINE</strong> (tiendaonline.it) utilizza i cookie e tecnologie simili, in conformità al GDPR (Reg. UE 2016/679), alla Direttiva ePrivacy 2002/58/CE e alle Linee Guida del Garante per la Protezione dei Dati Personali (provvedimento n. 231 del 10 giugno 2021).
          </div>

          <Section title="1. Cosa sono i cookie?" accent>
            <p>I cookie sono piccoli file di testo che i siti web salvano sul dispositivo dell&apos;utente (computer, smartphone, tablet) durante la navigazione. Vengono utilizzati per:</p>
            <ul style={{ paddingLeft: '20px', margin: '10px 0' }}>
              <li style={{ marginBottom: '6px' }}>Mantenere la sessione dell&apos;utente attiva (es. restare connessi dopo il login)</li>
              <li style={{ marginBottom: '6px' }}>Ricordare le preferenze dell&apos;utente (es. la lingua selezionata)</li>
              <li style={{ marginBottom: '6px' }}>Analizzare il traffico e migliorare il servizio (solo con consenso)</li>
            </ul>
            <p>I cookie <strong>non contengono virus</strong> e non possono eseguire programmi sul tuo dispositivo.</p>
          </Section>

          <Section title="2. Cookie tecnici — Sempre attivi (nessun consenso richiesto)">
            <p>I cookie tecnici sono strettamente necessari per il funzionamento del sito e non richiedono il tuo consenso ai sensi dell&apos;art. 122 del D.Lgs. 196/2003 e delle Linee Guida del Garante.</p>
            <CookieTable cookies={technicalCookies} />
            <p style={{ marginTop: '14px', fontSize: '0.88rem', color: C.textMuted }}>
              ℹ️ Questi cookie non raccolgono informazioni che possono identificarti personalmente e non vengono condivisi con terzi a fini pubblicitari.
            </p>
          </Section>

          <Section title="3. Cookie analitici — Solo con il tuo consenso">
            <p>I cookie analitici ci aiutano a capire come gli utenti utilizzano il sito (quali pagine visitano, quanto tempo trascorrono, da dove arrivano). Utilizziamo <strong>PostHog</strong> per questa analisi.</p>
            <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '10px', padding: '14px 18px', margin: '14px 0', fontSize: '0.9rem', color: '#92400e' }}>
              ⚠️ <strong>Attenzione:</strong> questi cookie vengono attivati <strong>solo dopo il tuo consenso esplicito</strong> tramite il banner cookie. Puoi revocare il consenso in qualsiasi momento.
            </div>
            <CookieTable cookies={analyticsCookies} />
            <p style={{ marginTop: '14px', fontSize: '0.88rem', color: C.textMuted }}>
              PostHog è configurato con <strong>IP anonimizzato</strong> e <strong>senza cross-site tracking</strong>. I dati vengono conservati per un massimo di <strong>13 mesi</strong> come stabilito dal Garante.
            </p>
          </Section>

          <Section title="4. Cookie di terze parti">
            <p>Alcuni cookie possono provenire da servizi di terze parti integrati nel sito:</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', marginTop: '10px' }}>
                <thead>
                  <tr style={{ background: C.greenBg }}>
                    {['Servizio', 'Finalità', 'Privacy Policy', 'Consenso'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: C.greenDark, borderBottom: `2px solid ${C.greenBorder}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: `1px solid ${C.grayBorder}` }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>Supabase</td>
                    <td style={{ padding: '10px 14px', color: C.textMuted }}>Autenticazione sicura</td>
                    <td style={{ padding: '10px 14px' }}><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: C.green }}>supabase.com/privacy</a></td>
                    <td style={{ padding: '10px 14px' }}><span style={{ background: C.greenBg, color: C.greenDark, padding: '2px 8px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Non richiesto</span></td>
                  </tr>
                  <tr style={{ background: C.grayBg, borderBottom: `1px solid ${C.grayBorder}` }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>Cloudflare</td>
                    <td style={{ padding: '10px 14px', color: C.textMuted }}>Sicurezza e CDN</td>
                    <td style={{ padding: '10px 14px' }}><a href="https://cloudflare.com/privacypolicy" target="_blank" rel="noopener noreferrer" style={{ color: C.green }}>cloudflare.com/privacypolicy</a></td>
                    <td style={{ padding: '10px 14px' }}><span style={{ background: C.greenBg, color: C.greenDark, padding: '2px 8px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Non richiesto</span></td>
                  </tr>
                  <tr style={{ borderBottom: `1px solid ${C.grayBorder}` }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>PostHog</td>
                    <td style={{ padding: '10px 14px', color: C.textMuted }}>Analisi anonima traffico</td>
                    <td style={{ padding: '10px 14px' }}><a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: C.green }}>posthog.com/privacy</a></td>
                    <td style={{ padding: '10px 14px' }}><span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Richiesto</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="5. Come gestire i cookie — Le tue opzioni">
            <p>Hai pieno controllo sui cookie. Puoi gestirli in questi modi:</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', margin: '16px 0' }}>
              {[
                { icon: '🎛️', title: 'Banner cookie', desc: 'Usa il banner che appare alla prima visita per accettare o rifiutare i cookie non essenziali.' },
                { icon: '🔧', title: 'Impostazioni browser', desc: 'Puoi bloccare o eliminare i cookie dalle impostazioni del tuo browser in qualsiasi momento.' },
                { icon: '📧', title: 'Contattaci', desc: 'Scrivi a davidescalanteitalia@gmail.com per revocare il consenso o richiedere la cancellazione dei dati.' },
              ].map((item, i) => (
                <div key={i} style={{ background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: '12px', padding: '18px' }}>
                  <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>{item.icon}</div>
                  <div style={{ fontWeight: 700, marginBottom: '6px', color: C.text }}>{item.title}</div>
                  <div style={{ fontSize: '0.88rem', color: C.textMuted, lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>

            <p style={{ marginTop: '14px', fontSize: '0.88rem', color: C.textMuted }}>
              <strong>Come disabilitare i cookie nel browser:</strong>{' '}
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" style={{ color: C.green }}>Chrome</a> ·{' '}
              <a href="https://support.mozilla.org/it/kb/Attivare%20e%20disattivare%20i%20cookie" target="_blank" rel="noopener noreferrer" style={{ color: C.green }}>Firefox</a> ·{' '}
              <a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" style={{ color: C.green }}>Safari</a> ·{' '}
              <a href="https://support.microsoft.com/it-it/microsoft-edge" target="_blank" rel="noopener noreferrer" style={{ color: C.green }}>Edge</a>
            </p>
          </Section>

          <Section title="6. Rifiuto dei cookie — Conseguenze">
            <p>Puoi rifiutare i cookie analitici senza alcun impatto sulla tua esperienza. Il sito funzionerà normalmente.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', margin: '14px 0' }}>
              <div style={{ background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontWeight: 700, color: C.greenDark, marginBottom: '8px' }}>✅ Se accetti i cookie analitici</div>
                <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '0.88rem', color: C.textMuted }}>
                  <li>Ci aiuti a migliorare il servizio</li>
                  <li>Nessun dato venduto a terzi</li>
                  <li>Dati sempre anonimi</li>
                </ul>
              </div>
              <div style={{ background: C.grayBg, border: `1px solid ${C.grayBorder}`, borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontWeight: 700, color: C.text, marginBottom: '8px' }}>❌ Se rifiuti i cookie analitici</div>
                <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '0.88rem', color: C.textMuted }}>
                  <li>Il sito funziona normalmente</li>
                  <li>Nessuna funzione limitata</li>
                  <li>Nessun cookie analitico attivato</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="7. Riferimenti normativi">
            <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
              <li style={{ marginBottom: '8px' }}>Regolamento (UE) 2016/679 — GDPR</li>
              <li style={{ marginBottom: '8px' }}>Direttiva 2002/58/CE — ePrivacy</li>
              <li style={{ marginBottom: '8px' }}>D.Lgs. 196/2003 — Codice Privacy italiano (come modificato dal D.Lgs. 101/2018)</li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Garante per la Protezione dei Dati Personali — Linee guida cookie e altri strumenti di tracciamento</strong>, Provvedimento n. 231 del 10 giugno 2021 (<a href="https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876" target="_blank" rel="noopener noreferrer" style={{ color: C.green }}>testo ufficiale</a>)
              </li>
            </ul>
          </Section>

          <Section title="8. Modifiche alla Cookie Policy">
            <p>Ci riserviamo il diritto di aggiornare questa Cookie Policy in qualsiasi momento, in particolare in seguito a modifiche normative o all&apos;introduzione di nuovi strumenti di tracciamento. La data dell&apos;ultimo aggiornamento è indicata in cima a questa pagina.</p>
          </Section>

          {/* CTA contatti */}
          <div style={{ background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: '16px', padding: '28px', textAlign: 'center', marginTop: '12px' }}>
            <p style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px', color: C.text }}>
              📬 Domande sui cookie o sulla tua privacy?
            </p>
            <p style={{ color: C.textMuted, marginBottom: '16px', fontSize: '0.9rem' }}>
              Rispondiamo entro 72 ore. Puoi anche rivolgerti al Garante Privacy: <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" style={{ color: C.green }}>garanteprivacy.it</a>
            </p>
            <a href="mailto:davidescalanteitalia@gmail.com" style={{ background: C.green, color: '#fff', padding: '12px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem' }}>
              davidescalanteitalia@gmail.com
            </a>
          </div>

        </div>
      </section>

    </PageShell>
  )
}
