import { useState } from 'react'
import { useSettings } from '../hooks/useSettings'
import LanguageSelector from './LanguageSelector'

function ContactRow({ contact, onRemove }) {
  return (
    <div className="flex items-center justify-between bg-gray-800
                    rounded-xl px-4 py-3 border border-gray-700">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-red-700 flex items-center
                        justify-center text-white font-bold text-sm flex-shrink-0">
          {contact.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-white text-sm font-medium">{contact.name}</p>
          <p className="text-gray-400 text-xs">{contact.phone}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => { window.location.href = `tel:${contact.phone}` }}
          className="text-green-400 hover:text-green-300 text-lg"
        >
          📞
        </button>
        <button
          onClick={() => onRemove(contact.id)}
          className="text-gray-600 hover:text-red-400 text-lg transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

function AddContactForm({ onAdd }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Please enter a name'); return }
    if (!phone.trim() || phone.trim().length < 7) { setError('Please enter a valid phone number'); return }
    onAdd(name, phone)
    setName('')
    setPhone('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contact name"
          className="flex-1 bg-gray-800 text-white placeholder-gray-500
                     rounded-xl px-3 py-2.5 text-sm outline-none
                     border border-gray-700 focus:border-red-500 transition-colors"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          className="flex-1 bg-gray-800 text-white placeholder-gray-500
                     rounded-xl px-3 py-2.5 text-sm outline-none
                     border border-gray-700 focus:border-red-500 transition-colors"
        />
      </div>
      {error && <p className="text-red-400 text-xs px-1">{error}</p>}
      <button
        type="submit"
        className="bg-red-600 hover:bg-red-500 text-white text-sm
                   font-medium py-2.5 rounded-xl transition-colors"
      >
        + Add Contact
      </button>
    </form>
  )
}

function SOSAlert({ contacts, location }) {
  const [sent, setSent] = useState(false)

  const handleSOS = () => {
    if (contacts.length === 0) return
    let locationText = 'Location unknown'
    if (location) {
      const mapsLink = `https://maps.google.com/?q=${location.lat},${location.lng}`
      locationText = `My location: ${mapsLink}`
    }
    const message = `🚨 EMERGENCY ALERT from RoadSOS\n\nI have been in a road accident and need immediate help.\n\n${locationText}\n\nPlease call me or contact emergency services (108 / 112) immediately.`
    const phoneNumbers = contacts.map((c) => c.phone).join(',')
    window.location.href = `sms:${phoneNumbers}?body=${encodeURIComponent(message)}`
    setSent(true)
    setTimeout(() => setSent(false), 5000)
  }

  if (contacts.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-center">
        <p className="text-gray-400 text-sm">
          Add at least one emergency contact above to enable SOS alerts.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <p className="text-gray-400 text-xs font-medium mb-2">📋 SOS message preview:</p>
        <p className="text-gray-300 text-xs leading-relaxed">
          🚨 EMERGENCY ALERT from RoadSOS — I have been in a road accident and need help.
          {location ? ' My GPS location will be included.' : ' (Enable location for GPS.)'}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {contacts.map((c) => (
          <span key={c.id} className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full border border-gray-700">
            {c.name}
          </span>
        ))}
      </div>
      <button
        onClick={handleSOS}
        className={`w-full py-4 rounded-2xl text-white font-bold text-lg
                    transition-all duration-150 active:scale-95 shadow-lg
                    ${sent ? 'bg-green-600' : 'bg-red-600 hover:bg-red-500'}`}
      >
        {sent ? '✅ SOS Alert Sent!' : '🚨 Send SOS Alert'}
      </button>
      <p className="text-gray-500 text-xs text-center">
        Opens SMS app with alert to all {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider px-1">
        {title}
      </h3>
      {children}
    </div>
  )
}

// Main Settings Tab
// Now accepts language + onLanguageChange props
export default function SettingsTab({ location, language, onLanguageChange }) {
  const {
    userName, setUserName,
    userPhone, setUserPhone,
    contacts, addContact, removeContact,
  } = useSettings()

  const [editName, setEditName] = useState(userName)
  const [editPhone, setEditPhone] = useState(userPhone)
  const [saved, setSaved] = useState(false)

  const handleSaveProfile = () => {
    setUserName(editName)
    setUserPhone(editPhone)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-4 overflow-y-auto">

      {/* ── LANGUAGE SELECTOR ── */}
      <Section title="Language / भाषा / மொழி">
        <LanguageSelector
          currentLanguage={language}
          onSelect={onLanguageChange}
        />
        <p className="text-gray-500 text-xs px-1">
          Chat responses will be in your selected language.
        </p>
      </Section>

      {/* ── PERSONAL INFO ── */}
      <Section title="Your Profile">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Your name"
            className="bg-gray-800 text-white placeholder-gray-500
                       rounded-xl px-4 py-3 text-sm outline-none
                       border border-gray-700 focus:border-red-500 transition-colors"
          />
          <input
            type="tel"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            placeholder="Your phone number"
            className="bg-gray-800 text-white placeholder-gray-500
                       rounded-xl px-4 py-3 text-sm outline-none
                       border border-gray-700 focus:border-red-500 transition-colors"
          />
          <button
            onClick={handleSaveProfile}
            className={`py-2.5 rounded-xl text-sm font-medium transition-colors
                        ${saved ? 'bg-green-700 text-green-100' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
          >
            {saved ? '✅ Profile Saved' : 'Save Profile'}
          </button>
        </div>
      </Section>

      {/* ── EMERGENCY CONTACTS ── */}
      <Section title={`Emergency Contacts (${contacts.length})`}>
        {contacts.length > 0 && (
          <div className="flex flex-col gap-2">
            {contacts.map((contact) => (
              <ContactRow key={contact.id} contact={contact} onRemove={removeContact} />
            ))}
          </div>
        )}
        <AddContactForm onAdd={addContact} />
        <p className="text-gray-500 text-xs px-1">
          Add family members or friends. They will be alerted via SMS in an emergency.
        </p>
      </Section>

      {/* ── SOS ALERT ── */}
      <Section title="SOS Alert">
        <SOSAlert contacts={contacts} location={location} />
      </Section>

      {/* ── APP INFO ── */}
      <Section title="About">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🚨</span>
            <div>
              <p className="text-white font-bold">RoadSOS</p>
              <p className="text-gray-400 text-xs">AI Emergency Road Safety Assistant</p>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 text-xs text-gray-500">
            <p>📌 Version 1.0.0</p>
            <p>🌐 Data from OpenStreetMap</p>
            <p>🤖 AI powered by Groq (Llama 3.3)</p>
            <p>🔒 All data stored locally on your device</p>
            <p>🗣️ 8 Indian languages supported</p>
          </div>
        </div>
      </Section>

      {/* ── EMERGENCY QUICK REFERENCE ── */}
      <Section title="Emergency Quick Reference">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: 'Ambulance', number: '108', icon: '🚑' },
              { label: 'Police', number: '112', icon: '🚔' },
              { label: 'Fire Brigade', number: '101', icon: '🚒' },
              { label: 'Highway Help', number: '1033', icon: '🛣️' },
            ].map((item) => (
              <button
                key={item.number}
                onClick={() => { window.location.href = `tel:${item.number}` }}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700
                           rounded-lg px-3 py-2 transition-colors border border-gray-700
                           hover:border-red-600"
              >
                <span>{item.icon}</span>
                <div className="text-left">
                  <p className="text-gray-300 font-medium">{item.number}</p>
                  <p className="text-gray-500" style={{ fontSize: '10px' }}>{item.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Section>

      <div className="h-4" />
    </div>
  )
}