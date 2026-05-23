import { useState, useEffect } from 'react'

const BACKEND_URL = 'http://localhost:3001'

// Saves report to localStorage
function saveReport(report) {
  try {
    const existing = JSON.parse(localStorage.getItem('roadsos_reports') || '[]')
    existing.unshift(report) // newest first
    // Keep only last 5 reports
    localStorage.setItem('roadsos_reports', JSON.stringify(existing.slice(0, 5)))
  } catch {}
}

// Loads saved reports from localStorage
function loadReports() {
  try {
    return JSON.parse(localStorage.getItem('roadsos_reports') || '[]')
  } catch {
    return []
  }
}

// Input field component
function FormField({ label, value, onChange, placeholder, type = 'text', multiline = false }) {
  const baseClass = `w-full bg-gray-800 text-white placeholder-gray-500
                     rounded-xl px-4 py-3 text-sm outline-none
                     border border-gray-700 focus:border-red-500 transition-colors`
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-gray-400 text-xs font-medium px-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${baseClass} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseClass}
        />
      )}
    </div>
  )
}

// Select dropdown component
function FormSelect({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-gray-400 text-xs font-medium px-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 text-sm
                   outline-none border border-gray-700 focus:border-red-500
                   transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// Section header
function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-lg">{icon}</span>
      <h3 className="text-white font-semibold text-sm">{title}</h3>
    </div>
  )
}

// Generated report display
function ReportDisplay({ report, onClear }) {
  const [copied, setCopied] = useState(false)
  const [shareSuccess, setShareSuccess] = useState('')

  const handleCopy = () => {
    navigator.clipboard.writeText(report.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(report.text)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
  }

  const handleSMS = () => {
    const encoded = encodeURIComponent(report.text)
    window.location.href = `sms:?body=${encoded}`
  }

  const handleDownload = () => {
    const blob = new Blob([report.text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `RoadSOS_Report_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Report header */}
      <div className="bg-green-950 border border-green-700 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-green-400">✅</span>
          <p className="text-green-300 font-semibold text-sm">Report Generated</p>
        </div>
        <p className="text-green-400 text-xs">
          {new Date(report.createdAt).toLocaleString()}
        </p>
      </div>

      {/* Report text */}
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4">
        <pre className="text-gray-200 text-xs leading-relaxed whitespace-pre-wrap font-mono">
          {report.text}
        </pre>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleCopy}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl
                      text-sm font-medium transition-colors border
                      ${copied
                        ? 'bg-green-700 border-green-600 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                      }`}
        >
          {copied ? '✅ Copied!' : '📋 Copy Text'}
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 py-3 rounded-xl
                     text-sm font-medium bg-gray-800 border border-gray-700
                     text-gray-300 hover:border-gray-500 transition-colors"
        >
          💾 Download
        </button>

        <button
          onClick={handleWhatsApp}
          className="flex items-center justify-center gap-2 py-3 rounded-xl
                     text-sm font-medium bg-green-700 hover:bg-green-600
                     text-white transition-colors"
        >
          📱 WhatsApp
        </button>

        <button
          onClick={handleSMS}
          className="flex items-center justify-center gap-2 py-3 rounded-xl
                     text-sm font-medium bg-blue-700 hover:bg-blue-600
                     text-white transition-colors"
        >
          💬 Send SMS
        </button>
      </div>

      {/* New report button */}
      <button
        onClick={onClear}
        className="w-full py-3 rounded-xl text-sm font-medium
                   bg-gray-800 hover:bg-gray-700 text-gray-300
                   border border-gray-700 transition-colors"
      >
        + Create New Report
      </button>
    </div>
  )
}

// Saved reports list
function SavedReports({ reports, onLoad }) {
  if (reports.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider px-1">
        Previously Generated Reports ({reports.length})
      </h3>
      {reports.map((report, i) => (
        <button
          key={i}
          onClick={() => onLoad(report)}
          className="flex items-center justify-between bg-gray-900 border
                     border-gray-800 rounded-xl px-4 py-3 text-left
                     hover:border-gray-600 transition-colors"
        >
          <div>
            <p className="text-white text-xs font-medium">
              {report.formData?.accidentType || 'Incident'} Report
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              {new Date(report.createdAt).toLocaleDateString()} —{' '}
              {report.formData?.location || 'Location not specified'}
            </p>
          </div>
          <span className="text-gray-500 text-xs ml-2">View →</span>
        </button>
      ))}
    </div>
  )
}

// Main Incident Report component
export default function IncidentReport({ location, locationName, language }) {
  const [step, setStep] = useState('form') // 'form' | 'generating' | 'result'
  const [generatedReport, setGeneratedReport] = useState(null)
  const [savedReports, setSavedReports] = useState([])
  const [error, setError] = useState(null)
  const [streamingText, setStreamingText] = useState('')

  // Form fields
  const [accidentDate, setAccidentDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [accidentTime, setAccidentTime] = useState(
    new Date().toTimeString().slice(0, 5)
  )
  const [accidentLocation, setAccidentLocation] = useState(locationName || '')
  const [accidentType, setAccidentType] = useState('vehicle_collision')
  const [vehiclesInvolved, setVehiclesInvolved] = useState('')
  const [injuriesDescription, setInjuriesDescription] = useState('')
  const [witnesses, setWitnesses] = useState('')
  const [reporterName, setReporterName] = useState('')
  const [reporterPhone, setReporterPhone] = useState('')
  const [additionalDetails, setAdditionalDetails] = useState('')
  const [servicesContacted, setServicesContacted] = useState([])

  // Load saved reports on mount
  useEffect(() => {
    setSavedReports(loadReports())
  }, [])

  // Update location field when GPS location loads
  useEffect(() => {
    if (locationName && !accidentLocation) {
      setAccidentLocation(locationName)
    }
  }, [locationName])

  const accidentTypes = [
    { value: 'vehicle_collision',  label: '🚗 Vehicle Collision' },
    { value: 'hit_and_run',        label: '🚘 Hit and Run' },
    { value: 'pedestrian_hit',     label: '🚶 Pedestrian Hit' },
    { value: 'vehicle_fire',       label: '🔥 Vehicle Fire' },
    { value: 'breakdown',          label: '🔧 Vehicle Breakdown' },
    { value: 'tyre_burst',         label: '🔩 Tyre Burst' },
    { value: 'head_on_collision',  label: '💥 Head-on Collision' },
    { value: 'rear_end_collision', label: '🚙 Rear-end Collision' },
    { value: 'overturned_vehicle', label: '🔄 Overturned Vehicle' },
    { value: 'other',              label: '📋 Other' },
  ]

  const serviceOptions = [
    '🚑 Ambulance (108)',
    '🚔 Police (112)',
    '🚒 Fire Brigade (101)',
    '🛣️ NHAI Helpline (1033)',
    '🏥 Hospital',
    '🔧 Tow Truck',
  ]

  const toggleService = (service) => {
    setServicesContacted((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    )
  }

  const handleGenerate = async () => {
    // Basic validation
    if (!accidentLocation.trim()) {
      setError('Please enter the accident location')
      return
    }
    if (!vehiclesInvolved.trim()) {
      setError('Please describe the vehicles involved')
      return
    }

    setError(null)
    setStep('generating')
    setStreamingText('')

    // Build the form data summary for the AI
    const formData = {
      accidentDate,
      accidentTime,
      location: accidentLocation,
      accidentType: accidentTypes.find((t) => t.value === accidentType)?.label || accidentType,
      vehiclesInvolved,
      injuriesDescription: injuriesDescription || 'No injuries reported',
      witnesses: witnesses || 'No witnesses recorded',
      reporterName: reporterName || 'Anonymous',
      reporterPhone: reporterPhone || 'Not provided',
      additionalDetails: additionalDetails || 'None',
      servicesContacted: servicesContacted.length > 0
        ? servicesContacted.join(', ')
        : 'None contacted yet',
      gpsCoordinates: location
        ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
        : 'Not available',
    }

    // Language names for the prompt
    const languageNames = {
      en: 'English', hi: 'Hindi', ta: 'Tamil',
      te: 'Telugu', mr: 'Marathi', bn: 'Bengali',
      kn: 'Kannada', gu: 'Gujarati',
    }
    const langName = languageNames[language] || 'English'

    const prompt = `Generate a formal road accident incident report based on these details:

ACCIDENT DETAILS:
- Date: ${formData.accidentDate}
- Time: ${formData.accidentTime}
- Location: ${formData.location}
- GPS Coordinates: ${formData.gpsCoordinates}
- Type of Accident: ${formData.accidentType}
- Vehicles Involved: ${formData.vehiclesInvolved}
- Injuries: ${formData.injuriesDescription}
- Witnesses: ${formData.witnesses}
- Services Contacted: ${formData.servicesContacted}
- Additional Details: ${formData.additionalDetails}

REPORTER INFORMATION:
- Name: ${formData.reporterName}
- Phone: ${formData.reporterPhone}
- Report Generated: ${new Date().toLocaleString()}
- Generated By: RoadSOS AI Emergency Assistant

Please generate a complete, formal incident report that can be submitted to:
1. Police station (for FIR filing)
2. Insurance company
3. Hospital records

The report should:
- Be professional and formal in tone
- Include all provided details clearly
- Have proper sections with headers
- Include a declaration statement at the end
- Be written entirely in ${langName}
- Include placeholder lines for signatures

Format it as a proper official document.`

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          language: language || 'en',
        }),
      })

      if (!response.ok) throw new Error(`Server error: ${response.status}`)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setStreamingText(fullText)
      }

      // Save the completed report
      const report = {
        text: fullText,
        formData,
        createdAt: new Date().toISOString(),
      }

      saveReport(report)
      setGeneratedReport(report)
      setSavedReports(loadReports())
      setStep('result')

    } catch (err) {
      setError(`Failed to generate report: ${err.message}`)
      setStep('form')
    }
  }

  // Show generating / streaming screen
  if (step === 'generating') {
    return (
      <div className="flex flex-col h-full px-4 py-6">
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <div className="w-12 h-12 border-2 border-red-500 border-t-transparent
                          rounded-full animate-spin" />
          <h2 className="text-white font-bold text-lg">Generating Report...</h2>
          <p className="text-gray-400 text-sm text-center">
            AI is creating your formal incident report
          </p>
        </div>

        {/* Show streaming text preview */}
        {streamingText && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 max-h-64 overflow-y-auto">
            <pre className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap font-mono">
              {streamingText}
              <span className="inline-block w-0.5 h-3 bg-red-400 ml-0.5 animate-pulse align-middle" />
            </pre>
          </div>
        )}
      </div>
    )
  }

  // Show generated result
  if (step === 'result' && generatedReport) {
    return (
      <div className="flex flex-col h-full px-4 py-4 overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-white text-xl font-bold">Incident Report</h2>
          <p className="text-gray-400 text-xs mt-1">
            Share with police, hospital, or insurance
          </p>
        </div>
        <ReportDisplay
          report={generatedReport}
          onClear={() => {
            setStep('form')
            setGeneratedReport(null)
            setStreamingText('')
          }}
        />
        <div className="h-4" />
      </div>
    )
  }

  // Show the form
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-white text-xl font-bold">Incident Report</h2>
        <p className="text-gray-400 text-xs mt-1">
          Fill in the details — AI generates the formal report
        </p>
      </div>

      <div className="flex flex-col gap-5 px-4 pb-4">

        {/* Error message */}
        {error && (
          <div className="bg-red-950 border border-red-700 rounded-xl px-4 py-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* ── ACCIDENT DETAILS ── */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <SectionHeader icon="🕐" title="Accident Details" />
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Date"
                type="date"
                value={accidentDate}
                onChange={setAccidentDate}
              />
              <FormField
                label="Time"
                type="time"
                value={accidentTime}
                onChange={setAccidentTime}
              />
            </div>
            <FormField
              label="Location *"
              value={accidentLocation}
              onChange={setAccidentLocation}
              placeholder="Road name, landmark, city..."
            />
            {location && (
              <p className="text-gray-500 text-xs px-1">
                📍 GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}
            <FormSelect
              label="Type of Accident"
              value={accidentType}
              onChange={setAccidentType}
              options={accidentTypes}
            />
          </div>
        </div>

        {/* ── VEHICLES ── */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <SectionHeader icon="🚗" title="Vehicles Involved *" />
          <FormField
            value={vehiclesInvolved}
            onChange={setVehiclesInvolved}
            placeholder="E.g. White Honda City MH-12-AB-1234, Red truck..."
            multiline
          />
        </div>

        {/* ── INJURIES ── */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <SectionHeader icon="🩺" title="Injuries / Casualties" />
          <FormField
            value={injuriesDescription}
            onChange={setInjuriesDescription}
            placeholder="Describe injuries if any, or write 'No injuries'"
            multiline
          />
        </div>

        {/* ── SERVICES CONTACTED ── */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <SectionHeader icon="📞" title="Emergency Services Contacted" />
          <div className="flex flex-wrap gap-2">
            {serviceOptions.map((service) => (
              <button
                key={service}
                onClick={() => toggleService(service)}
                className={`text-xs px-3 py-2 rounded-xl border transition-colors
                            ${servicesContacted.includes(service)
                              ? 'bg-red-700 border-red-500 text-white'
                              : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                            }`}
              >
                {service}
              </button>
            ))}
          </div>
        </div>

        {/* ── WITNESSES ── */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <SectionHeader icon="👁️" title="Witnesses" />
          <FormField
            value={witnesses}
            onChange={setWitnesses}
            placeholder="Names and contact numbers of witnesses..."
            multiline
          />
        </div>

        {/* ── REPORTER ── */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <SectionHeader icon="👤" title="Your Information" />
          <div className="flex flex-col gap-3">
            <FormField
              label="Your Name"
              value={reporterName}
              onChange={setReporterName}
              placeholder="Full name"
            />
            <FormField
              label="Your Phone"
              type="tel"
              value={reporterPhone}
              onChange={setReporterPhone}
              placeholder="Contact number"
            />
          </div>
        </div>

        {/* ── ADDITIONAL DETAILS ── */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <SectionHeader icon="📝" title="Additional Details" />
          <FormField
            value={additionalDetails}
            onChange={setAdditionalDetails}
            placeholder="Weather conditions, road type, any other relevant information..."
            multiline
          />
        </div>

        {/* GENERATE BUTTON */}
        <button
          onClick={handleGenerate}
          className="w-full py-4 bg-red-600 hover:bg-red-500 text-white
                     font-bold text-lg rounded-2xl transition-all
                     active:scale-95 shadow-lg"
        >
          🤖 Generate Formal Report
        </button>

        <p className="text-gray-500 text-xs text-center">
          AI generates a report ready for police, insurance and hospital
        </p>

        {/* Saved reports */}
        {savedReports.length > 0 && (
          <SavedReports
            reports={savedReports}
            onLoad={(report) => {
              setGeneratedReport(report)
              setStep('result')
            }}
          />
        )}

        <div className="h-4" />
      </div>
    </div>
  )
}