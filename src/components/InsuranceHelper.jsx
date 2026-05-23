import { useState } from 'react'

const BACKEND_URL = 'http://localhost:3001'

// Step-by-step insurance guide — works offline
const INSURANCE_STEPS = [
  {
    step: 1,
    icon: '📸',
    title: 'Photograph everything',
    description: 'Take photos immediately — before any vehicles are moved.',
    checklist: [
      'All vehicles involved from multiple angles',
      'Damage close-up on each vehicle',
      'Number plates of all vehicles',
      'Road conditions, skid marks, debris',
      'Traffic signals or signs nearby',
      'Injuries (for medical claim)',
    ],
  },
  {
    step: 2,
    icon: '📝',
    title: 'Collect information',
    description: 'Exchange details with the other driver(s).',
    checklist: [
      'Full name and phone number',
      'Vehicle registration number',
      'Insurance policy number',
      'Insurance company name',
      'Driving licence number',
      'Names and phones of witnesses',
    ],
  },
  {
    step: 3,
    icon: '🚔',
    title: 'File a police FIR',
    description: 'An FIR is mandatory for insurance claims above ₹1 lakh.',
    checklist: [
      'Go to nearest police station',
      'Bring your driving licence and RC',
      'Carry your insurance policy copy',
      'Get FIR copy with case number',
      'Note the investigating officer\'s name',
    ],
  },
  {
    step: 4,
    icon: '📞',
    title: 'Inform your insurer',
    description: 'Call your insurance company within 24 hours of the accident.',
    checklist: [
      'Call the toll-free claims number',
      'Give your policy number',
      'Describe the accident briefly',
      'Get the claim reference number',
      'Ask about cashless garage network',
      'Ask about surveyor visit timeline',
    ],
  },
  {
    step: 5,
    icon: '🏥',
    title: 'For injuries — personal accident claim',
    description: 'If you or passengers are injured, file a PA claim.',
    checklist: [
      'Keep all medical bills and receipts',
      'Get doctor\'s certificate of injury',
      'Photograph injuries (time-stamped)',
      'Record treatment timeline',
      'Keep discharge summary from hospital',
    ],
  },
  {
    step: 6,
    icon: '📋',
    title: 'Documents for claim submission',
    description: 'Collect all of these before visiting the insurance office.',
    checklist: [
      'FIR copy (certified)',
      'Claim form (from insurer)',
      'Driving licence (self + other driver)',
      'RC of your vehicle',
      'Insurance policy copy',
      'Repair estimate from garage',
      'All photos from accident scene',
      'Hospital bills (if injured)',
    ],
  },
]

// Insurer helpline numbers
const INSURER_HELPLINES = [
  { name: 'New India Assurance',  number: '1800-209-1415', icon: '🏢' },
  { name: 'United India Insurance', number: '1800-425-3333', icon: '🏢' },
  { name: 'Oriental Insurance',   number: '1800-118-485',  icon: '🏢' },
  { name: 'National Insurance',   number: '1800-200-7710', icon: '🏢' },
  { name: 'ICICI Lombard',        number: '1800-2666',     icon: '🏦' },
  { name: 'HDFC ERGO',            number: '0120-6234-6234', icon: '🏦' },
  { name: 'Bajaj Allianz',        number: '1800-209-5858', icon: '🏦' },
  { name: 'Tata AIG',             number: '1800-266-7780', icon: '🏦' },
]

// Checklist item with tick
function CheckItem({ text, checked, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-start gap-3 py-1.5 text-left w-full"
    >
      <div className={`w-5 h-5 rounded flex items-center justify-center
                       flex-shrink-0 mt-0.5 border transition-colors
                       ${checked
                         ? 'bg-green-600 border-green-500'
                         : 'bg-gray-800 border-gray-600'
                       }`}>
        {checked && <span className="text-white text-xs">✓</span>}
      </div>
      <span className={`text-xs leading-relaxed transition-colors
                        ${checked ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
        {text}
      </span>
    </button>
  )
}

// Step accordion card
function StepCard({ stepData }) {
  const [expanded,   setExpanded]   = useState(false)
  const [checkedMap, setCheckedMap] = useState({})

  const toggleCheck = (i) => {
    setCheckedMap((prev) => ({ ...prev, [i]: !prev[i] }))
  }

  const completedCount = Object.values(checkedMap).filter(Boolean).length
  const totalCount     = stepData.checklist.length
  const allDone        = completedCount === totalCount

  return (
    <div className={`rounded-2xl border overflow-hidden transition-colors
                     ${allDone
                       ? 'bg-green-950 border-green-700'
                       : 'bg-gray-900 border-gray-800'
                     }`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className={`w-9 h-9 rounded-full flex items-center justify-center
                         text-lg flex-shrink-0
                         ${allDone ? 'bg-green-700' : 'bg-gray-800'}`}>
          {allDone ? '✅' : stepData.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold">
            Step {stepData.step}: {stepData.title}
          </p>
          <p className="text-gray-400 text-xs mt-0.5 truncate">
            {stepData.description}
          </p>
        </div>
        <div className="flex flex-col items-end flex-shrink-0 ml-2">
          <span className="text-xs text-gray-500">
            {completedCount}/{totalCount}
          </span>
          <span className="text-gray-500 text-sm mt-1">
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-800 pt-3">
          <div className="flex flex-col">
            {stepData.checklist.map((item, i) => (
              <CheckItem
                key={i}
                text={item}
                checked={!!checkedMap[i]}
                onToggle={() => toggleCheck(i)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// AI insurance question answerer
function AIInsuranceChat() {
  const [question,  setQuestion]  = useState('')
  const [answer,    setAnswer]    = useState('')
  const [loading,   setLoading]   = useState(false)
  const [streaming, setStreaming] = useState('')

  const QUICK_QUESTIONS = [
    'What if the other driver has no insurance?',
    'Can I claim if the accident was my fault?',
    'How long does a claim take to settle?',
    'What is a No Claim Bonus?',
    'Can I get a cashless repair?',
    'What documents are needed for total loss?',
  ]

  const askQuestion = async (q) => {
    const query = q || question
    if (!query.trim()) return

    setLoading(true)
    setAnswer('')
    setStreaming('')

    const prompt = `You are an expert on Indian motor vehicle insurance. Answer this question clearly and practically:

"${query}"

Rules:
- Give specific, actionable information for India
- Mention relevant laws if applicable (Motor Vehicles Act, IRDAI regulations)
- Keep under 100 words
- Be direct and helpful
- Do not recommend specific insurance companies
- End with one practical tip`

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

      const reader  = response.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setStreaming(full)
      }

      setAnswer(full)
      setStreaming('')
    } catch {
      setAnswer('Could not get answer. Check internet connection.')
    }

    setLoading(false)
    setQuestion('')
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🤖</span>
        <p className="text-white text-sm font-semibold">Insurance Questions — Ask AI</p>
      </div>

      {/* Quick questions */}
      <div className="flex flex-wrap gap-2 mb-3">
        {QUICK_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => askQuestion(q)}
            disabled={loading}
            className="text-xs bg-gray-800 border border-gray-700
                       hover:border-red-500 text-gray-300 px-3 py-1.5
                       rounded-full transition-colors disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Custom question */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
          placeholder="Ask any insurance question..."
          className="flex-1 bg-gray-800 text-white placeholder-gray-500
                     rounded-xl px-4 py-2.5 text-xs outline-none
                     border border-gray-700 focus:border-red-500"
        />
        <button
          onClick={() => askQuestion()}
          disabled={!question.trim() || loading}
          className="bg-red-600 hover:bg-red-500 disabled:bg-gray-700
                     text-white rounded-xl px-4 text-xs font-medium
                     transition-colors disabled:cursor-not-allowed"
        >
          Ask
        </button>
      </div>

      {/* Answer */}
      {(loading || streaming || answer) && (
        <div className="bg-gray-800 rounded-xl p-3">
          {loading && !streaming && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent
                              rounded-full animate-spin" />
              <span className="text-gray-400 text-xs">Thinking...</span>
            </div>
          )}
          {(streaming || answer) && (
            <p className="text-gray-200 text-xs leading-relaxed">
              {streaming || answer}
              {streaming && (
                <span className="inline-block w-0.5 h-3 bg-red-400 ml-0.5
                                 animate-pulse align-middle" />
              )}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// Main Insurance Helper component
export default function InsuranceHelper() {
  const [activeTab, setActiveTab] = useState('steps')

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-white text-xl font-bold">Insurance Helper</h2>
        <p className="text-gray-400 text-xs mt-1">
          Post-accident insurance guide for India
        </p>
      </div>

      {/* Tab selector */}
      <div className="px-4 mb-3 flex gap-2">
        {[
          { id: 'steps',     label: '📋 Steps',    },
          { id: 'helplines', label: '📞 Helplines', },
          { id: 'ai',        label: '🤖 Ask AI',    },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium
                        border transition-colors
                        ${activeTab === tab.id
                          ? 'bg-red-600 border-red-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-400'
                        }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">

        {/* Steps tab */}
        {activeTab === 'steps' && (
          <div className="flex flex-col gap-3">
            <p className="text-gray-400 text-xs">
              Tap each step to expand. Check items as you complete them.
            </p>
            {INSURANCE_STEPS.map((step) => (
              <StepCard key={step.step} stepData={step} />
            ))}
            <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-3 mt-2">
              <p className="text-yellow-300 text-xs font-semibold mb-1">
                ⏰ Important deadlines
              </p>
              <div className="flex flex-col gap-1">
                {[
                  'Inform insurer: within 24 hours',
                  'File FIR: within 24 hours for theft, within 48h for accidents',
                  'Submit claim: within 7 days of accident',
                  'Appeal rejected claim: within 15 days',
                ].map((d, i) => (
                  <p key={i} className="text-yellow-200 text-xs">• {d}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Helplines tab */}
        {activeTab === 'helplines' && (
          <div className="flex flex-col gap-3">
            <p className="text-gray-400 text-xs mb-1">
              Toll-free 24/7 insurance helplines in India
            </p>
            {INSURER_HELPLINES.map((insurer, i) => (
              <div key={i}
                   className="flex items-center justify-between bg-gray-900
                              border border-gray-800 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{insurer.icon}</span>
                  <div>
                    <p className="text-white text-xs font-medium">{insurer.name}</p>
                    <p className="text-gray-400 text-xs font-mono">{insurer.number}</p>
                  </div>
                </div>
                <button
                  onClick={() => { window.location.href = `tel:${insurer.number}` }}
                  className="bg-green-700 hover:bg-green-600 text-white
                             text-xs font-medium px-3 py-2 rounded-lg
                             transition-colors"
                >
                  📞 Call
                </button>
              </div>
            ))}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 mt-1">
              <p className="text-gray-400 text-xs">
                💡 Don't know your insurer's number? It is printed on your
                insurance policy document or RC book. You can also check
                the IRDAI website: irdai.gov.in
              </p>
            </div>
          </div>
        )}

        {/* AI tab */}
        {activeTab === 'ai' && (
          <div className="flex flex-col gap-3">
            <AIInsuranceChat />
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  )
}