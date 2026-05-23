import { useState } from 'react'

const BACKEND_URL = 'http://localhost:3001'

// Offline tips — always available even without internet
const OFFLINE_TIPS = [
  {
    id: 1,
    category: 'highway',
    icon: '🛣️',
    title: 'Keep the 3-second gap',
    tip: 'On highways, maintain at least a 3-second following distance from the vehicle ahead. In rain or fog, double it to 6 seconds. This gives you time to react if they brake suddenly.',
    source: 'Ministry of Road Transport',
  },
  {
    id: 2,
    category: 'highway',
    icon: '🚦',
    title: 'Never overtake on a curve',
    tip: 'Overtaking on curves or crests of hills is one of the leading causes of head-on collisions. Always wait for a straight, clearly visible stretch before overtaking.',
    source: 'NHAI Safety Guidelines',
  },
  {
    id: 3,
    category: 'monsoon',
    icon: '🌧️',
    title: 'Aquaplaning — what to do',
    tip: 'If your car aquaplanes (skids on water), do NOT brake suddenly. Ease off the accelerator gently, hold the steering wheel straight, and let the car slow down naturally.',
    source: 'Road Safety Expert',
  },
  {
    id: 4,
    category: 'monsoon',
    icon: '💡',
    title: 'Use headlights in rain',
    tip: 'Turn on headlights in heavy rain — not just for visibility but so other drivers can see you. In India, driving without lights in rain at night causes hundreds of accidents annually.',
    source: 'Traffic Police Advisory',
  },
  {
    id: 5,
    category: 'night',
    icon: '🌙',
    title: 'Dim your headlights for oncoming traffic',
    tip: 'Switch from high beam to low beam when you see oncoming headlights. High beam blinds the other driver for up to 5 seconds — enough to cause a fatal accident.',
    source: 'Road Safety Council',
  },
  {
    id: 6,
    category: 'night',
    icon: '😴',
    title: 'Stop when drowsy — seriously',
    tip: 'Driving while drowsy is as dangerous as drunk driving. If you feel sleepy, pull over at the next safe spot and rest for 20 minutes. No destination is worth your life.',
    source: 'WHO Road Safety Report',
  },
  {
    id: 7,
    category: 'rules',
    icon: '🪖',
    title: 'Helmet saves your life — not your wallet',
    tip: 'A proper ISI-marked helmet reduces the risk of fatal head injury by 42%. Wear it correctly — the strap should be tight enough that you cannot fit two fingers under it.',
    source: 'NCRB Data 2023',
  },
  {
    id: 8,
    category: 'rules',
    icon: '📱',
    title: 'Phone in hand = 4x crash risk',
    tip: 'Using a mobile phone while driving increases crash risk by 4 times. Even hands-free calls impair driving. If you must call, pull over completely before picking up.',
    source: 'WHO Road Safety',
  },
  {
    id: 9,
    category: 'firstresponder',
    icon: '🤝',
    title: 'Good Samaritan Law protects you',
    tip: 'In India, the Good Samaritan Law (2016) protects bystanders who help accident victims. You cannot be harassed by police or hospitals if you stop to help. Help without fear.',
    source: 'Supreme Court of India',
  },
  {
    id: 10,
    category: 'firstresponder',
    icon: '🚗',
    title: 'Move the victim only if necessary',
    tip: 'Do not move an accident victim unless there is immediate danger (fire, traffic). Moving someone with a spinal injury incorrectly can cause permanent paralysis.',
    source: 'Indian Red Cross',
  },
  {
    id: 11,
    category: 'highway',
    icon: '⚠️',
    title: 'Warning triangle placement',
    tip: 'Place a warning triangle at least 50 metres behind a broken-down vehicle on highways. At night or in fog, increase this to 100 metres to give other drivers enough warning time.',
    source: 'NHAI Guidelines',
  },
  {
    id: 12,
    category: 'monsoon',
    icon: '🌊',
    title: 'Never drive through flooded roads',
    tip: 'Just 30cm of fast-moving water can knock you off your feet. 60cm can float most cars. If you cannot see the road surface, do not enter. Turn around, never drown.',
    source: 'NDMA India',
  },
]

const CATEGORIES = [
  { id: 'all',            label: 'All Tips',        icon: '💡' },
  { id: 'highway',        label: 'Highway',         icon: '🛣️' },
  { id: 'monsoon',        label: 'Monsoon',         icon: '🌧️' },
  { id: 'night',          label: 'Night Driving',   icon: '🌙' },
  { id: 'rules',          label: 'Traffic Rules',   icon: '🚦' },
  { id: 'firstresponder', label: 'First Responder', icon: '🤝' },
]

// Single tip card
function TipCard({ tip, onShare }) {
  const [expanded, setExpanded] = useState(false)

  const handleShare = () => {
    const text = `🚗 Road Safety Tip\n\n${tip.title}\n\n${tip.tip}\n\nSource: ${tip.source}\n\nShared via RoadSOS`
    const encoded = encodeURIComponent(text)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4
                    hover:border-gray-600 transition-colors">
      {/* Header */}
      <div className="flex items-start gap-3 mb-2">
        <span className="text-2xl flex-shrink-0">{tip.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm leading-tight">
            {tip.title}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">
            {CATEGORIES.find((c) => c.id === tip.category)?.label || tip.category}
          </p>
        </div>
      </div>

      {/* Tip text */}
      <p className={`text-gray-300 text-xs leading-relaxed
                     ${!expanded && tip.tip.length > 120 ? 'line-clamp-3' : ''}`}>
        {tip.tip}
      </p>

      {/* Read more / less */}
      {tip.tip.length > 120 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-red-400 text-xs mt-1 hover:text-red-300"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-gray-600 text-xs">📚 {tip.source}</span>
        <button
          onClick={handleShare}
          className="flex items-center gap-1 text-xs text-green-400
                     hover:text-green-300 transition-colors"
        >
          📱 <span>Share</span>
        </button>
      </div>
    </div>
  )
}

// AI-generated tip card
function AITipCard({ tip, loading }) {
  const handleShare = () => {
    if (!tip) return
    const text = `🤖 AI Road Safety Tip\n\n${tip}\n\nGenerated by RoadSOS AI`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="bg-red-950 border border-red-800 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🤖</span>
        <p className="text-red-300 text-sm font-semibold">AI Safety Tip</p>
        {loading && (
          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent
                          rounded-full animate-spin ml-auto" />
        )}
      </div>

      {loading && !tip && (
        <p className="text-red-400 text-xs">Generating tip...</p>
      )}

      {tip && (
        <>
          <p className="text-gray-200 text-xs leading-relaxed">{tip}</p>
          <div className="flex justify-end mt-3">
            <button
              onClick={handleShare}
              className="text-xs text-green-400 hover:text-green-300"
            >
              📱 Share
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Main Safety Tips component
export default function SafetyTips() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [aiTip, setAiTip]                   = useState('')
  const [aiLoading, setAiLoading]           = useState(false)
  const [aiCategory, setAiCategory]         = useState('highway')

  const filteredTips = activeCategory === 'all'
    ? OFFLINE_TIPS
    : OFFLINE_TIPS.filter((t) => t.category === activeCategory)

  // Generate an AI tip for the selected category
  const generateAITip = async () => {
    setAiLoading(true)
    setAiTip('')

    const categoryName = CATEGORIES.find((c) => c.id === aiCategory)?.label || aiCategory

    const prompt = `Generate ONE practical, specific road safety tip for Indian drivers about: ${categoryName}.

Rules:
- Make it specific and actionable, not generic
- Include a specific statistic or fact if relevant
- Keep it under 80 words
- Make it something most people do not know
- Focus on India-specific road conditions
- Do not use bullet points, just a short paragraph
- Start directly with the tip, no preamble`

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          language: 'en',
        }),
      })

      if (!response.ok) throw new Error('Failed')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setAiTip(full)
      }
    } catch {
      setAiTip('Could not generate tip. Check your internet connection.')
    }

    setAiLoading(false)
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-white text-xl font-bold">Road Safety Tips</h2>
        <p className="text-gray-400 text-xs mt-1">
          Stay safe — tips work offline
        </p>
      </div>

      {/* AI Tip Generator */}
      <div className="mx-4 mb-3 bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <p className="text-white text-xs font-semibold mb-2">
          🤖 Generate AI tip for:
        </p>
        <div className="flex gap-2">
          <select
            value={aiCategory}
            onChange={(e) => setAiCategory(e.target.value)}
            className="flex-1 bg-gray-800 text-white text-xs rounded-xl
                       px-3 py-2 border border-gray-700 outline-none"
          >
            {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
            ))}
          </select>
          <button
            onClick={generateAITip}
            disabled={aiLoading}
            className="bg-red-600 hover:bg-red-500 disabled:bg-gray-700
                       text-white text-xs font-medium px-4 py-2 rounded-xl
                       transition-colors disabled:cursor-not-allowed"
          >
            {aiLoading ? '...' : 'Generate'}
          </button>
        </div>
        {(aiTip || aiLoading) && (
          <div className="mt-3">
            <AITipCard tip={aiTip} loading={aiLoading} />
          </div>
        )}
      </div>

      {/* Category filter */}
      <div className="px-4 mb-3 overflow-x-auto">
        <div className="flex gap-2 w-max">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full
                          text-xs font-medium whitespace-nowrap border transition-colors
                          ${activeCategory === cat.id
                            ? 'bg-red-600 border-red-500 text-white'
                            : 'bg-gray-800 border-gray-700 text-gray-400'
                          }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tips count */}
      <p className="text-gray-500 text-xs px-4 mb-3">
        {filteredTips.length} tip{filteredTips.length !== 1 ? 's' : ''}
        {activeCategory !== 'all'
          ? ` · ${CATEGORIES.find((c) => c.id === activeCategory)?.label}`
          : ''
        }
      </p>

      {/* Tips list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-3">
          {filteredTips.map((tip) => (
            <TipCard key={tip.id} tip={tip} />
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 mt-4 py-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-gray-500 text-xs">All tips available offline</span>
        </div>
        <div className="h-4" />
      </div>

    </div>
  )
}