// useSettings.js
// Manages all user settings and emergency contacts
// Data is saved to localStorage so it survives page refresh

import { useState, useEffect } from 'react'

// Keys we use to save data in localStorage
const STORAGE_KEYS = {
  USER_NAME: 'roadsos_user_name',
  USER_PHONE: 'roadsos_user_phone',
  CONTACTS: 'roadsos_emergency_contacts',
}

// Reads a value from localStorage safely
// Returns defaultValue if nothing is saved yet
function loadFromStorage(key, defaultValue) {
  try {
    const saved = localStorage.getItem(key)
    if (saved === null) return defaultValue
    return JSON.parse(saved)
  } catch {
    return defaultValue
  }
}

// Saves a value to localStorage safely
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error('Could not save to localStorage:', err)
  }
}

// Custom hook — call this in any component to access settings
export function useSettings() {
  const [userName, setUserNameState] = useState(() =>
    loadFromStorage(STORAGE_KEYS.USER_NAME, '')
  )
  const [userPhone, setUserPhoneState] = useState(() =>
    loadFromStorage(STORAGE_KEYS.USER_PHONE, '')
  )
  const [contacts, setContactsState] = useState(() =>
    loadFromStorage(STORAGE_KEYS.CONTACTS, [])
  )

  // Whenever userName changes, save it to localStorage
  const setUserName = (name) => {
    setUserNameState(name)
    saveToStorage(STORAGE_KEYS.USER_NAME, name)
  }

  // Whenever userPhone changes, save it to localStorage
  const setUserPhone = (phone) => {
    setUserPhoneState(phone)
    saveToStorage(STORAGE_KEYS.USER_PHONE, phone)
  }

  // Add a new emergency contact
  const addContact = (name, phone) => {
    const newContact = {
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
    }
    const updated = [...contacts, newContact]
    setContactsState(updated)
    saveToStorage(STORAGE_KEYS.CONTACTS, updated)
    return newContact
  }

  // Remove a contact by its id
  const removeContact = (id) => {
    const updated = contacts.filter((c) => c.id !== id)
    setContactsState(updated)
    saveToStorage(STORAGE_KEYS.CONTACTS, updated)
  }

  return {
    userName,
    setUserName,
    userPhone,
    setUserPhone,
    contacts,
    addContact,
    removeContact,
  }
}