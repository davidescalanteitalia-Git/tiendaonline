'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

/**
 * AvatarUpload — componente reutilizable para subir foto de perfil a Supabase Storage.
 *
 * Props:
 *  - currentUrl   : URL actual del avatar (string | null)
 *  - userId       : ID del usuario autenticado (string) — define la ruta en Storage
 *  - bucket       : 'avatars' por defecto
 *  - size         : tamaño en px del círculo (default 80)
 *  - onUploaded   : callback(url) cuando la subida termina con éxito
 *  - label        : texto debajo del avatar (opcional)
 *  - shape        : 'circle' | 'rounded' (default 'circle') — para logos de tienda usar 'rounded'
 */
export default function AvatarUpload({
  currentUrl = null,
  userId,
  bucket = 'avatars',
  size = 80,
  onUploaded,
  label,
  shape = 'circle',
}) {
  const [preview, setPreview] = useState(currentUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl'

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validación client-side
    const MAX_MB = 2
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`La imagen debe pesar menos de ${MAX_MB} MB`)
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Solo se permiten imágenes JPG, PNG o WEBP')
      return
    }

    setError(null)
    setUploading(true)

    // Preview local inmediato
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    try {
      // Ruta: avatars/{userId}/avatar.jpg — sobreescribe siempre
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
      const path = `${userId}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true, contentType: file.type })

      if (uploadError) throw uploadError

      // URL pública permanente
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      // Añadir cache-buster para forzar recarga
      const finalUrl = `${data.publicUrl}?t=${Date.now()}`
      setPreview(finalUrl)
      onUploaded?.(finalUrl)
    } catch (err) {
      setError('Error al subir la imagen. Intenta de nuevo.')
      console.error('AvatarUpload error:', err)
      setPreview(currentUrl) // revertir al anterior
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Círculo / cuadrado clicable */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`relative group cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-500/30 ${shapeClass}`}
        style={{ width: size, height: size }}
        aria-label="Cambiar foto de perfil"
      >
        {/* Avatar actual o placeholder */}
        {preview ? (
          <Image
            src={preview}
            alt="Avatar"
            width={size}
            height={size}
            className={`object-cover ${shapeClass} border-4 border-white shadow-lg`}
            style={{ width: size, height: size }}
            unoptimized={preview.includes('blob:')}
          />
        ) : (
          <div
            className={`bg-emerald-100 border-4 border-white shadow-lg flex items-center justify-center ${shapeClass}`}
            style={{ width: size, height: size }}
          >
            <span style={{ fontSize: size * 0.4 }}>
              {shape === 'circle' ? '👤' : '🏪'}
            </span>
          </div>
        )}

        {/* Overlay "editar" al hacer hover */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${shapeClass}`}>
          {uploading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </div>

        {/* Badge de cámara en esquina */}
        {!uploading && (
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-md border-2 border-white">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </div>
        )}
      </button>

      {/* Label opcional */}
      {label && (
        <p className="text-xs text-slate-400 font-semibold text-center">{label}</p>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 font-semibold text-center max-w-[160px]">{error}</p>
      )}

      {/* Estado de subida */}
      {uploading && (
        <p className="text-xs text-emerald-600 font-semibold">Subiendo imagen...</p>
      )}

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
