import { useState, useEffect, useRef } from 'react'

// All first aid content — works 100% offline
const FIRST_AID_CATEGORIES = [
  {
    id: 'cpr',
    icon: '❤️',
    title: 'CPR',
    subtitle: 'Person not breathing',
    color: 'bg-red-700',
    borderColor: 'border-red-600',
    urgent: true,
    steps: [
      {
        title: 'Check safety',
        instruction: 'Make sure the scene is safe. Check if the person responds — tap shoulders and shout "Are you okay?"',
        duration: 10,
        icon: '⚠️',
      },
      {
        title: 'Call for help',
        instruction: 'Call 108 immediately or ask someone nearby to call. Put on speaker so you can continue CPR.',
        duration: 15,
        icon: '📞',
        callNumber: '108',
      },
      {
        title: 'Open the airway',
        instruction: 'Tilt the head back gently and lift the chin. Look, listen and feel for breathing for no more than 10 seconds.',
        duration: 10,
        icon: '👄',
      },
      {
        title: 'Give rescue breaths',
        instruction: 'Pinch the nose. Cover their mouth with yours. Give 2 slow breaths — each lasting 1 second. Watch chest rise.',
        duration: 15,
        icon: '💨',
      },
      {
        title: 'Start chest compressions',
        instruction: 'Place heel of hand on centre of chest. Push down 5–6 cm hard and fast. Do 30 compressions at 100–120 per minute.',
        duration: 30,
        icon: '✊',
        isCPR: true,
      },
      {
        title: 'Repeat cycle',
        instruction: '30 compressions then 2 rescue breaths. Keep repeating until ambulance arrives or person starts breathing.',
        duration: 0,
        icon: '🔄',
      },
    ],
  },
  {
    id: 'bleeding',
    icon: '🩸',
    title: 'Severe Bleeding',
    subtitle: 'Control blood loss',
    color: 'bg-red-800',
    borderColor: 'border-red-700',
    urgent: true,
    steps: [
      {
        title: 'Call ambulance',
        instruction: 'Call 108 immediately for severe or uncontrolled bleeding.',
        duration: 10,
        icon: '📞',
        callNumber: '108',
      },
      {
        title: 'Apply pressure',
        instruction: 'Press firmly on the wound with a clean cloth, bandage, or clothing. Use both hands if needed.',
        duration: 0,
        icon: '✋',
      },
      {
        title: 'Keep pressing',
        instruction: 'Do NOT lift the cloth to check. Hold firm pressure for at least 10 minutes continuously.',
        duration: 600,
        icon: '⏱️',
      },
      {
        title: 'Add more cloth',
        instruction: 'If blood soaks through, add more cloth on top. Never remove the first layer — it helps clotting.',
        duration: 0,
        icon: '🩹',
      },
      {
        title: 'Elevate the limb',
        instruction: 'If the wound is on an arm or leg, raise it above the level of the heart to slow bleeding.',
        duration: 0,
        icon: '⬆️',
      },
      {
        title: 'Watch for shock',
        instruction: 'If person feels faint, is pale or confused — lay them down, raise their legs, keep them warm.',
        duration: 0,
        icon: '👁️',
      },
    ],
  },
  {
    id: 'choking',
    icon: '🤧',
    title: 'Choking',
    subtitle: 'Object stuck in airway',
    color: 'bg-orange-700',
    borderColor: 'border-orange-600',
    urgent: true,
    steps: [
      {
        title: 'Ask if they can cough',
        instruction: 'If the person can cough forcefully, encourage them to keep coughing. Do not interfere.',
        duration: 10,
        icon: '🗣️',
      },
      {
        title: 'Give 5 back blows',
        instruction: 'Lean them forward. Give 5 firm blows between the shoulder blades with the heel of your hand.',
        duration: 15,
        icon: '👊',
      },
      {
        title: 'Give 5 abdominal thrusts',
        instruction: 'Stand behind them. Make a fist above navel. Pull sharply inward and upward 5 times (Heimlich manoeuvre).',
        duration: 15,
        icon: '🤜',
      },
      {
        title: 'Repeat and call 108',
        instruction: 'Alternate 5 back blows and 5 abdominal thrusts. Call 108 if object does not come out after 3 cycles.',
        duration: 0,
        icon: '🔄',
        callNumber: '108',
      },
      {
        title: 'If unconscious',
        instruction: 'If they lose consciousness, lower them to the ground carefully and begin CPR immediately.',
        duration: 0,
        icon: '😴',
      },
    ],
  },
  {
    id: 'burns',
    icon: '🔥',
    title: 'Burns',
    subtitle: 'Heat or chemical burns',
    color: 'bg-yellow-700',
    borderColor: 'border-yellow-600',
    urgent: false,
    steps: [
      {
        title: 'Remove from danger',
        instruction: 'Move the person away from the heat source. If clothing is on fire — stop, drop, and roll.',
        duration: 0,
        icon: '🏃',
      },
      {
        title: 'Cool the burn',
        instruction: 'Run cool (not cold) water over the burn for at least 20 minutes. Do NOT use ice, butter or toothpaste.',
        duration: 1200,
        icon: '💧',
      },
      {
        title: 'Remove clothing',
        instruction: 'Gently remove clothing and jewellery near the burn — unless stuck to the skin.',
        duration: 0,
        icon: '👕',
      },
      {
        title: 'Cover loosely',
        instruction: 'Cover with a clean non-fluffy material — cling film or clean plastic bag works well. Do not wrap tightly.',
        duration: 0,
        icon: '🩹',
      },
      {
        title: 'Call for help',
        instruction: 'Call 108 for burns larger than your palm, on face/hands/genitals, or caused by chemicals/electricity.',
        duration: 0,
        icon: '📞',
        callNumber: '108',
      },
    ],
  },
  {
    id: 'fracture',
    icon: '🦴',
    title: 'Fracture / Broken Bone',
    subtitle: 'Suspected bone break',
    color: 'bg-blue-700',
    borderColor: 'border-blue-600',
    urgent: false,
    steps: [
      {
        title: 'Do not move the person',
        instruction: 'If spine or neck injury is suspected, do NOT move them at all. Call 108 and wait.',
        duration: 0,
        icon: '🛑',
        callNumber: '108',
      },
      {
        title: 'Immobilise the injury',
        instruction: 'Support the injured limb in the position found. Use rolled-up clothing or a makeshift splint.',
        duration: 0,
        icon: '📐',
      },
      {
        title: 'Apply a splint',
        instruction: 'Tie something rigid (stick, umbrella, rolled newspaper) alongside the limb. Pad it for comfort.',
        duration: 0,
        icon: '🪵',
      },
      {
        title: 'Do not straighten',
        instruction: 'Never try to push a bone back in or straighten a bent limb. Leave it as is.',
        duration: 0,
        icon: '❌',
      },
      {
        title: 'Treat for shock',
        instruction: 'Keep the person warm and still. Reassure them. Do not give food or water.',
        duration: 0,
        icon: '🤗',
      },
    ],
  },
  {
    id: 'stroke',
    icon: '🧠',
    title: 'Stroke',
    subtitle: 'FAST — act immediately',
    color: 'bg-purple-700',
    borderColor: 'border-purple-600',
    urgent: true,
    steps: [
      {
        title: 'F — Face drooping',
        instruction: 'Ask the person to smile. Is one side of the face drooping or numb? That is a warning sign.',
        duration: 10,
        icon: '😶',
      },
      {
        title: 'A — Arm weakness',
        instruction: 'Ask them to raise both arms. Does one arm drift down or feel weak? That is a warning sign.',
        duration: 10,
        icon: '💪',
      },
      {
        title: 'S — Speech difficulty',
        instruction: 'Ask them to repeat a simple phrase. Is speech slurred, strange, or impossible? Warning sign.',
        duration: 10,
        icon: '🗣️',
      },
      {
        title: 'T — Time to call 108',
        instruction: 'If ANY of these signs are present — call 108 IMMEDIATELY. Note the exact time symptoms started.',
        duration: 0,
        icon: '📞',
        callNumber: '108',
      },
      {
        title: 'While waiting',
        instruction: 'Keep the person calm and still. Do NOT give food, water or medication. Lay them on their side if vomiting.',
        duration: 0,
        icon: '🛏️',
      },
    ],
  },
  {
    id: 'heart_attack',
    icon: '💔',
    title: 'Heart Attack',
    subtitle: 'Chest pain emergency',
    color: 'bg-pink-700',
    borderColor: 'border-pink-600',
    urgent: true,
    steps: [
      {
        title: 'Call 108 immediately',
        instruction: 'Call 108 right now. Do not wait to see if symptoms improve. Every minute matters.',
        duration: 0,
        icon: '📞',
        callNumber: '108',
      },
      {
        title: 'Sit them down',
        instruction: 'Help them sit in a comfortable position — usually sitting up with knees bent. Loosen tight clothing.',
        duration: 0,
        icon: '🪑',
      },
      {
        title: 'Give aspirin if available',
        instruction: 'If they are not allergic, give one adult aspirin (300mg) to chew slowly — not swallow whole.',
        duration: 0,
        icon: '💊',
      },
      {
        title: 'Keep them calm',
        instruction: 'Reassure them. Do not leave them alone. Keep them warm and still.',
        duration: 0,
        icon: '🤝',
      },
      {
        title: 'If unconscious — start CPR',
        instruction: 'If they become unresponsive and stop breathing — begin CPR immediately. See CPR guide.',
        duration: 0,
        icon: '❤️',
      },
    ],
  },
  {
    id: 'shock',
    icon: '😰',
    title: 'Shock',
    subtitle: 'After severe injury',
    color: 'bg-teal-700',
    borderColor: 'border-teal-600',
    urgent: true,
    steps: [
      {
        title: 'Recognise shock',
        instruction: 'Signs: pale/grey skin, fast weak pulse, cold clammy skin, confusion, rapid shallow breathing.',
        duration: 0,
        icon: '🔍',
      },
      {
        title: 'Call 108',
        instruction: 'Call 108 immediately — shock is life threatening.',
        duration: 0,
        icon: '📞',
        callNumber: '108',
      },
      {
        title: 'Lay them down',
        instruction: 'Lay them on their back. Raise their legs about 30cm above heart level (unless leg or spine injury).',
        duration: 0,
        icon: '🛏️',
      },
      {
        title: 'Keep them warm',
        instruction: 'Cover with a blanket or jacket. Do NOT apply direct heat like hot water bottles.',
        duration: 0,
        icon: '🧥',
      },
      {
        title: 'Do not give food or drink',
        instruction: 'Even if they are thirsty — do not give anything by mouth. They may need surgery.',
        duration: 0,
        icon: '🚫',
      },
    ],
  },
  {
    id: 'drowning',
    icon: '🌊',
    title: 'Drowning',
    subtitle: 'Water emergency',
    color: 'bg-cyan-700',
    borderColor: 'border-cyan-600',
    urgent: true,
    steps: [
      {
        title: 'Ensure your safety first',
        instruction: 'Do NOT jump in if you are not a trained swimmer. Throw a rope, towel, or lifebelt instead.',
        duration: 0,
        icon: '⚠️',
      },
      {
        title: 'Call 108',
        instruction: 'Call 108 immediately.',
        duration: 0,
        icon: '📞',
        callNumber: '108',
      },
      {
        title: 'Get them out of water',
        instruction: 'Once safely removed — lay them on their back on a flat surface.',
        duration: 0,
        icon: '🏊',
      },
      {
        title: 'Check breathing',
        instruction: 'Tilt head back, lift chin, look and listen for breathing for 10 seconds.',
        duration: 10,
        icon: '👃',
      },
      {
        title: 'Start CPR if needed',
        instruction: 'If not breathing — start CPR immediately. Give 5 rescue breaths first, then 30 compressions.',
        duration: 0,
        icon: '❤️',
      },
      {
        title: 'Keep them warm',
        instruction: 'Even if breathing — remove wet clothes. Wrap in blankets. Watch for hypothermia.',
        duration: 0,
        icon: '🧥',
      },
    ],
  },
]

// Formats seconds into mm:ss display
function formatTime(seconds) {
  if (seconds === 0) return null
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m > 0) return `${m}m ${s > 0 ? s + 's' : ''}`
  return `${s}s`
}

// CPR compression counter component
function CPRCounter({ onComplete }) {
  const [count, setCount] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef(null)

  const TARGET = 30

  const start = () => {
    if (isRunning) return
    setIsRunning(true)
    setCount(0)

    // Speak the rhythm guide
    if (window.speechSynthesis) {
      const msg = new SpeechSynthesisUtterance(
        'Start compressions. Push hard and fast. 1, 2, 3...'
      )
      msg.rate = 1
      window.speechSynthesis.speak(msg)
    }

    // Count at 100 beats per minute = 600ms per beat
    intervalRef.current = setInterval(() => {
      setCount((prev) => {
        const next = prev + 1
        if (next >= TARGET) {
          clearInterval(intervalRef.current)
          setIsRunning(false)
          // Speak completion
          if (window.speechSynthesis) {
            const done = new SpeechSynthesisUtterance(
              '30 compressions done. Give 2 rescue breaths now.'
            )
            window.speechSynthesis.speak(done)
          }
          onComplete?.()
          return TARGET
        }
        return next
      })
    }, 600)
  }

  const reset = () => {
    clearInterval(intervalRef.current)
    setIsRunning(false)
    setCount(0)
  }

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  const progress = (count / TARGET) * 100

  return (
    <div className="bg-red-950 border border-red-700 rounded-2xl p-4 mt-3">
      <p className="text-red-300 text-xs font-semibold mb-3 text-center">
        CPR COMPRESSION COUNTER
      </p>

      {/* Progress circle */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40"
              fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
            <circle cx="48" cy="48" r="40"
              fill="none" stroke="#ef4444" strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white font-bold text-2xl leading-none">{count}</span>
            <span className="text-red-300 text-xs">/ {TARGET}</span>
          </div>
        </div>
      </div>

      {/* Rhythm indicator */}
      {isRunning && (
        <div className="flex justify-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-6 bg-red-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={isRunning ? reset : start}
          className={`flex-1 py-3 rounded-xl text-white font-bold text-sm
                      transition-all active:scale-95
                      ${isRunning
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-red-600 hover:bg-red-500'
                      }`}
        >
          {isRunning ? '⏹ Stop' : count === TARGET ? '🔄 Restart' : '▶ Start counting'}
        </button>
        {count > 0 && !isRunning && (
          <button
            onClick={reset}
            className="px-4 py-3 rounded-xl bg-gray-800 text-gray-300
                       hover:bg-gray-700 text-sm transition-colors"
          >
            Reset
          </button>
        )}
      </div>
      <p className="text-red-400 text-xs text-center mt-2">
        Rhythm: 100–120 compressions per minute
      </p>
    </div>
  )
}

// Step timer component
function StepTimer({ duration, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef(null)

  const start = () => {
    if (isRunning || timeLeft === 0) return
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setIsRunning(false)
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const reset = () => {
    clearInterval(intervalRef.current)
    setIsRunning(false)
    setTimeLeft(duration)
  }

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  if (!duration) return null

  const progress = ((duration - timeLeft) / duration) * 100

  return (
    <div className="flex items-center gap-3 mt-3 bg-gray-900 rounded-xl px-4 py-3">
      {/* Mini progress bar */}
      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-red-500 rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-white font-mono text-sm font-bold min-w-[50px] text-right">
        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
      </span>
      <button
        onClick={isRunning ? reset : timeLeft === 0 ? reset : start}
        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors
                    ${isRunning
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : timeLeft === 0
                        ? 'bg-green-700 text-green-200'
                        : 'bg-red-600 text-white hover:bg-red-500'
                    }`}
      >
        {isRunning ? '⏹' : timeLeft === 0 ? '✓ Done' : '▶ Start'}
      </button>
    </div>
  )
}

// Individual step card
function StepCard({ step, stepNumber, total, voiceEnabled }) {
  const [completed, setCompleted] = useState(false)

  const speakStep = () => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(
      `Step ${stepNumber}. ${step.title}. ${step.instruction}`
    )
    u.rate = 0.85
    u.pitch = 1
    window.speechSynthesis.speak(u)
  }

  return (
    <div className={`rounded-2xl border p-4 transition-all
      ${completed
        ? 'bg-green-950 border-green-700 opacity-75'
        : 'bg-gray-900 border-gray-700'
      }`}
    >
      {/* Step header */}
      <div className="flex items-start gap-3 mb-2">
        {/* Step number */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center
                         text-sm font-bold flex-shrink-0
                         ${completed ? 'bg-green-700 text-white' : 'bg-red-700 text-white'}`}>
          {completed ? '✓' : stepNumber}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{step.icon}</span>
            <p className="text-white font-semibold text-sm">{step.title}</p>
            {step.duration > 0 && (
              <span className="text-xs text-gray-500 ml-auto flex-shrink-0">
                ⏱ {formatTime(step.duration)}
              </span>
            )}
          </div>
          <p className="text-gray-300 text-xs leading-relaxed mt-1">
            {step.instruction}
          </p>
        </div>
      </div>

      {/* CPR counter for compression step */}
      {step.isCPR && (
        <CPRCounter onComplete={() => setCompleted(true)} />
      )}

      {/* Timer for timed steps */}
      {step.duration > 0 && !step.isCPR && (
        <StepTimer
          duration={step.duration}
          onComplete={() => setCompleted(true)}
        />
      )}

      {/* Call button if step has a number */}
      {step.callNumber && (
        <button
          onClick={() => { window.location.href = `tel:${step.callNumber}` }}
          className="mt-3 w-full bg-green-700 hover:bg-green-600 text-white
                     text-sm font-bold py-2.5 rounded-xl transition-colors"
        >
          📞 Call {step.callNumber} Now
        </button>
      )}

      {/* Bottom row: Speak + Mark done */}
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={speakStep}
          className="flex items-center gap-1 text-xs text-gray-400
                     hover:text-white transition-colors"
        >
          🔊 <span>Speak</span>
        </button>
        <div className="flex-1" />
        {!completed && (
          <button
            onClick={() => setCompleted(true)}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300
                       px-3 py-1.5 rounded-lg border border-gray-700 transition-colors"
          >
            ✓ Mark done
          </button>
        )}
        {completed && (
          <span className="text-green-400 text-xs font-medium">✓ Completed</span>
        )}
      </div>
    </div>
  )
}

// Category card shown on the home grid
function CategoryCard({ category, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center rounded-2xl p-4
                  border transition-all active:scale-95 text-center
                  ${category.color} ${category.borderColor}`}
    >
      <span className="text-3xl mb-2">{category.icon}</span>
      <p className="text-white font-bold text-sm leading-tight">{category.title}</p>
      <p className="text-white/70 text-xs mt-0.5 leading-tight">{category.subtitle}</p>
      {category.urgent && (
        <span className="mt-2 text-xs bg-black/30 text-red-200
                         px-2 py-0.5 rounded-full">
          URGENT
        </span>
      )}
    </button>
  )
}

// Guide detail screen — shows all steps for a category
function GuideDetail({ category, onBack }) {
  const completedSteps = category.steps.filter((_, i) => i).length

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className={`px-4 py-4 ${category.color}`}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 text-sm mb-3
                     hover:text-white transition-colors"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{category.icon}</span>
          <div>
            <h2 className="text-white font-bold text-xl">{category.title}</h2>
            <p className="text-white/70 text-sm">{category.subtitle}</p>
          </div>
        </div>
        <p className="text-white/60 text-xs mt-2">
          {category.steps.length} steps • Tap 🔊 on any step to hear it spoken
        </p>
      </div>

      {/* Steps list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {category.steps.map((step, index) => (
          <StepCard
            key={index}
            step={step}
            stepNumber={index + 1}
            total={category.steps.length}
          />
        ))}

        {/* Call ambulance reminder at bottom */}
        <div className="bg-red-950 border border-red-700 rounded-2xl p-4 text-center">
          <p className="text-red-300 text-sm font-medium mb-2">
            Always call for professional help
          </p>
          <button
            onClick={() => { window.location.href = 'tel:108' }}
            className="bg-red-600 hover:bg-red-500 text-white font-bold
                       py-3 px-6 rounded-xl text-sm transition-colors"
          >
            📞 Call 108 — Ambulance
          </button>
        </div>

        <div className="h-4" />
      </div>
    </div>
  )
}

// Main First Aid Guide component
export default function FirstAidGuide() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter categories by search
  const filteredCategories = FIRST_AID_CATEGORIES.filter((cat) =>
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Show detail view if category selected
  if (selectedCategory) {
    return (
      <GuideDetail
        category={selectedCategory}
        onBack={() => setSelectedCategory(null)}
      />
    )
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-white text-xl font-bold">First Aid Guide</h2>
        <p className="text-gray-400 text-xs mt-1">
          Step-by-step emergency procedures • Works offline
        </p>
      </div>

      {/* Search bar */}
      <div className="px-4 pb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search: CPR, bleeding, burns..."
          className="w-full bg-gray-800 text-white placeholder-gray-500
                     rounded-xl px-4 py-2.5 text-sm outline-none
                     border border-gray-700 focus:border-red-500 transition-colors"
        />
      </div>

      {/* Urgent strip */}
      <div className="mx-4 mb-3 bg-red-950 border border-red-800
                      rounded-xl px-4 py-2 flex items-center gap-2">
        <span className="text-red-400 text-sm">⚠️</span>
        <p className="text-red-300 text-xs">
          Always call <strong>108</strong> first for life-threatening emergencies
        </p>
      </div>

      {/* Category grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={() => setSelectedCategory(category)}
            />
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No results for "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-red-400 text-xs mt-2 hover:text-red-300"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Offline badge */}
        <div className="flex items-center justify-center gap-2 mt-4 py-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-gray-500 text-xs">
            All guides available offline
          </span>
        </div>
      </div>
    </div>
  )
}