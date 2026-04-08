'use client'

import { useState, useEffect } from 'react'
import { C } from '../lib/theme'
import { useLang } from './LanguageProvider'

const STORAGE_KEY = 'tiendaonline_cookie_consent'

// Textos en 3 idiomas
const T = {
  it: {
    title: '🍪 Utilizziamo i cookie',
    desc: 'Usiamo cookie tecnici (necessari) e cookie analitici (opzionali) per migliorare il servizio. Puoi accettare tutto, rifiutare i cookie non essenziali o scegliere manualmente. Per maggiori dettagli consulta la nostra',
    cookiePolicy: 'Cookie Policy',
    rejectAll: 'Rifiuta tutto',
    manage: 'Gestisci preferenze',
    acceptAll: 'Accetta tutto',
    savePrefs: 'Salva preferenze',
    techTitle: 'Cookie tecnici',
    techDesc: 'Sempre attivi. Necessari per il funzionamento del sito (sessione, lingua). Non richiedono consenso.',
    analyticsTitle: 'Cookie analitici (PostHog)',
    analyticsDesc: 'Ci aiutano a capire come viene usato il sito, in forma anonima e aggregata. Nessun dato personale venduto.',
    required: 'Sempre attivi',
    panelTitle: 'Gestisci le tue preferenze',
    garante: 'Conforme alle linee guida Garante Privacy — Provv. n. 231 del 10/06/2021',
  },
  es: {
    title: '🍪 Usamos cookies',
    desc: 'Usamos cookies técnicas (necesarias) y analíticas (opcionales) para mejorar el servicio. Puedes aceptar todo, rechazar las no esenciales o elegir manualmente. Para más detalles consulta nuestra',
    cookiePolicy: 'Política de Cookies',
    rejectAll: 'Rechazar todo',
    manage: 'Gestionar preferencias',
    acceptAll: 'Aceptar todo',
    savePrefs: 'Guardar preferencias',
    techTitle: 'Cookies técnicas',
    techDesc: 'Siempre activas. Necesarias para el funcionamiento del sitio (sesión, idioma). No requieren consentimiento.',
    analyticsTitle: 'Cookies analíticas (PostHog)',
    analyticsDesc: 'Nos ayudan a entender cómo se usa el sitio, de forma anónima y agregada. Ningún dato personal vendido.',
    required: 'Siempre activas',
    panelTitle: 'Gestiona tus preferencias',
    garante: 'Conforme a las directrices del Garante Privacy italiano — Prov. n. 231 del 10/06/2021',
  },
  en: {
    title: '🍪 We use cookies',
    desc: 'We use technical (necessary) and analytics (optional) cookies to improve our service. You can accept all, reject non-essential ones or choose manually. For more details see our',
    cookiePolicy: 'Cookie Policy',
    rejectAll: 'Reject all',
    manage: 'Manage preferences',
    acceptAll: 'Accept all',
    savePrefs: 'Save preferences',
    techTitle: 'Technical cookies',
    techDesc: 'Always active. Required for the site to work (session, language). No consent needed.',
    analyticsTitle: 'Analytics cookies (PostHog)',
    analyticsDesc: 'Help us understand how the site is used, anonymously and in aggregate. No personal data sold.',
    required: 'Always active',
    panelTitle: 'Manage your preferences',
    garante: 'Compliant with Italian Garante Privacy guidelines — Prov. n. 231 of 10/06/2021',
  },
}

export default function CookieBanner() {
  const [visible, setVisible]       = useState(false)
  const [panelOpen, setPanelOpen]   = useState(false)
  const [analytics, setAnalytics]   = useState(false)
  const { lang } = useLang()


  useEffect(() => {
    // Mostrar banner solo si no hay consentimiento previo
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      setTimeout(() => setVisible(true), 800)
    } else {
      // Si ya aceptó analytics, activar PostHog
      const prefs = JSON.parse(saved)
      if (prefs.analytics) activatePostHog()
    }
  }, [])

  const activatePostHog = () => {
    if (typeof window !== 'undefined' && window.__posthog_loaded) return
    // PostHog se cargará cuando esté integrado
    window.dispatchEvent(new CustomEvent('cookieConsent', { detail: { analytics: true } }))
    window.__posthog_loaded = true
  }

  const saveConsent = (prefs) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prefs, date: new Date().toISOString() }))
    if (prefs.analytics) activatePostHog()
    setVisible(false)
    setPanelOpen(false)
  }

  const handleAcceptAll  = () => saveConsent({ analytics: true, technical: true })
  const handleRejectAll  = () => saveConsent({ analytics: false, technical: true })
  const handleSavePrefs  = () => saveConsent({ analytics, technical: true })

  const t = T[lang] || T.it

  if (!visible) return null

  // ── Estilos compartidos ──────────────────────────────────────────
  const btnBase = {
    padding: '11px 20px',
    borderRadius: '10px',
    fontWeight: 700,
    fontSize: '0.88rem',
    cursor: 'pointer',
    transition: 'all 0.18s',
    border: 'none',
    flex: 1,
    minWidth: '110px',
  }

  return (
    <>
      {/* ── Overlay oscuro cuando panel está abierto ── */}
      {panelOpen && (
        <div
          onClick={() => setPanelOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9998, backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* ── Panel de preferencias ── */}
      {panelOpen && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '560px',
          background: '#fff',
          borderRadius: '20px 20px 0 0',
          padding: '28px 24px 32px',
          zIndex: 9999,
          boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
          animation: 'slideUp 0.25s ease',
        }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: 800, color: C.text }}>{t.panelTitle}</h3>

          {/* Cookie técnicas */}
          <div style={{ background: C.grayBg, borderRadius: '12px', padding: '16px', marginBottom: '12px', border: `1px solid ${C.grayBorder}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: C.text }}>{t.techTitle}</span>
              <span style={{ background: C.greenBg, color: C.greenDark, padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>{t.required}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: C.textMuted, lineHeight: 1.5 }}>{t.techDesc}</p>
          </div>

          {/* Cookie analíticas */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: `1.5px solid ${analytics ? C.green : C.grayBorder}`, transition: 'border-color 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: C.text }}>{t.analyticsTitle}</span>
              {/* Toggle switch */}
              <button
                onClick={() => setAnalytics(!analytics)}
                style={{
                  width: '44px', height: '24px',
                  borderRadius: '12px',
                  background: analytics ? C.green : C.grayBorder,
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
                aria-checked={analytics}
                role="switch"
              >
                <span style={{
                  position: 'absolute',
                  top: '3px',
                  left: analytics ? '23px' : '3px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: C.textMuted, lineHeight: 1.5 }}>{t.analyticsDesc}</p>
          </div>

          <button
            onClick={handleSavePrefs}
            style={{ ...btnBase, background: C.green, color: '#fff', width: '100%', padding: '13px', fontSize: '0.95rem', boxShadow: `0 4px 14px rgba(5,150,105,0.3)` }}
          >
            {t.savePrefs}
          </button>
        </div>
      )}

      {/* ── Banner principal ── */}
      {!panelOpen && (
        <div style={{
          position: 'fixed',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '720px',
          background: '#fff',
          borderRadius: '18px',
          padding: '20px 22px',
          zIndex: 9999,
          boxShadow: '0 8px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)',
          animation: 'fadeUp 0.3s ease',
        }}>

          {/* Cabecera */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
            <div style={{ fontSize: '1.5rem', flexShrink: 0, marginTop: '2px' }}>🍪</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 5px', fontWeight: 800, fontSize: '1rem', color: C.text }}>{t.title.replace('🍪 ', '')}</p>
              <p style={{ margin: 0, fontSize: '0.83rem', color: C.textMuted, lineHeight: 1.55 }}>
                {t.desc}{' '}
                <a href="/cookie-policy" style={{ color: C.green, fontWeight: 600 }}>{t.cookiePolicy}</a>.
              </p>
            </div>
          </div>

          {/* Botones — todos igual de visibles (requisito Garante) */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleRejectAll}
              style={{ ...btnBase, background: C.grayBg, color: C.text, border: `1.5px solid ${C.grayBorder}` }}
            >
              {t.rejectAll}
            </button>
            <button
              onClick={() => setPanelOpen(true)}
              style={{ ...btnBase, background: C.grayBg, color: C.text, border: `1.5px solid ${C.grayBorder}` }}
            >
              {t.manage}
            </button>
            <button
              onClick={handleAcceptAll}
              style={{ ...btnBase, background: C.green, color: '#fff', boxShadow: `0 4px 12px rgba(5,150,105,0.3)` }}
            >
              {t.acceptAll}
            </button>
          </div>

          {/* Nota Garante */}
          <p style={{ margin: '10px 0 0', fontSize: '0.73rem', color: C.grayText, textAlign: 'center' }}>
            🔒 {t.garante}
          </p>
        </div>
      )}

      {/* Animaciones CSS */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(100%); }
          to   { transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  )
}
