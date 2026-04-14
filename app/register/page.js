'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import PageShell from '../../components/PageShell'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../components/LanguageProvider'
import { DICTIONARY } from '../../lib/dictionaries'
import {
  CheckCircle2, ChevronRight, ChevronLeft, Store,
  Briefcase, User, Sparkles, Eye, EyeOff,
  Globe, Phone, Mail, Lock, ShoppingBag
} from 'lucide-react'

/* ─── Datos de cada mini-paso ──────────────────────────────── */
const STEPS_META = [
  {
    field:   'nombre',
    emoji:   '🏪',
    titulo:  '¿Cómo se llama tu negocio?',
    desc:    'Este es el nombre que verán tus clientes cuando visiten tu tienda. Puede ser el nombre de tu local, tu marca o cómo te conocen.',
    ejemplo: 'Ej: Pizzería Mario, Boutique Elena, Ferretería López...',
    tip:     null,
  },
  {
    field:   'subdominio',
    emoji:   '🌐',
    titulo:  '¿Cuál será la dirección de tu tienda?',
    desc:    'Esta es la dirección (link) que compartirás con tus clientes para que puedan ver y comprar tus productos.',
    ejemplo: null,
    tip:     '⚠️ Esta dirección es permanente y no se puede cambiar una vez creada la tienda. ¡Tómate un momento para elegir bien!',
  },
  {
    field:   'whatsapp',
    emoji:   '📱',
    titulo:  '¿Cuál es tu número de WhatsApp?',
    desc:    'Por aquí recibirás los pedidos de tus clientes. Cuando alguien compre en tu tienda, te llegará un mensaje de WhatsApp con todos los detalles del pedido.',
    ejemplo: 'Ej: +39 333 123 4567  /  +34 600 123 456',
    tip:     '💡 Incluye el código de tu país. Por ejemplo: +39 para Italia, +34 para España. No te preocupes, puedes cambiarlo más adelante.',
  },
  {
    field:   'email',
    emoji:   '📧',
    titulo:  '¿Cuál es tu correo electrónico?',
    desc:    'Este correo será tu usuario para entrar a la plataforma. También lo usaremos para enviarte avisos importantes sobre tu cuenta y tu tienda.',
    ejemplo: 'Ej: tunombre@gmail.com',
    tip:     '💡 Usaremos este correo para comunicarnos contigo. Asegúrate de que sea uno que revisas con frecuencia.',
  },
  {
    field:   'password',
    emoji:   '🔑',
    titulo:  'Crea tu contraseña',
    desc:    'Elige una contraseña que sea fácil de recordar para ti, pero difícil de adivinar para otros. Puede ser una frase corta o una mezcla de palabras y números.',
    ejemplo: 'Ej: MiTienda2024  /  PizzaMario!',
    tip:     '💡 Mínimo 6 caracteres. Cuanto más larga, más segura.',
  },
]

const SECTORES = [
  'Moda y Ropa', 'Alimentación y Bebidas', 'Electrónica',
  'Salud y Belleza', 'Servicios', 'Otro'
]
const TIPOS_VENDEDOR = [
  { id: 'particular', label: 'Particular',  icon: User,     desc: 'Vendes cosas por tu cuenta, sin empresa.' },
  { id: 'autonomo',   label: 'Autónomo',    icon: Briefcase, desc: 'Trabajas de forma independiente o como freelance.' },
  { id: 'empresa',    label: 'Empresa',     icon: Store,     desc: 'Tienes un negocio formalmente registrado.' },
]

/* ─── Fortaleza de contraseña ───────────────────────────────── */
function getPasswordStrength(pwd) {
  if (!pwd)            return { score: 0, label: '',        color: 'bg-slate-200' }
  if (pwd.length < 6)  return { score: 1, label: 'Muy corta', color: 'bg-rose-400' }
  if (pwd.length < 8)  return { score: 2, label: 'Débil',    color: 'bg-amber-400' }
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return { score: 4, label: 'Fuerte ✓', color: 'bg-emerald-500' }
  return { score: 3, label: 'Media', color: 'bg-blue-400' }
}

/* ═══════════════════════════════════════════════════════════ */
export default function RegisterPage() {
  const router = useRouter()
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']
  const inputRef = useRef(null)

  // micro-paso: 0-4 = campos, 5 = sector/tipo, 6 = éxito
  const [step,           setStep]           = useState(0)
  const [direction,      setDirection]      = useState(1)   // 1 = adelante, -1 = atrás
  const [loading,        setLoading]        = useState(false)
  const [showPassword,   setShowPassword]   = useState(false)
  const [error,          setError]          = useState('')
  const [fieldError,     setFieldError]     = useState('')
  const [subdomainStatus,setSubdomainStatus]= useState('idle')

  const [form, setForm] = useState({
    nombre: '', subdominio: '', whatsapp: '',
    email: '', password: '', sector: '', tipo_vendedor: ''
  })

  /* Focus automático al cambiar de paso */
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 350)
    return () => clearTimeout(t)
  }, [step])

  /* Validación de subdominio en tiempo real */
  useEffect(() => {
    if (step !== 1) return
    if (!form.subdominio || form.subdominio.length < 3) {
      setSubdomainStatus('idle'); return
    }
    const timer = setTimeout(async () => {
      setSubdomainStatus('checking')
      try {
        const res  = await fetch(`/api/check-subdominio?subdominio=${form.subdominio}`)
        const data = await res.json()
        setSubdomainStatus(data.available ? 'available' : 'taken')
        if (!data.available) setFieldError('Ese nombre ya está en uso. Prueba con otro.')
        else                 setFieldError('')
      } catch { setSubdomainStatus('idle') }
    }, 500)
    return () => clearTimeout(timer)
  }, [form.subdominio, step])

  /* ── handleChange ─────────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'subdominio') {
      setForm(f => ({ ...f, subdominio: value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
    setFieldError('')
    setError('')
  }

  /* ── Validación individual ────────────────────────────────── */
  const validateCurrentStep = () => {
    const { nombre, subdominio, whatsapp, email, password } = form
    if (step === 0) {
      if (!nombre.trim()) { setFieldError('Por favor escribe el nombre de tu negocio.'); return false }
    }
    if (step === 1) {
      if (!subdominio.trim())      { setFieldError('Debes elegir una dirección para tu tienda.'); return false }
      if (subdominio.length < 3)   { setFieldError('Debe tener al menos 3 letras o números.'); return false }
      if (subdomainStatus === 'taken') { setFieldError('Ese nombre ya está en uso. Prueba con otro.'); return false }
      if (subdomainStatus === 'checking') { setFieldError('Espera un momento, estamos verificando...'); return false }
    }
    if (step === 2) {
      if (!whatsapp.trim()) { setFieldError('Escribe tu número de WhatsApp.'); return false }
      if (!/^\+?[0-9\s\-]{7,}$/.test(whatsapp)) { setFieldError('El número no parece válido. Incluye el código del país, ej: +39 333 123 4567'); return false }
    }
    if (step === 3) {
      if (!email.trim())            { setFieldError('Escribe tu correo electrónico.'); return false }
      if (!/\S+@\S+\.\S+/.test(email)) { setFieldError('El correo no parece válido. Ej: nombre@gmail.com'); return false }
    }
    if (step === 4) {
      if (!password)           { setFieldError('Debes crear una contraseña.'); return false }
      if (password.length < 6) { setFieldError('La contraseña debe tener al menos 6 caracteres.'); return false }
    }
    return true
  }

  /* ── Avanzar paso ─────────────────────────────────────────── */
  const handleNext = (e) => {
    e?.preventDefault()
    if (!validateCurrentStep()) return
    setDirection(1)
    setFieldError('')
    setStep(s => s + 1)
  }

  const handleBack = () => {
    setDirection(-1)
    setFieldError('')
    setError('')
    setStep(s => s - 1)
  }

  /* ── Enter para avanzar ───────────────────────────────────── */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && step <= 4) handleNext(e)
  }

  /* ── Submit final ─────────────────────────────────────────── */
  const handleRegister = async () => {
    if (!form.sector || !form.tipo_vendedor) {
      setError('Por favor selecciona tu sector y tipo de vendedor para continuar.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        const msgs = {
          subdomain_taken: 'La dirección web ya está en uso. Vuelve atrás y elige otra.',
          whatsapp_taken:  'Ese número de WhatsApp ya está registrado.',
          email_taken:     'Ese correo ya tiene una cuenta. ¿Quieres iniciar sesión?',
          user_error:      'Hubo un problema al crear tu cuenta. Intenta con otro correo.',
          store_error:     'Hubo un problema al crear tu tienda. Inténtalo de nuevo.',
          unexpected:      'Algo salió mal. Por favor inténtalo de nuevo.',
        }
        setError(msgs[data.error] || msgs.unexpected)
        setLoading(false)
        return
      }

      await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
      setStep(6)
      setLoading(false)
    } catch {
      setError('Algo salió mal. Por favor inténtalo de nuevo.')
      setLoading(false)
    }
  }

  /* ── Porcentaje de progreso ───────────────────────────────── */
  const totalSteps = 6 // pasos 0-5 (sin contar éxito)
  const progress   = step >= totalSteps ? 100 : Math.round((step / totalSteps) * 100)

  const pwStrength = getPasswordStrength(form.password)

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <PageShell>
      <section className="bg-slate-50 min-h-[calc(100vh-64px)] flex items-center justify-center p-5">
        <div className="w-full max-w-md">

          {/* ── Card ── */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">

            {/* Barra de progreso */}
            {step < 6 && (
              <div className="h-1.5 bg-slate-100 w-full">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <div className="p-8 sm:p-10">

              {/* ════ PASOS 0–4: Campos uno a uno ════ */}
              {step >= 0 && step <= 4 && (() => {
                const meta = STEPS_META[step]
                const currentField = meta.field
                const isSubdominio = currentField === 'subdominio'
                const isPassword   = currentField === 'password'
                const isWhatsapp   = currentField === 'whatsapp'

                return (
                  <div key={step} className="animate-in slide-in-from-right-4 duration-300">

                    {/* Contador discreto */}
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                      Paso {step + 1} de 6
                    </div>

                    {/* Emoji + Título */}
                    <div className="text-5xl mb-4">{meta.emoji}</div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-3 leading-snug">
                      {meta.titulo}
                    </h1>

                    {/* Descripción */}
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                      {meta.desc}
                    </p>

                    {/* ── Input: Subdominio especial ── */}
                    {isSubdominio && (
                      <div className="mb-4">
                        {/* Preview visual */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-3 flex items-center gap-2 flex-wrap">
                          <span className="text-slate-400 text-sm">Tu tienda quedará en:</span>
                          <span className="font-bold text-slate-700 text-sm break-all">
                            https://<span className="text-blue-600">{form.subdominio || 'tu-tienda'}</span>.tiendaonline.it
                          </span>
                        </div>

                        {/* Input compuesto */}
                        <div className={`flex items-center border-2 rounded-xl overflow-hidden transition-all duration-200 ${
                          fieldError           ? 'border-rose-400 bg-rose-50' :
                          subdomainStatus === 'available' ? 'border-emerald-400 bg-emerald-50' :
                          'border-slate-200 bg-white focus-within:border-blue-400'
                        }`}>
                          <Globe size={16} className="ml-4 text-slate-400 shrink-0" />
                          <input
                            ref={inputRef}
                            type="text"
                            name="subdominio"
                            value={form.subdominio}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            placeholder="mi-tienda"
                            className="flex-1 py-3.5 px-3 text-slate-800 font-semibold outline-none bg-transparent text-base min-w-0"
                          />
                          <span className="text-slate-400 text-sm pr-4 shrink-0 flex items-center gap-2">
                            .tiendaonline.it
                            {subdomainStatus === 'checking'  && <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                            {subdomainStatus === 'available' && <CheckCircle2 size={16} className="text-emerald-500" />}
                          </span>
                        </div>

                        {subdomainStatus === 'available' && !fieldError && (
                          <p className="text-emerald-600 text-xs font-semibold mt-2 flex items-center gap-1">
                            <CheckCircle2 size={13} /> ¡Esta dirección está disponible!
                          </p>
                        )}
                      </div>
                    )}

                    {/* ── Input: Contraseña especial ── */}
                    {isPassword && (
                      <div className="mb-4">
                        <div className={`flex items-center border-2 rounded-xl overflow-hidden transition-all duration-200 ${
                          fieldError ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus-within:border-blue-400 bg-white'
                        }`}>
                          <Lock size={16} className="ml-4 text-slate-400 shrink-0" />
                          <input
                            ref={inputRef}
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Mínimo 6 caracteres"
                            className="flex-1 py-3.5 px-3 text-slate-800 outline-none bg-transparent text-base"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            className="pr-4 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>

                        {/* Barra de fortaleza */}
                        {form.password && (
                          <div className="mt-3">
                            <div className="flex gap-1.5 mb-1.5">
                              {[1,2,3,4].map(i => (
                                <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i <= pwStrength.score ? pwStrength.color : 'bg-slate-200'}`} />
                              ))}
                            </div>
                            <p className={`text-xs font-semibold ${
                              pwStrength.score <= 1 ? 'text-rose-500' :
                              pwStrength.score === 2 ? 'text-amber-500' :
                              pwStrength.score === 3 ? 'text-blue-500' : 'text-emerald-600'
                            }`}>{pwStrength.label}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Input: WhatsApp ── */}
                    {isWhatsapp && (
                      <div className={`flex items-center border-2 rounded-xl overflow-hidden mb-4 transition-all duration-200 ${
                        fieldError ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus-within:border-blue-400 bg-white'
                      }`}>
                        <Phone size={16} className="ml-4 text-slate-400 shrink-0" />
                        <input
                          ref={inputRef}
                          type="tel"
                          name="whatsapp"
                          value={form.whatsapp}
                          onChange={handleChange}
                          onKeyDown={handleKeyDown}
                          placeholder="+39 333 123 4567"
                          className="flex-1 py-3.5 px-3 text-slate-800 outline-none bg-transparent text-base"
                        />
                      </div>
                    )}

                    {/* ── Input: Email ── */}
                    {currentField === 'email' && (
                      <div className={`flex items-center border-2 rounded-xl overflow-hidden mb-4 transition-all duration-200 ${
                        fieldError ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus-within:border-blue-400 bg-white'
                      }`}>
                        <Mail size={16} className="ml-4 text-slate-400 shrink-0" />
                        <input
                          ref={inputRef}
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          onKeyDown={handleKeyDown}
                          placeholder="tunombre@gmail.com"
                          className="flex-1 py-3.5 px-3 text-slate-800 outline-none bg-transparent text-base"
                        />
                      </div>
                    )}

                    {/* ── Input: Nombre ── */}
                    {currentField === 'nombre' && (
                      <div className={`flex items-center border-2 rounded-xl overflow-hidden mb-4 transition-all duration-200 ${
                        fieldError ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus-within:border-blue-400 bg-white'
                      }`}>
                        <ShoppingBag size={16} className="ml-4 text-slate-400 shrink-0" />
                        <input
                          ref={inputRef}
                          type="text"
                          name="nombre"
                          value={form.nombre}
                          onChange={handleChange}
                          onKeyDown={handleKeyDown}
                          placeholder={meta.ejemplo}
                          className="flex-1 py-3.5 px-3 text-slate-800 outline-none bg-transparent text-base"
                        />
                      </div>
                    )}

                    {/* Error */}
                    {fieldError && (
                      <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3 mb-4">
                        <span className="text-lg leading-none mt-0.5">⚠️</span>
                        <span className="leading-relaxed">{fieldError}</span>
                      </div>
                    )}

                    {/* Ejemplo / Tip */}
                    {meta.tip && (
                      <div className={`border rounded-xl px-4 py-3 mb-6 text-sm leading-relaxed ${
                        currentField === 'subdominio'
                          ? 'bg-amber-50 border-amber-200 text-amber-800 font-medium'
                          : 'bg-blue-50 border-blue-100 text-slate-600'
                      }`}>
                        {meta.tip}
                      </div>
                    )}
                    {!meta.tip && meta.ejemplo && currentField !== 'nombre' && !isSubdominio && (
                      <p className="text-slate-400 text-xs mb-6">{meta.ejemplo}</p>
                    )}

                    {/* Botones */}
                    <div className="flex gap-3 mt-2">
                      {step > 0 && (
                        <button
                          type="button"
                          onClick={handleBack}
                          className="flex items-center gap-1.5 px-5 py-3.5 rounded-xl font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
                        >
                          <ChevronLeft size={16} /> Atrás
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-blue-500/25 transition-all"
                      >
                        {step === 4 ? 'Casi listo' : 'Siguiente'} <ChevronRight size={18} />
                      </button>
                    </div>

                    {step === 0 && (
                      <p className="text-center text-sm text-slate-400 mt-5">
                        ¿Ya tienes cuenta?{' '}
                        <a href="/login" className="text-blue-600 font-bold hover:underline">Inicia sesión</a>
                      </p>
                    )}
                  </div>
                )
              })()}

              {/* ════ PASO 5: Sector y Tipo de vendedor ════ */}
              {step === 5 && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                    Paso 6 de 6 — ¡Último paso!
                  </div>

                  <div className="text-5xl mb-4">🛍️</div>
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-1">
                    Cuéntanos un poco más
                  </h1>
                  <p className="text-slate-500 text-sm mb-7 leading-relaxed">
                    Esto nos ayuda a preparar tu tienda según lo que vas a vender.
                  </p>

                  {/* ¿Qué vendes? */}
                  <div className="mb-6">
                    <p className="text-sm font-bold text-slate-700 mb-2">¿Qué vas a vender?</p>
                    <select
                      name="sector"
                      value={form.sector}
                      onChange={handleChange}
                      className="w-full p-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-700 outline-none focus:border-blue-400 transition-colors text-sm"
                    >
                      <option value="" disabled>Elige una categoría...</option>
                      {SECTORES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Tipo vendedor */}
                  <div className="mb-6">
                    <p className="text-sm font-bold text-slate-700 mb-3">¿Cómo describes tu negocio?</p>
                    <div className="flex flex-col gap-2.5">
                      {TIPOS_VENDEDOR.map(t => {
                        const Icon = t.icon
                        const active = form.tipo_vendedor === t.id
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, tipo_vendedor: t.id }))}
                            className={`p-4 rounded-xl border-2 text-left flex items-start gap-4 transition-all ${
                              active
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className={`p-2 rounded-lg shrink-0 ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                              <Icon size={20} />
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{t.label}</div>
                              <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t.desc}</div>
                            </div>
                            {active && <CheckCircle2 size={18} className="text-blue-500 ml-auto shrink-0 mt-0.5" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {error && (
                    <div className="flex gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3 mb-4">
                      <span>⚠️</span> <span>{error}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center gap-1.5 px-5 py-3.5 rounded-xl font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
                    >
                      <ChevronLeft size={16} /> Atrás
                    </button>
                    <button
                      type="button"
                      onClick={handleRegister}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-75 disabled:cursor-wait text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition-all text-base"
                    >
                      {loading ? (
                        <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creando tu tienda...</>
                      ) : (
                        <>Crear mi tienda <Sparkles size={18} /></>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ════ PASO 6: Éxito ════ */}
              {step === 6 && (
                <div className="text-center py-4 animate-in zoom-in-95 duration-500 flex flex-col items-center">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center shadow-xl shadow-emerald-200/50">
                      <CheckCircle2 size={48} className="text-emerald-600" />
                    </div>
                    <div className="absolute -top-1 -right-1 text-2xl animate-bounce">🎉</div>
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 mb-2">¡Felicidades!</h2>
                  <p className="text-slate-500 mb-2 max-w-xs leading-relaxed">
                    Tu tienda <strong className="text-slate-700">{form.nombre}</strong> ha sido creada con éxito.
                  </p>
                  <p className="text-slate-400 text-sm mb-8">
                    Ya puedes empezar a agregar tus productos y compartir tu tienda con tus clientes.
                  </p>

                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-slate-900 hover:bg-slate-800 active:scale-95 text-white py-4 rounded-xl font-bold shadow-xl flex items-center justify-center gap-2 transition-all text-base"
                  >
                    Ir a gestionar mi tienda <ChevronRight size={18} />
                  </button>

                  <p className="text-slate-400 text-xs mt-4">
                    Tu dirección web es:{' '}
                    <a
                      href={`https://${form.subdominio}.tiendaonline.it`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      {form.subdominio}.tiendaonline.it
                    </a>
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Indicadores de punto debajo de la card */}
          {step < 6 && (
            <div className="flex justify-center gap-2 mt-5">
              {[0,1,2,3,4,5].map(i => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === step
                      ? 'w-6 h-2 bg-blue-500'
                      : i < step
                        ? 'w-2 h-2 bg-emerald-400'
                        : 'w-2 h-2 bg-slate-300'
                  }`}
                />
              ))}
            </div>
          )}

        </div>
      </section>
    </PageShell>
  )
}
