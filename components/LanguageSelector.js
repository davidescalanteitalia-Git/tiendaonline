'use client'

import { C } from '../lib/theme'
import { useLang } from './LanguageProvider'

export default function LanguageSelector() {
  const { lang, changeLang } = useLang()

  return (
    <select
      style={{
        background: 'transparent',
        border: `1px solid ${C.grayBorder}`,
        borderRadius: '6px',
        padding: '6px',
        fontSize: '0.85rem',
        color: C.text,
        cursor: 'pointer',
        outline: 'none'
      }}
      value={lang}
      onChange={(e) => changeLang(e.target.value)}
    >
      <option value="it">🇮🇹 IT</option>
      <option value="es">🇪🇸 ES</option>
      <option value="en">🇬🇧 EN</option>
    </select>
  )
}
