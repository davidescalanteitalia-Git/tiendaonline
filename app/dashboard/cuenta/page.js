'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import {
  ShieldCheck, Mail, Lock, Eye, EyeOff, Save, Loader2,
  CheckCircle2, AlertCircle, User, KeyRound, X, ArrowLeft
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CuentaPage() {
  const router = useRouter()

  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)

  // Email change
  const [nuevoEmail, setNuevoEmail] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)
  const [emailMsg, setEmailMsg] = useState(null)

  // Password change
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [passMsg, setPassMsg] = useState(null)

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }
      setUserEmail(session.user.email || '')
      setNuevoEmail(session.user.email || '')
      setLoading(false)
    }
    load()
  }, [router])

  // ── Cambiar email ──────────────────────────────────────────────────────────
  async function handleEmailChange(e) {
    e.preventDefault()
    if (!nuevoEmail || nuevoEmail === userEmail) return
    setSavingEmail(true)
    setEmailMsg(null)
    try {
      const { error } = await supabase.auth.updateUser({ email: nuevoEmail })
      if (error) throw error
      setEmailMsg({ type: 'ok', text: 'Te enviamos un correo de confirmación al nuevo email. Revisa tu bandeja.' })
    } catch (err) {
      setEmailMsg({ type: 'error', text: err.message })
    } finally {
      setSavingEmail(false)
    }
  }

  // ── Cambiar contraseña ────────────────────────────────────────────────────
  async function handlePassChange(e) {
    e.preventDefault()
    if (!newPass || newPass.length < 6) {
      setPassMsg({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' })
      return
    }
    if (newPass !== confirmPass) {
      setPassMsg({ type: 'error', text: 'Las contraseñas no coinciden.' })
      return
    }
    setSavingPass(true)
    setPassMsg(null)
    try {
      // Re-autenticar con contraseña actual para mayor seguridad
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail, password: currentPass
      })
      if (signInError) throw new Error('Contraseña actual incorrecta.')

      const { error } = await supabase.auth.updateUser({ password: newPass })
      if (error) throw error

      setCurrentPass('')
      setNewPass('')
      setConfirmPass('')
      setPassMsg({ type: 'ok', text: '¡Contraseña actualizada con éxito!' })
    } catch (err) {
      setPassMsg({ type: 'error', text: err.message })
    } finally {
      setSavingPass(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  )

  const PasswordInput = ({ value, onChange, show, onToggle, placeholder }) => (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
        placeholder={placeholder}
        required
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )

  const MsgBanner = ({ msg }) => msg ? (
    <div className={`flex items-start gap-3 p-4 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 ${
      msg.type === 'ok'
        ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
        : 'bg-red-50 border border-red-100 text-red-700'
    }`}>
      {msg.type === 'ok' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
      <span>{msg.text}</span>
    </div>
  ) : null

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-blue-500" size={28} /> Mi Cuenta
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Administra tu email y contraseña de acceso.</p>
        </div>
      </div>

      {/* Card: Email actual */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-50 p-2.5 rounded-xl">
            <Mail className="text-blue-600" size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">Correo Electrónico</h2>
            <p className="text-xs text-slate-400 font-medium">Email actual: <span className="text-slate-600 font-bold">{userEmail}</span></p>
          </div>
        </div>

        <form onSubmit={handleEmailChange} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nuevo email</label>
            <input
              type="email"
              value={nuevoEmail}
              onChange={(e) => setNuevoEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
              placeholder="nuevo@email.com"
              required
            />
          </div>
          <MsgBanner msg={emailMsg} />
          <button
            type="submit"
            disabled={savingEmail || nuevoEmail === userEmail}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-40"
          >
            {savingEmail ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Actualizar email
          </button>
        </form>
      </div>

      {/* Card: Cambiar contraseña */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-amber-50 p-2.5 rounded-xl">
            <KeyRound className="text-amber-600" size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">Cambiar Contraseña</h2>
            <p className="text-xs text-slate-400 font-medium">Mínimo 6 caracteres.</p>
          </div>
        </div>

        <form onSubmit={handlePassChange} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contraseña actual</label>
            <PasswordInput
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              show={showCurrentPass}
              onToggle={() => setShowCurrentPass(!showCurrentPass)}
              placeholder="Tu contraseña actual"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nueva contraseña</label>
            <PasswordInput
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              show={showNewPass}
              onToggle={() => setShowNewPass(!showNewPass)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirmar nueva contraseña</label>
            <PasswordInput
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              show={showConfirmPass}
              onToggle={() => setShowConfirmPass(!showConfirmPass)}
              placeholder="Repite la contraseña"
            />
          </div>

          {/* Indicador de fortaleza */}
          {newPass.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex gap-1.5">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
                    newPass.length >= i * 3
                      ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-blue-400' : 'bg-emerald-500'
                      : 'bg-slate-100'
                  }`} />
                ))}
              </div>
              <p className="text-[10px] text-slate-400 font-bold">
                {newPass.length < 6 ? 'Muy corta' : newPass.length < 9 ? 'Débil' : newPass.length < 12 ? 'Media' : 'Fuerte'}
              </p>
            </div>
          )}

          <MsgBanner msg={passMsg} />
          <button
            type="submit"
            disabled={savingPass || !currentPass || !newPass || !confirmPass}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-40"
          >
            {savingPass ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
            Cambiar contraseña
          </button>
        </form>
      </div>

      {/* Card: Zona de peligro */}
      <div className="bg-red-50 rounded-[32px] border border-red-100 p-8">
        <h2 className="text-lg font-black text-red-800 mb-2 flex items-center gap-2">
          <AlertCircle size={20} /> Zona de Peligro
        </h2>
        <p className="text-sm text-red-600 font-medium mb-6">
          Cerrar sesión en todos los dispositivos o eliminar tu cuenta permanentemente.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={async () => { await supabase.auth.signOut(); router.replace('/login') }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-red-200 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition-all active:scale-95"
          >
            Cerrar todas las sesiones
          </button>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95"
            >
              Eliminar mi cuenta
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-white border border-red-200 rounded-xl px-4 py-3 animate-in fade-in duration-200">
              <span className="text-sm font-bold text-red-700">¿Seguro?</span>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  // Soft delete — contact support approach (Supabase no permite delete desde cliente sin admin SDK)
                  await supabase.auth.signOut()
                  router.replace('/')
                }}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
