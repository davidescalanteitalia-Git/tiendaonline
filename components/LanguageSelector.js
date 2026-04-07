import { C } from '../lib/theme'

export default function LanguageSelector() {
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
      defaultValue="it"
    >
      <option value="it">🇮🇹 IT</option>
      <option value="es">🇪🇸 ES</option>
      <option value="en">🇬🇧 EN</option>
    </select>
  )
}
