'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../components/LanguageProvider'
import { DICTIONARY } from '../../lib/dictionaries'

import { C } from '../../lib/theme'

export default function LoginPage() {
  const router = useRouter()
  const { lang, changeLang } = useLang()
  const dict = DICTIONARY[lang]

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (authError) {
      setError(dict.erroreLogin)
      setLoading(false)
      return
    }

    if (data.user?.email === 'davidescalanteitalia@gmail.com') {
      router.push('/administrador')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900 min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 mesh-gradient relative overflow-hidden">
      
      {/* Animated Orbs */}
      <div className="hero-glow top-[10%] left-[5%] bg-emerald-500/20" />
      <div className="hero-glow bottom-[10%] right-[10%] bg-blue-500/20" />

      <div className="relative z-10 w-full max-w-[420px] bg-white/90 backdrop-blur-xl rounded-[32px] p-8 sm:p-10 shadow-2xl border border-white/40">
        {/* Language selector */}
        <div className="flex justify-end gap-1.5 mb-8">
          {['it', 'es', 'en'].map(l => (
            <button key={l} onClick={() => changeLang(l)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${lang === l ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-emerald-600 border border-slate-200'}`}>
              {l}
            </button>
          ))}
        </div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <span className="text-2xl">🛍️</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">{dict.bentornato}</h1>
          <p className="text-slate-500 text-sm font-medium">{dict.accediAlPannello}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">{dict.emailLabel}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={dict.emailPlaceholder} required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium placeholder:text-slate-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">{dict.passwordLabel}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={dict.passwordPlaceholder}
                required
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors text-lg"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className={`w-full py-4 rounded-xl font-black text-sm transition-all shadow-xl mt-2 ${loading ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'glow-btn bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20'}`}>
            {loading ? dict.verificando : dict.accediBtn}
          </button>
        </form>

        <div className="text-center mt-8 text-sm font-medium text-slate-500">
          {dict.nonHaiAccount}{' '}
          <a href="/register" className="text-emerald-600 font-bold hover:text-emerald-500 transition-colors">{dict.creaVetrinaLink}</a>
        </div>
      </div>

      {/* Bottom info */}
      <div className="relative z-10 mt-8 flex flex-wrap justify-center gap-4 sm:gap-6">
        {[
          { label: dict.footerPrivacy || 'Privacy Policy', href: '/privacy' },
          { label: dict.footerTerms   || 'Termini',        href: '/terms'   },
          { label: dict.footerContact || 'Contatti',       href: '/contatti'},
        ].map((link, i) => (
          <a key={i} href={link.href} className="text-emerald-50/70 hover:text-white text-xs font-semibold transition-colors">
            {link.label}
          </a>
        ))}
      </div>
      <p className="relative z-10 text-emerald-50/40 text-[10px] sm:text-xs font-semibold mt-4 text-center">
        © 2026 TIENDAONLINE · tiendaonline.it
      </p>
    </div>
  )
}
