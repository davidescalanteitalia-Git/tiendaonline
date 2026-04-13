'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import PageShell from '../../components/PageShell'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../components/LanguageProvider'
import { DICTIONARY } from '../../lib/dictionaries'
import { CheckCircle2, ChevronRight, Store, Briefcase, User, Sparkles } from 'lucide-react'

const C = {
  green:      '#059669',
  greenDark:  '#047857',
  white:      '#ffffff',
  text:       '#0f172a',
  textMuted:  '#64748b',
  grayBorder: '#e2e8f0',
  grayBg:     '#f8fafc',
  redBg:      '#fef2f2',
  redText:    '#b91c1c',
  redBorder:  '#fecaca',
  amberBg:    '#fffbeb',
  amberText:  '#92400e',
  amberBorder:'#fcd34d',
  primary:    '#2563EB',
}

export default function RegisterPage() {
  const router  = useRouter()
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']

  const [step, setStep] = useState(1) // 1: Datos, 2: Sector, 3: Exito
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldError, setFieldError] = useState({})
  const [subdomainStatus, setSubdomainStatus] = useState('idle') // idle, checking, available, taken

  const [form, setForm] = useState({
    nombre:     '',
    subdominio: '',
    whatsapp:   '',
    email:      '',
    password:   '',
    sector:     '',
    tipo_vendedor: ''
  })

  const ERROR_MESSAGES = {
    subdomain_taken: dict.sottodominioPreso || 'El subdominio ya está en uso.',
    whatsapp_taken:  dict.whatsappPreso || 'El número de WhatsApp ya está registrado.',
    email_taken:     dict.emailPresa || 'El email ya está registrado.',
    user_error:      dict.erroreLogin || 'Error al crear la cuenta. Intenta con otro email.',
    store_error:     dict.erroreInaspettato || 'Error al crear la tienda.',
    unexpected:      dict.erroreInaspettato || 'Ha ocurrido un error inesperado.'
  }

  // Validación de subdominio en tiempo real
  useEffect(() => {
    if (!form.subdominio || form.subdominio.length < 3) {
      setSubdomainStatus('idle')
      return
    }
    const timer = setTimeout(async () => {
      setSubdomainStatus('checking')
      try {
        const res = await fetch(`/api/check-subdominio?subdominio=${form.subdominio}`)
        const data = await res.json()
        if (data.available) {
          setSubdomainStatus('available')
          setFieldError(e => ({ ...e, subdominio: '' }))
        } else {
          setSubdomainStatus('taken')
          setFieldError(e => ({ ...e, subdominio: ERROR_MESSAGES.subdomain_taken }))
        }
      } catch (err) {
        setSubdomainStatus('idle')
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [form.subdominio])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'subdominio') {
      setForm(f => ({ ...f, subdominio: value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
    if (fieldError[name]) setFieldError(e => ({ ...e, [name]: '' }))
    setError('')
  }

  const validateStep1 = () => {
    const errors = {}
    if (!form.nombre.trim())            errors.nombre     = dict.erroreValidazioneNome || 'Ingresa el nombre.'
    if (!form.subdominio.trim())        errors.subdominio = dict.erroreValidazioneSub || 'El subdominio es requerido.'
    if (form.subdominio.length < 3)     errors.subdominio = dict.erroreValidazioneSubCorto || 'Mínimo 3 letras.'
    if (subdomainStatus === 'taken')    errors.subdominio = ERROR_MESSAGES.subdomain_taken
    if (!form.whatsapp.trim())          errors.whatsapp   = dict.erroreValidazioneWhatsapp || 'WhatsApp es requerido.'
    if (!/^\+?[0-9\s\-]{7,}$/.test(form.whatsapp)) errors.whatsapp = dict.erroreValidazioneWhatsappFormato || 'WhatsApp inválido.'
    if (!form.email.trim())             errors.email      = dict.erroreValidazioneEmail || 'Email requerido.'
    if (!/\S+@\S+\.\S+/.test(form.email)) errors.email    = dict.erroreValidazioneEmailFormato || 'Email inválido.'
    if (!form.password)                 errors.password   = dict.erroreValidazionePass || 'Contraseña requerida.'
    if (form.password.length < 6)       errors.password   = dict.erroreValidazionePassCorto || 'Mínimo 6 caracteres.'
    return errors
  }

  const handleNextToStep2 = (e) => {
    e.preventDefault()
    const errors = validateStep1()
    if (Object.keys(errors).length > 0) {
      setFieldError(errors)
      return
    }
    setStep(2)
  }

  const handleRegister = async (e) => {
    e?.preventDefault()
    setError('')
    setFieldError({})
    
    // Validación Paso 2
    if (!form.sector || !form.tipo_vendedor) {
      setError('Por favor selecciona tu sector y tipo de vendedor para continuar.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'subdomain_taken' || data.error === 'whatsapp_taken' || data.error === 'email_taken') {
          // Volver al paso 1 para que corrija
          setStep(1)
          setFieldError({ [data.error.split('_')[0]]: ERROR_MESSAGES[data.error] })
        } else {
          setError(ERROR_MESSAGES[data.error] || ERROR_MESSAGES.unexpected)
        }
        setLoading(false)
        return
      }

      // Login automático
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email:    form.email,
        password: form.password,
      })

      if (loginError) {
        router.push('/login')
        return
      }

      // Éxito: Pasar al Paso 3
      setStep(3)
      setLoading(false)

    } catch (err) {
      setError(ERROR_MESSAGES.unexpected)
      setLoading(false)
      setStep(1)
    }
  }

  const inputStyle = (field) => ({
    width:        '100%',
    padding:      '12px 16px',
    borderRadius: '10px',
    border:       `1.5px solid ${fieldError[field] ? '#fca5a5' : C.grayBorder}`,
    background:   fieldError[field] ? '#fef2f2' : C.grayBg,
    fontSize:     '0.95rem',
    color:        C.text,
    outline:      'none',
    boxSizing:    'border-box',
    transition:   'border-color 0.2s',
  })

  const FieldError = ({ field }) => fieldError[field] ? (
    <span style={{ fontSize: '0.8rem', color: C.redText, marginTop: '5px', display: 'block', fontWeight: 500 }}>
      {fieldError[field]}
    </span>
  ) : null

  const Label = ({ children }) => (
    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: C.text, marginBottom: '8px' }}>
      {children}
    </label>
  )

  const SECTORES = ['Moda y Ropa', 'Alimentación y Bebidas', 'Electrónica', 'Salud y Belleza', 'Servicios', 'Otro']
  const TIPOS_VENDEDOR = [
    { id: 'particular', label: 'Particular', icon: User, desc: 'Vendes cosas por tu cuenta.' },
    { id: 'autonomo', label: 'Autónomo', icon: Briefcase, desc: 'Profesional independiente.' },
    { id: 'empresa', label: 'Empresa', icon: Store, desc: 'Negocio formalmente registrado.' }
  ]

  return (
    <PageShell>
      <section className="bg-slate-50" style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

        <div className="premium-shadow animate-in slide-in-from-bottom-4 duration-500" style={{
          background:   C.white,
          borderRadius: '24px',
          width:        '100%',
          maxWidth:     '550px',
          padding:      '40px',
        }}>

          {/* Stepper Header (solo si no es éxito) */}
          {step < 3 && (
            <div className="mb-8 flex items-center justify-between">
               <div className="flex flex-col">
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                    {step === 1 ? 'Crea tu tienda' : 'Personaliza tu tienda'}
                  </h1>
                  <p className="text-slate-500 text-sm mt-1">
                    {step === 1 ? 'Configura tu acceso en segundos.' : 'Ayúdanos a adaptar la tienda a ti.'}
                  </p>
               </div>
               <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>1</div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
               </div>
            </div>
          )}

          {/* ────── PASO 1 ────── */}
          {step === 1 && (
            <form onSubmit={handleNextToStep2} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <div>
                <Label>{dict.nomeNegozioLabel || 'Nombre de la tienda'}</Label>
                <input type="text" name="nombre" value={form.nombre} onChange={handleChange}
                  placeholder={dict.placeholderEjemploNegozio || 'Ej: Mi Zapatería'} style={inputStyle('nombre')} />
                <FieldError field="nombre" />
              </div>

              <div>
                <Label>{dict.sottodominioUnico || 'Enlace público de tu tienda'}</Label>
                <div style={{
                  display:      'flex',
                  alignItems:   'center',
                  border:       `1.5px solid ${fieldError.subdominio ? '#fca5a5' : subdomainStatus === 'available' ? '#34d399' : C.grayBorder}`,
                  borderRadius: '10px',
                  background:   fieldError.subdominio ? '#fef2f2' : subdomainStatus === 'available' ? '#ecfdf5' : C.grayBg,
                  overflow:     'hidden',
                  transition:   'all 0.3s ease'
                }}>
                  <span style={{ padding: '12px 4px 12px 16px', color: '#9ca3af', fontSize: '0.9rem', userSelect: 'none' }}>
                    https://
                  </span>
                  <input type="text" name="subdominio" value={form.subdominio} onChange={handleChange}
                    placeholder="mia-tienda"
                    style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', fontSize: '0.95rem', color: C.text, outline: 'none', minWidth: '0' }} />
                  <span style={{ padding: '12px 16px 12px 4px', color: '#9ca3af', fontSize: '0.9rem', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    .tiendaonline.it
                    {subdomainStatus === 'checking' && <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />}
                    {subdomainStatus === 'available' && <CheckCircle2 size={18} className="text-emerald-500" />}
                  </span>
                </div>
                <FieldError field="subdominio" />
                {subdomainStatus === 'available' && !fieldError.subdominio && (
                  <span className="text-emerald-600 text-xs font-medium mt-1 block">¡Este dominio está disponible!</span>
                )}
              </div>

              <div>
                <Label>{dict.whatsappNegozio || 'WhatsApp del Negocio'}</Label>
                <input type="tel" name="whatsapp" value={form.whatsapp} onChange={handleChange}
                  placeholder={dict.whatsappPlaceholder || '+34 600 000 000'} style={inputStyle('whatsapp')} />
                <FieldError field="whatsapp" />
              </div>

              <div>
                <Label>{dict.emailLabel || 'Correo Electrónico'}</Label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder={dict.emailPlaceholder || 'tu@email.com'} style={inputStyle('email')} />
                <FieldError field="email" />
              </div>

              <div>
                <Label>{dict.passwordLabel || 'Contraseña'}</Label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder={dict.minimo6Caratteri || 'Mínimo 6 caracteres'}
                    style={{ ...inputStyle('password'), paddingRight: '44px' }}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: C.textMuted, fontSize: '1.1rem' }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                <FieldError field="password" />
              </div>

              <button type="submit" className="w-full bg-primary hover:bg-blue-700 text-white p-4 rounded-xl font-bold mt-2 shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2">
                Continuar paso 2 <ChevronRight size={18} />
              </button>
              
              <div className="text-center mt-2 text-sm text-slate-500">
                ¿Ya tienes cuenta? <a href="/login" className="text-primary font-bold hover:underline">Inicia sesión</a>
              </div>
            </form>
          )}

          {/* ────── PASO 2 ────── */}
          {step === 2 && (
            <div className="flex flex-col gap-6 animate-in slide-in-from-right-8 duration-300">
              
              {/* Sector */}
              <div>
                <Label>¿Qué vas a vender?</Label>
                <select 
                  name="sector" 
                  value={form.sector} 
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-700 outline-none focus:border-primary transition-colors"
                >
                  <option value="" disabled>Selecciona tu sector...</option>
                  {SECTORES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Tipo de Vendedor */}
              <div>
                <Label>¿Cómo te identificas como vendedor?</Label>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  {TIPOS_VENDEDOR.map(t => (
                    <div 
                      key={t.id}
                      onClick={() => setForm(f => ({ ...f, tipo_vendedor: t.id }))}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${form.tipo_vendedor === t.id ? 'border-primary bg-blue-50 ring-2 ring-primary/20' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                    >
                      <div className={`p-2 rounded-lg ${form.tipo_vendedor === t.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <t.icon size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{t.label}</div>
                        <div className="text-xs text-slate-500 mt-1 leading-relaxed">{t.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-xl text-sm font-medium text-center">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3 mt-4">
                <button 
                  onClick={() => setStep(1)} 
                  className="px-6 py-4 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  disabled={loading}
                >
                  Atrás
                </button>
                <button 
                  onClick={handleRegister}
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-wait"
                >
                  {loading ? 'Creando tienda...' : 'Crear Tienda Ahora'}
                  {!loading && <Sparkles size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* ────── PASO 3 (ÉXITO) ────── */}
          {step === 3 && (
            <div className="text-center py-6 animate-in zoom-in-95 duration-500 flex flex-col items-center">
               <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-200/50">
                  <CheckCircle2 size={48} />
               </div>
               <h2 className="text-3xl font-black text-slate-800 mb-2">¡Enhorabuena!</h2>
               <p className="text-slate-500 mb-8 max-w-sm">
                 Tu tienda <strong className="text-slate-700">{form.nombre}</strong> ha sido creada con éxito. Ya puedes empezar a subir tus productos.
               </p>

               <button 
                onClick={() => router.push('/dashboard')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
               >
                 Gestionar mi tienda <ChevronRight size={18} />
               </button>
            </div>
          )}

        </div>
      </section>
    </PageShell>
  )
}
