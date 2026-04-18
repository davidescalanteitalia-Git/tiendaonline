'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import {
  Star, Gift, Eye, EyeOff, ArrowLeft, CheckCircle2,
  User, Mail, Lock, Phone, Calendar, Sparkles, ShieldCheck,
  Trash2, LogIn, UserPlus
} from 'lucide-react'

const BENEFICIOS = [
  { icon: '📦', titulo: 'Historial de pedidos', desc: 'Revisa todas tus compras en cualquier momento' },
  { icon: '🔔', titulo: 'Seguimiento en tiempo real', desc: 'Sabe exactamente en qué estado está tu pedido' },
  { icon: '🎁', titulo: 'Descuentos exclusivos', desc: 'Accede a precios especiales para clientes registrados' },
  { icon: '💳', titulo: 'Tu saldo de cuenta', desc: 'Consulta tu crédito o deuda pendiente fácilmente' },
]

export default function CuentaClientePage() {
  const { domain } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const modoInicial = searchParams.get('modo') || 'bienvenida' // bienvenida | registro | login

  const [modo, setModo] = useState(modoInicial)
  const [tienda, setTienda] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    password: '',
  })

  useEffect(() => {
    fetchTienda()
    checkSession()
  }, [])

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      router.replace(`/store/${domain}/mis-pedidos`)
    }
  }

  async function fetchTienda() {
    const { data } = await supabase
      .from('tiendas')
      .select('nombre, logo_url, emoji, config_diseno')
      .eq('subdominio', domain)
      .single()
    if (data) setTienda(data)
  }

  const colorPrincipal = tienda?.config_diseno?.color_principal || '#6366f1'

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleRegistro = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('El email y la contraseña son necesarios para crear tu cuenta.')
      return
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, domain })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al crear la cuenta.')
        setLoading(false)
        return
      }

      // Login automático tras el registro
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      })

      if (loginError) {
        setExito(true) // cuenta creada, que haga login manual
      } else {
        router.replace(`/store/${domain}/mis-pedidos`)
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Ingresa tu email y contraseña.')
      return
    }

    setLoading(true)
    setError('')

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password
    })

    if (loginError) {
      setError('Email o contraseña incorrectos. ¿Olvidaste tu contraseña?')
      setLoading(false)
      return
    }

    router.replace(`/store/${domain}/mis-pedidos`)
  }

  if (exito) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: colorPrincipal + '20' }}>
            <CheckCircle2 size={40} style={{ color: colorPrincipal }} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">¡Bienvenido!</h2>
          <p className="text-slate-500 mb-6">Tu cuenta fue creada con éxito. Ahora inicia sesión para ver tus pedidos.</p>
          <button onClick={() => { setExito(false); setModo('login') }}
            className="w-full py-4 rounded-2xl font-black text-white text-base transition-all active:scale-95"
            style={{ backgroundColor: colorPrincipal }}>
            Iniciar sesión
          </button>
        </div>
      </div>
    )
  }

  // — PANTALLA DE BIENVENIDA —
  if (modo === 'bienvenida') {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <span className="font-black text-slate-800">
            {tienda ? `${tienda.emoji || '🏪'} ${tienda.nombre}` : 'Mi Cuenta'}
          </span>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-sm mx-auto px-4 pt-6 pb-4">

            {/* Hero — más compacto */}
            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md"
                style={{ backgroundColor: colorPrincipal }}>
                <Sparkles size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-black text-slate-800 mb-1">Crea tu cuenta</h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                Regístrate gratis y lleva el control de todas tus compras.
                <strong className="text-slate-700"> Sin complicaciones.</strong>
              </p>
            </div>

            {/* Beneficios — más compactos */}
            <div className="space-y-2 mb-4">
              {BENEFICIOS.map((b, i) => (
                <div key={i} className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm border border-slate-100">
                  <span className="text-xl shrink-0">{b.icon}</span>
                  <div>
                    <p className="font-bold text-slate-800 text-sm leading-tight">{b.titulo}</p>
                    <p className="text-slate-400 text-xs">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Nota de privacidad — compacta */}
            <div className="bg-blue-50 rounded-xl p-3 flex gap-2">
              <ShieldCheck size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-blue-700 text-xs leading-relaxed">
                <strong>Tu privacidad importa.</strong> No compartimos tus datos. Puedes eliminar tu cuenta cuando quieras.
              </p>
            </div>
          </div>
        </div>

        {/* Botones fijos en la parte de abajo */}
        <div className="shrink-0 bg-white border-t border-slate-100 px-4 py-4 space-y-2 max-w-sm mx-auto w-full">
          <button onClick={() => setModo('registro')}
            className="w-full py-4 rounded-2xl font-black text-white text-base flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
            style={{ backgroundColor: colorPrincipal }}>
            <UserPlus size={20} />
            Crear mi cuenta gratis
          </button>
          <button onClick={() => setModo('login')}
            className="w-full py-3 rounded-2xl font-black text-slate-700 text-sm flex items-center justify-center gap-2 transition-all active:scale-95 bg-white border border-slate-200">
            <LogIn size={18} />
            Ya tengo una cuenta
          </button>
          <button onClick={() => router.back()}
            className="w-full py-2 text-slate-400 text-sm font-medium">
            Continuar sin registrarme →
          </button>
        </div>
      </div>
    )
  }

  // — FORMULARIO REGISTRO / LOGIN —
  const esRegistro = modo === 'registro'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setModo('bienvenida')} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <span className="font-black text-slate-800">
          {esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}
        </span>
      </div>

      <div className="max-w-sm mx-auto px-4 py-8">

        {/* Título */}
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-800 mb-1">
            {esRegistro ? '¡Únete en segundos!' : 'Bienvenido de vuelta'}
          </h2>
          <p className="text-slate-500 text-sm">
            {esRegistro
              ? 'Solo necesitamos tu email y una contraseña. El resto es completamente opcional.'
              : 'Ingresa con el email y contraseña de tu cuenta.'}
          </p>
        </div>

        <form onSubmit={esRegistro ? handleRegistro : handleLogin} className="space-y-4">

          {/* Nombre (solo registro, opcional) */}
          {esRegistro && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Tu nombre <span className="text-slate-300 font-normal normal-case">(opcional)</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="¿Cómo te llamamos?"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                  style={{ '--tw-ring-color': colorPrincipal + '40' }}
                />
              </div>
            </div>
          )}

          {/* Email (obligatorio) */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Email <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Teléfono (solo registro, opcional) */}
          {esRegistro && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Teléfono <span className="text-slate-300 font-normal normal-case">(opcional)</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="+39 333 000 0000"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                />
              </div>
            </div>
          )}

          {/* Fecha de nacimiento (solo registro, opcional) */}
          {esRegistro && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Fecha de nacimiento <span className="text-slate-300 font-normal normal-case">(opcional — para recibir sorpresas 🎂)</span>
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={form.fecha_nacimiento}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                />
              </div>
            </div>
          )}

          {/* Contraseña */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Contraseña <span className="text-red-400">*</span>
              {esRegistro && <span className="text-slate-300 font-normal normal-case ml-1">(mínimo 6 caracteres)</span>}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={esRegistro ? 'Elige una contraseña fácil de recordar' : 'Tu contraseña'}
                required
                className="w-full pl-10 pr-12 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:border-transparent text-sm"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-3">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Botón principal */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-black text-white text-base flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 shadow-lg mt-2"
            style={{ backgroundColor: colorPrincipal }}>
            {loading ? (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" />
            ) : esRegistro ? (
              <><UserPlus size={20} /> Crear mi cuenta</>
            ) : (
              <><LogIn size={20} /> Entrar a mi cuenta</>
            )}
          </button>

          {/* Cambiar modo */}
          <p className="text-center text-slate-500 text-sm pt-2">
            {esRegistro ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
            <button type="button"
              onClick={() => { setModo(esRegistro ? 'login' : 'registro'); setError('') }}
              className="font-bold underline" style={{ color: colorPrincipal }}>
              {esRegistro ? 'Inicia sesión' : 'Regístrate gratis'}
            </button>
          </p>

          {/* Nota eliminar cuenta */}
          {esRegistro && (
            <div className="flex items-start gap-2 pt-2 px-1">
              <Trash2 size={13} className="text-slate-300 shrink-0 mt-0.5" />
              <p className="text-slate-400 text-xs leading-relaxed">
                Puedes eliminar tu cuenta y todos tus datos en cualquier momento desde tu perfil.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
