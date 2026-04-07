'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('it') // Default is 'it'

  useEffect(() => {
    // Si hay un idioma guardado, lo recuperamos
    const saved = localStorage.getItem('appLang')
    if (saved && ['it', 'es', 'en'].includes(saved)) {
      setLang(saved)
    }
  }, [])

  const changeLang = (newLang) => {
    setLang(newLang)
    localStorage.setItem('appLang', newLang)
  }

  return (
    <LanguageContext.Provider value={{ lang, changeLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
