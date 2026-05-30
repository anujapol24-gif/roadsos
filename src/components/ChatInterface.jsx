import { useState, useRef, useEffect } from 'react'
import { useVoice } from '../hooks/useVoice'
import VoiceButton from './VoiceButton'

// Converts **bold** markdown to bold text
function formatMessage(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

// Single chat bubble
function ChatBubble({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center
                        justify-center text-sm mr-2 flex-shrink-0 mt-1">
          🚨
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? 'bg-red-600 text-white rounded-br-sm'
            : 'bg-gray-800 text-gray-100 rounded-bl-sm'
          }`}
      >
        {message.text.split('\n').map((line, i) => (
          <p key={i} className={line === '' ? 'mt-2' : ''}>
            {formatMessage(line)}
          </p>
        ))}
        <p className={`text-xs mt-2 ${isUser ? 'text-red-200' : 'text-gray-500'}`}>
          {message.time}
        </p>
      </div>
    </div>
  )
}

// Streaming bubble — shows text as it arrives
function StreamingBubble({ text }) {
  return (
    <div className="flex justify-start mb-3">
      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center
                      justify-center text-sm mr-2 flex-shrink-0 mt-1">
        🚨
      </div>
      <div className="bg-gray-800 text-gray-100 rounded-2xl rounded-bl-sm
                      px-4 py-3 text-sm leading-relaxed max-w-[80%]">
        {text.split('\n').map((line, i) => (
          <p key={i} className={line === '' ? 'mt-2' : ''}>
            {formatMessage(line)}
          </p>
        ))}
        <span className="inline-block w-0.5 h-4 bg-red-400 ml-0.5
                         animate-pulse align-middle" />
      </div>
    </div>
  )
}

// Typing indicator
function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center
                      justify-center text-sm mr-2 flex-shrink-0">
        🚨
      </div>
      <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

// Suggestion chips
function SuggestionChips({ suggestions, onSelect }) {
  if (!suggestions || suggestions.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2 px-4 py-2">
      {suggestions.map((suggestion, i) => (
        <button
          key={i}
          onClick={() => onSelect(suggestion)}
          className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs
                     rounded-full px-3 py-1.5 border border-gray-700
                     hover:border-red-500 transition-colors"
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}

// Welcome screen
function WelcomeScreen({ onSuggestionClick, isOnline, language }) {
  const quickActions = [
    { icon: '🚑', label: 'Ambulance needed' },
    { icon: '🚔', label: 'Report accident' },
    { icon: '🔧', label: 'Vehicle breakdown' },
    { icon: '🏥', label: 'Find hospital' },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-600 flex items-center
                      justify-center text-3xl mb-4">
        🚨
      </div>
      <h2 className="text-white text-xl font-bold mb-1">RoadSOS Assistant</h2>

      {!isOnline && (
        <div className="bg-yellow-900 border border-yellow-700 rounded-xl
                        px-4 py-3 mb-4 w-full">
          <p className="text-yellow-200 text-xs font-medium mb-2">
            ⚡ Offline mode — AI chat unavailable
          </p>
          <p className="text-yellow-300 text-xs">
            Emergency numbers still work.
          </p>
          <div className="flex flex-col gap-1 mt-3">
            {[
              { label: 'Ambulance', number: '108', icon: '🚑' },
              { label: 'Police',    number: '112', icon: '🚔' },
              { label: 'Highway',   number: '1033', icon: '🛣️' },
            ].map((item) => (
              <button
                key={item.number}
                onClick={() => { window.location.href = `tel:${item.number}` }}
                className="flex items-center justify-between bg-yellow-800
                           hover:bg-yellow-700 rounded-lg px-3 py-2 transition-colors"
              >
                <span className="text-yellow-100 text-xs">
                  {item.icon} {item.label}
                </span>
                <span className="text-yellow-200 font-mono font-bold text-sm">
                  {item.number}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOnline && (
        <>
          <p className="text-gray-400 text-sm mb-2">
            Describe your emergency and I'll guide you instantly.
          </p>
          <p className="text-gray-600 text-xs mb-6">
            🎙️ Tap the microphone to speak your emergency
          </p>
        </>
      )}

      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {quickActions.map((action, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(action.label)}
            className="flex flex-col items-center bg-gray-800 hover:bg-gray-700
                       rounded-xl p-3 gap-1 border border-gray-700
                       hover:border-red-500 transition-colors"
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="text-gray-300 text-xs font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

// Detects if the message is a critical emergency
function isCriticalEmergency(text) {
  const keywords = [
    'unconscious', 'not breathing', 'bleeding', 'dying',
    'heart attack', 'stroke', 'fire', 'trapped',
    'बेहोश', 'सांस नहीं', 'मदद', 'आग',
  ]
  const lower = text.toLowerCase()
  return keywords.some((k) => lower.includes(k))
}

// Generates context-aware suggestion chips
function getSuggestions(userText, botText) {
  const combined = (userText + ' ' + botText).toLowerCase()
  if (combined.includes('accident') || combined.includes('crash')) {
    return ['Are people injured?', 'Need tow truck', 'How to file FIR', 'Insurance claim']
  }
  if (combined.includes('ambulance') || combined.includes('injur') || combined.includes('bleed')) {
    return ['CPR steps', 'Person is conscious', 'Multiple injured', 'Ambulance ETA']
  }
  if (combined.includes('breakdown') || combined.includes('tow')) {
    return ['I am on a highway', 'Two-wheeler breakdown', 'Need fuel', 'Insurance helpline']
  }
  if (combined.includes('hospital')) {
    return ['Head injury', 'Burns victim', 'Heart attack', 'Child injured']
  }
  return ['Accident on road', 'Need ambulance', 'Vehicle breakdown', 'Find hospital']
}

// Main Chat Interface
export default function ChatInterface({ location, locationName, isOnline, language }) {
  const [messages, setMessages] = useState(() => {
  try {
    const saved = localStorage.getItem('roadsos_chat_history')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
})
  const [inputText, setInputText]       = useState('')
  const [isLoading, setIsLoading]       = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [suggestions, setSuggestions]   = useState([])
  const [backendStatus, setBackendStatus] = useState('checking')
  const bottomRef = useRef(null)

  // Voice hook — pass current language for correct accent
  const {
    isListening, transcript, sttError, sttSupported,
    startListening, stopListening,
    isSpeaking, voiceEnabled, toggleVoice, speak, stopSpeaking,
  } = useVoice(language)

  // When transcript updates from voice — put it in the input box
  useEffect(() => {
    if (transcript) {
      setInputText(transcript)
    }
  }, [transcript])

  // Auto-submit when voice recognition finishes
  // (transcript is set + no longer listening)
  const prevListening = useRef(false)
  useEffect(() => {
    if (prevListening.current && !isListening && transcript.trim()) {
      sendMessage(transcript.trim())
      setInputText('')
    }
    prevListening.current = isListening
  }, [isListening])

  // Check backend status on mount
  useEffect(() => {
    checkBackend()
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText, isLoading])

  const checkBackend = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`)
      setBackendStatus(response.ok ? 'online' : 'offline')
    } catch {
      setBackendStatus('offline')
    }
  }

  const getCurrentTime = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const sendMessage = async (text) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    // Stop speaking if bot is currently talking
    stopSpeaking()

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: trimmed,
      time: getCurrentTime(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputText('')
    setSuggestions([])
    setIsLoading(true)
    setStreamingText('')

    const claudeMessages = updatedMessages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }))

    // Check if this is a critical emergency — speak the response immediately
    const critical = isCriticalEmergency(trimmed)

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: claudeMessages,
          userLocation: locationName || null,
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

      const botMessage = {
        id: Date.now() + 1,
        role: 'bot',
        text: fullText,
        time: getCurrentTime(),
      }

      setMessages((prev) => [...prev, botMessage])
      localStorage.setItem('roadsos_chat_history', JSON.stringify([...updatedMessages, botMessage]))
      setStreamingText('')
      setSuggestions(getSuggestions(trimmed, fullText))

      // Speak the response
      // Always speak critical emergencies, otherwise respect voice toggle
      speak(fullText, critical)

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        role: 'bot',
        text: backendStatus === 'offline'
          ? '⚠️ Backend server is not running.\n\nFor immediate help:\n• 108 (Ambulance)\n• 112 (Police)\n• 1033 (Highway)'
          : `⚠️ Could not reach AI.\n\nError: ${error.message}\n\nCall immediately:\n• 108 Ambulance\n• 112 Police`,
        time: getCurrentTime(),
      }
      setMessages((prev) => [...prev, errorMessage])
      setStreamingText('')
    }

    setIsLoading(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(inputText)
  }

  const showWelcome = messages.length === 0 && !isLoading && !streamingText

  return (
    <div className="flex flex-col h-full">

      {/* Backend offline warning */}
      {backendStatus === 'offline' && (
        <div className="bg-yellow-900 border-b border-yellow-700 px-4 py-2
                        text-yellow-300 text-xs text-center">
          ⚠️ AI backend offline — start roadsos-backend server
        </div>
      )}

      {/* Voice status bar — shown when voice is active */}
      {(isListening || isSpeaking) && (
        <div className={`flex items-center justify-center gap-2 px-4 py-2 text-xs
          ${isListening
            ? 'bg-red-900/50 border-b border-red-700 text-red-300'
            : 'bg-blue-900/50 border-b border-blue-700 text-blue-300'
          }`}
        >
          {isListening && (
            <>
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span>Listening in {language.toUpperCase()}... speak now</span>
            </>
          )}
          {isSpeaking && !isListening && (
            <>
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>Speaking response...</span>
              <button
                onClick={stopSpeaking}
                className="underline text-blue-200 hover:text-white"
              >
                Stop
              </button>
            </>
          )}
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {showWelcome ? (
          <WelcomeScreen
            onSuggestionClick={sendMessage}
            isOnline={isOnline ?? true}
            language={language}
          />
        ) : (
          <>
          {messages.length > 0 && (
              <div className="flex justify-end px-4 pt-2">
                <button
                  onClick={() => {
                    setMessages([])
                    localStorage.removeItem('roadsos_chat_history')
                  }}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                >
                  Clear chat
                </button>
              </div>
            )}
          
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
            {isLoading && !streamingText && <TypingIndicator />}
            {streamingText && <StreamingBubble text={streamingText} />}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Suggestion chips */}
      <SuggestionChips suggestions={suggestions} onSelect={sendMessage} />

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-t border-gray-800"
      >
        {/* Voice toggle button — turns TTS on/off */}
        <button
          type="button"
          onClick={toggleVoice}
          title={voiceEnabled ? 'Voice on — tap to mute' : 'Voice off — tap to unmute'}
          className={`w-10 h-10 rounded-xl flex items-center justify-center
                      flex-shrink-0 border transition-colors
                      ${voiceEnabled
                        ? 'bg-blue-700 border-blue-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-500'
                      }`}
        >
          <span className="text-lg">{voiceEnabled ? '🔊' : '🔇'}</span>
        </button>

        {/* Text input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isListening
              ? 'Listening...'
              : isLoading
                ? 'RoadSOS is responding...'
                : 'Describe your emergency...'
          }
          disabled={isLoading}
          className="flex-1 bg-gray-800 text-white placeholder-gray-500
                     rounded-xl px-4 py-2.5 text-sm outline-none
                     border border-gray-700 focus:border-red-500
                     disabled:opacity-50 transition-colors"
        />

        {/* Microphone button */}
        <VoiceButton
          isListening={isListening}
          isSpeaking={isSpeaking}
          sttSupported={sttSupported}
          onStart={startListening}
          onStop={stopListening}
          transcript={transcript}
          error={sttError}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="bg-red-600 hover:bg-red-500 disabled:bg-gray-700
                     disabled:cursor-not-allowed text-white rounded-xl
                     px-4 py-2.5 text-sm font-medium transition-colors flex-shrink-0"
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </form>

    </div>
  )
}