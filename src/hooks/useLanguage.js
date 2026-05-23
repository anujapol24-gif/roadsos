// useLanguage.js
// Manages the selected language across the whole app
// Saved to localStorage so it persists after refresh

import { useState } from 'react'

const STORAGE_KEY = 'roadsos_language'

export function useLanguage() {
  const [language, setLanguageState] = useState(() => {
    // Load saved language or default to English
    return localStorage.getItem(STORAGE_KEY) || 'en'
  })

  const setLanguage = (langCode) => {
    setLanguageState(langCode)
    localStorage.setItem(STORAGE_KEY, langCode)
  }

  return { language, setLanguage }
}