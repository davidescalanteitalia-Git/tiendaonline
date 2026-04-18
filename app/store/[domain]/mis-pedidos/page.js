'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import {
  ArrowLeft, Package, Clock, CheckCircle2, XCircle, Truck,
  Star, Trash2, LogOut, User, Phone, Calendar, Mail,
  ChevronRight, AlertCircle, Edit3, Save, X, ExternalLink,
  ShoppingBag, CreditCard, BadgePercent, MapPin
} from 'lucide-react'
import AvatarUpload from '../../../../components/AvatarUpload'

const ESTADO_CONFIG = {
  pendiente:   { label: 'Pendiente',     color: 'bg-amber-100 text-amber-700',  icon: Clock },
  confirmado:  { label: 'Confirmado',    color: 'bg-blue-100 text-blue-700',    icon: CheckCircle2 },
  preparando:  { label: 'En preparación',color: 'bg-violet-100 text-violet-700',icon: Package },
  enviado:     { label: 'En camino',     color: 'bg-indigo-100 text-indigo-700',icon: Truck },
  entregado:   { label: 'Entregado',     color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  cancelado:   { label: 'Cancelado',     color: 'bg-red-100 text-red-700',      icon: XCircle },
}

export default function MisPedidosPage() {
  const { domain } = useParams()
  const router = useRouter()

  const [session, setSession] = useState(null)
  const [tienda, setTienda] = useState(null)
  const [cliente, setCliente] = useState(null)
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pedidos') // pedidos | perfil | cuenta
  const [editandoPerfil, setEditandoPerfil] = useState(false)
  const [savingPerfil, setSavingPerfil] = useState(false)
  const [perfil, setPerfil] = useState({ nombre: '', telefono: '', fecha_nacimiento: '', direccion: '' })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [pedidoDetalle, setPedidoDetalle] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.replace(`/store/${domain}/cuenta?modo=login`)
      return
    }
    setSession(session)
    await Promise.all([fetchTienda(), fetchClienteData(session)])
    setLoading(false)
  }

  async function fetchTienda() {
    const { data } = await supabase
      .from('tiendas')
      .select('id, nombre, emoji, logo_url, config_diseno, link_resena_google, whatsapp')
      .eq('subdominio', domain)
      .single()
    if (data) setTienda(data)
    return data
  }

  async function fetchClienteData(sess) {
    const token = sess.access_token

    // Obtener cliente vinculado
    const { data: cli } = await supabase
      .from('clientes')
      .select('*')
      .eq('user_id', sess.user.id)
      .single()

    if (cli) {
      setCliente(cli)
      setPerfil({
        nombre: cli.nombre || '',
        telefono: cli.telefono || '',
        fecha_nacimiento: cli.fecha_nacimiento || '',
        direccion: cli.direccion || ''
      })
      fetchPedidos(cli.tienda_id, cli.email || sess.user.email, cli.telefono || '')
    }
  }

  async function fetchPedidos(tiendaId, email, telefono) {
    if (!tiendaId) return
    const { data } = await supabase
      .from('pedidos')
      .select('*')
      .eq('tienda_id', tiendaId)
      .order('created_at', { ascending: false })
      .limit(50)

    // Filtrar pedidos que coincidan con email, teléfono o nombre del cliente
    const normalPhone = (telefono || '').replace(/\D/g, '')
    const misPedidos = (data || []).filter(p => {
      const meta = (p.items || []).find(i => i.id === 'ORDER_META') || {}
      const metaPhone = (meta.whatsapp || '').replace(/\D/g, '')
      const colPhone = (p.cliente_telefono || '').replace(/\D/g, '')
      const matchEmail = email && meta.email === email
      // Comparar con teléfono en ORDER_META (legacy) o en columna cliente_telefono (nuevo)
      const matchPhone = normalPhone && (
        (metaPhone && metaPhone === normalPhone) ||
        (colPhone && colPhone === normalPhone)
      )
      const matchNombre = cliente?.nombre && p.cliente_nombre === cliente.nombre
      return matchEmail || matchPhone || matchNombre
    })
    setPedidos(misPedidos)

    // Suscripción realtime
    supabase
      .channel(`mis-pedidos-${tiendaId}-${email || telefono}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'pedidos',
        filter: `tienda_id=eq.${tiendaId}`
      }, (payload) => {
        setPedidos(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p))
      })
      .subscribe()
  }

  const handleSavePerfil = async () => {
    if (!session) return
    setSavingPerfil(true)
    const res = await fetch('/api/auth/cliente', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify(perfil)
    })
    if (res.ok) {
      setCliente(prev => ({ ...prev, ...perfil }))
      setEditandoPerfil(false)
    }
    setSavingPerfil(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace(`/store/${domain}`)
  }

  const handleDeleteAccount = async () => {
    if (!session) return
    setDeletingAccount(true)
    const res = await fetch('/api/auth/cliente', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` }
    })
    if (res.ok) {
      await supabase.auth.signOut()
      router.replace(`/store/${domain}`)
    }
    setDeletingAccount(false)
  }

  const colorPrincipal = tienda?.config_diseno?.color_principal || '#6366f1'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-slate-200 rounded-full mx-auto mb-3"
            style={{ borderTopColor: colorPrincipal }} />
          <p className="text-slate-400 text-sm">Cargando tu cuenta...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push(`/store/${domain}`)}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <p className="text-xs text-slate-400">{tienda?.emoji} {tienda?.nombre}</p>
              <p className="font-black text-slate-800 text-sm leading-tight">
                Hola, {cliente?.nombre?.split(' ')[0] || 'cliente'} 👋
              </p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 transition-colors text-sm font-medium px-3 py-1.5 rounded-xl hover:bg-red-50">
            <LogOut size={15} />
            Salir
          </button>
        </div>
      </div>

      {/* Deuda (fiado) banner */}
      {cliente?.deuda_actual > 0 && (
        <div className="bg-red-500 text-white px-4 py-3 text-center">
          <p className="font-bold text-sm">
            💳 Tienes un saldo pendiente de <strong>€{parseFloat(cliente.deuda_actual).toFixed(2)}</strong>
          </p>
          <p className="text-red-100 text-xs mt-0.5">Habla con la tienda para coordinar el pago</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 sticky top-[57px] z-10">
        <div className="flex max-w-lg mx-auto">
          {[
            { key: 'pedidos', label: 'Mis Pedidos', icon: ShoppingBag },
            { key: 'perfil', label: 'Mi Perfil', icon: User },
            { key: 'cuenta', label: 'Cuenta', icon: CreditCard },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-3 text-xs font-bold flex flex-col items-center gap-1 transition-colors border-b-2 ${
                tab === key ? 'border-current' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
              style={tab === key ? { color: colorPrincipal } : {}}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">

        {/* ══ TAB PEDIDOS ══ */}
        {tab === 'pedidos' && (
          <div>
            {pedidos.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag size={48} className="text-slate-200 mx-auto mb-4" />
                <h3 className="font-bold text-slate-600 mb-1">Aún no tienes pedidos</h3>
                <p className="text-slate-400 text-sm mb-6">Cuando hagas tu primera compra aparecerá aquí.</p>
                <button onClick={() => router.push(`/store/${domain}`)}
                  className="py-3 px-6 rounded-2xl font-bold text-white text-sm"
                  style={{ backgroundColor: colorPrincipal }}>
                  Ver productos
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">
                  {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} en total
                </p>
                {pedidos.map(p => {
                  const estado = ESTADO_CONFIG[p.estado] || ESTADO_CONFIG.pendiente
                  const EstadoIcon = estado.icon
                  const orderItems = (p.items || []).filter(i => i.id !== 'ORDER_META')
                  const fecha = new Date(p.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

                  return (
                    <button key={p.id}
                      onClick={() => setPedidoDetalle(pedidoDetalle?.id === p.id ? null : p)}
                      className="w-full bg-white rounded-2xl border border-slate-100 p-4 shadow-sm text-left hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-black text-slate-800">{p.codigo}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{fecha}</p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${estado.color}`}>
                          <EstadoIcon size={11} />
                          {estado.label}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 mb-3">
                        {orderItems.slice(0, 2).map((item, i) => (
                          <span key={i}>{item.quantity}x {item.nombre}{i < Math.min(orderItems.length, 2) - 1 ? ', ' : ''}</span>
                        ))}
                        {orderItems.length > 2 && <span className="text-slate-400"> +{orderItems.length - 2} más</span>}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-800">€{parseFloat(p.total).toFixed(2)}</span>
                        <ChevronRight size={16} className={`text-slate-300 transition-transform ${pedidoDetalle?.id === p.id ? 'rotate-90' : ''}`} />
                      </div>

                      {/* Detalle expandido */}
                      {pedidoDetalle?.id === p.id && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                          {orderItems.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-slate-600">{item.quantity}x {item.nombre}</span>
                              <span className="font-bold text-slate-800">
                                €{(item.quantity * parseFloat(item.price || item.precio || 0)).toFixed(2)}
                              </span>
                            </div>
                          ))}
                          <div className="border-t border-slate-100 pt-2 flex justify-between font-black text-slate-800">
                            <span>Total</span>
                            <span>€{parseFloat(p.total).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ TAB PERFIL ══ */}
        {tab === 'perfil' && (
          <div>
            {/* Foto de perfil del cliente */}
            {session && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-4 flex flex-col items-center gap-3">
                <AvatarUpload
                  currentUrl={cliente?.avatar_url || null}
                  userId={session.user.id}
                  bucket="avatars"
                  size={80}
                  shape="circle"
                  label="Foto de perfil"
                  onUploaded={async (url) => {
                    // Guardamos avatar_url en la tabla clientes
                    await fetch('/api/auth/cliente', {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                      },
                      body: JSON.stringify({ avatar_url: url })
                    })
                    setCliente(prev => ({ ...prev, avatar_url: url }))
                  }}
                />
                <p className="text-xs text-slate-400 font-medium text-center">
                  Tu foto aparecerá en tus reseñas y pedidos
                </p>
              </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-slate-800">Mis datos</h3>
                {!editandoPerfil ? (
                  <button onClick={() => setEditandoPerfil(true)}
                    className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl"
                    style={{ color: colorPrincipal, backgroundColor: colorPrincipal + '15' }}>
                    <Edit3 size={14} /> Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditandoPerfil(false); setPerfil({ nombre: cliente?.nombre || '', telefono: cliente?.telefono || '', fecha_nacimiento: cliente?.fecha_nacimiento || '', direccion: cliente?.direccion || '' }) }}
                      className="p-2 rounded-xl bg-slate-100 text-slate-600">
                      <X size={14} />
                    </button>
                    <button onClick={handleSavePerfil} disabled={savingPerfil}
                      className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl text-white"
                      style={{ backgroundColor: colorPrincipal }}>
                      {savingPerfil ? <span className="animate-spin border border-white border-t-transparent rounded-full w-3 h-3" /> : <Save size={14} />}
                      Guardar
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {[
                  { icon: User, label: 'Nombre', field: 'nombre', type: 'text', placeholder: 'Tu nombre completo' },
                  { icon: Mail, label: 'Email', field: null, value: session?.user?.email, type: 'email', disabled: true },
                  { icon: Phone, label: 'Teléfono', field: 'telefono', type: 'tel', placeholder: '+39 333 000 0000' },
                  { icon: MapPin, label: 'Dirección de envío', field: 'direccion', type: 'text', placeholder: 'Calle, número, ciudad, código postal' },
                  { icon: Calendar, label: 'Fecha de nacimiento', field: 'fecha_nacimiento', type: 'date', placeholder: '' },
                ].map(({ icon: Icon, label, field, value, type, placeholder, disabled }) => (
                  <div key={label}>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <Icon size={12} /> {label}
                    </label>
                    {editandoPerfil && field ? (
                      <input
                        type={type}
                        value={perfil[field]}
                        onChange={e => setPerfil(prev => ({ ...prev, [field]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': colorPrincipal + '40' }}
                      />
                    ) : (
                      <p className="text-slate-800 font-medium text-sm px-1">
                        {value || (field ? perfil[field] : '') || <span className="text-slate-300">No indicado</span>}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Botón Dejar reseña */}
            {tienda?.link_resena_google && (
              <button
                onClick={() => window.open(tienda.link_resena_google, '_blank')}
                className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                    <Star size={20} className="text-yellow-500 fill-yellow-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 text-sm">¿Cómo fue tu experiencia?</p>
                    <p className="text-slate-400 text-xs">Deja tu opinión en Google Reviews</p>
                  </div>
                </div>
                <ExternalLink size={16} className="text-slate-300" />
              </button>
            )}
          </div>
        )}

        {/* ══ TAB CUENTA ══ */}
        {tab === 'cuenta' && (
          <div className="space-y-4">
            {/* Saldo de fiado */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                <BadgePercent size={18} style={{ color: colorPrincipal }} />
                Mi saldo en la tienda
              </h3>
              {cliente?.deuda_actual > 0 ? (
                <div className="bg-red-50 rounded-2xl p-4">
                  <p className="text-red-600 text-sm font-bold mb-1">Saldo pendiente de pago</p>
                  <p className="text-3xl font-black text-red-700">€{parseFloat(cliente.deuda_actual).toFixed(2)}</p>
                  <p className="text-red-400 text-xs mt-2">Habla con la tienda para coordinar el pago de tu deuda.</p>
                </div>
              ) : (
                <div className="bg-emerald-50 rounded-2xl p-4 flex items-center gap-3">
                  <CheckCircle2 size={24} className="text-emerald-500" />
                  <div>
                    <p className="font-bold text-emerald-700 text-sm">Todo al día</p>
                    <p className="text-emerald-500 text-xs">No tienes saldo pendiente.</p>
                  </div>
                </div>
              )}
              {cliente?.total_gastado > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-sm">
                  <span className="text-slate-500">Total gastado en la tienda</span>
                  <span className="font-black text-slate-800">€{parseFloat(cliente.total_gastado).toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Cerrar sesión */}
            <button onClick={handleLogout}
              className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <LogOut size={18} className="text-slate-500" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800 text-sm">Cerrar sesión</p>
                <p className="text-slate-400 text-xs">Salir de tu cuenta en este dispositivo</p>
              </div>
            </button>

            {/* Eliminar cuenta */}
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)}
                className="w-full bg-white rounded-2xl border border-red-100 p-4 flex items-center gap-3 hover:bg-red-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <Trash2 size={18} className="text-red-500" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-red-600 text-sm">Eliminar mi cuenta</p>
                  <p className="text-slate-400 text-xs">Borra todos tus datos permanentemente</p>
                </div>
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-3xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black text-red-700 text-sm mb-1">¿Estás seguro?</p>
                    <p className="text-red-500 text-xs leading-relaxed">
                      Esta acción eliminará permanentemente tu cuenta y todos tus datos personales.
                      Tus pedidos pasados quedarán anónimos. Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-3 rounded-2xl bg-white border border-slate-200 font-bold text-slate-600 text-sm">
                    Cancelar
                  </button>
                  <button onClick={handleDeleteAccount} disabled={deletingAccount}
                    className="flex-1 py-3 rounded-2xl bg-red-500 font-black text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                    {deletingAccount
                      ? <span className="animate-spin border border-white border-t-transparent rounded-full w-4 h-4" />
                      : <><Trash2 size={14} /> Eliminar</>
                    }
                  </button>
                </div>
              </div>
            )}

            <p className="text-center text-slate-300 text-xs pb-4">
              Tus datos están protegidos y nunca se comparten con terceros.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
