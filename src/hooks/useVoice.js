// useVoice.js
// Manages both speech-to-text (microphone input)
// and text-to-speech (bot speaking responses)

import { useState, useRef, useEffect } from 'react'

// Maps our language codes to browser speech API codes
const LANG_TO_SPEECH = {
  en: { stt: 'en-IN', tts: 'en-IN', name: 'English'  },
  hi: { stt: 'hi-IN', tts: 'hi-IN', name: 'Hindi'    },
  ta: { stt: 'ta-IN', tts: 'ta-IN', name: 'Tamil'    },
  te: { stt: 'te-IN', tts: 'te-IN', name: 'Telugu'   },
  mr: { stt: 'mr-IN', tts: 'mr-IN', name: 'Marathi'  },
  bn: { stt: 'bn-IN', tts: 'bn-IN', name: 'Bengali'  },
  kn: { stt: 'kn-IN', tts: 'kn-IN', name: 'Kannada'  },
  gu: { stt: 'gu-IN', tts: 'gu-IN', name: 'Gujarati' },
}

export function useVoice(language = 'en') {
  // Speech-to-text state
  const [isListening, setIsListening]   = useState(false)
  const [transcript, setTranscript]     = useState('')
  const [sttError, setSttError]         = useState(null)
  const [sttSupported, setSttSupported] = useState(false)

  // Text-to-speech state
  const [isSpeaking, setIsSpeaking]     = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    // Load saved voice preference
    return localStorage.getItem('roadsos_voice_enabled') !== 'false'
  })

  const recognitionRef = useRef(null)

  // Check if browser supports speech recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setSttSupported(true)
    }
  }, [])

  // Toggle voice on/off and save preference
  const toggleVoice = () => {
    const newVal = !voiceEnabled
    setVoiceEnabled(newVal)
    localStorage.setItem('roadsos_voice_enabled', String(newVal))
    if (!newVal) {
      // Stop any ongoing speech immediately
      window.speechSynthesis?.cancel()
      setIsSpeaking(false)
    }
  }

  // START listening — activates the microphone
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setSttError('Speech recognition not supported in this browser. Use Chrome.')
      return
    }

    // Stop any ongoing speech before listening
    window.speechSynthesis?.cancel()

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    const langConfig = LANG_TO_SPEECH[language] || LANG_TO_SPEECH['en']
    recognition.lang = langConfig.stt
    recognition.continuous = false        // stop after first pause
    recognition.interimResults = true     // show partial results while speaking
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
      setSttError(null)
    }

    recognition.onresult = (event) => {
      let interimText = ''
      let finalText = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalText += result[0].transcript
        } else {
          interimText += result[0].transcript
        }
      }

      // Show interim text immediately for visual feedback
      setTranscript(finalText || interimText)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      setIsListening(false)
      switch (event.error) {
        case 'not-allowed':
          setSttError('Microphone access denied. Allow mic in browser settings.')
          break
        case 'no-speech':
          setSttError('No speech detected. Tap and speak clearly.')
          break
        case 'network':
          setSttError('Network error. Check your connection.')
          break
        default:
          setSttError(`Error: ${event.error}`)
      }
    }

    recognition.start()
  }

  // STOP listening manually
  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  // SPEAK text aloud using text-to-speech
  // isCritical = true means speak even if voice is off (for emergencies)
  const speak = (text, isCritical = false) => {
    if (!voiceEnabled && !isCritical) return
    if (!window.speechSynthesis) return

    // Clean the text — remove markdown symbols before speaking
    const cleanText = text
      .replace(/\*\*/g, '')   // remove bold markers
      .replace(/\*/g, '')     // remove italic markers
      .replace(/#{1,6} /g, '') // remove headings
      .replace(/•/g, '')      // remove bullets
      .replace(/\n+/g, '. ')  // replace newlines with pauses
      .trim()

    // Don't speak very long responses fully — truncate to first 300 chars
    const textToSpeak = cleanText.length > 300
      ? cleanText.slice(0, 300) + '... tap to read more.'
      : cleanText

    window.speechSynthesis.cancel() // stop anything currently speaking

    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    const langConfig = LANG_TO_SPEECH[language] || LANG_TO_SPEECH['en']
    utterance.lang = langConfig.tts
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend   = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  // STOP speaking
  const stopSpeaking = () => {
    window.speechSynthesis?.cancel()
    setIsSpeaking(false)
  }

  return {
    // Speech-to-text
    isListening,
    transcript,
    sttError,
    sttSupported,
    startListening,
    stopListening,

    // Text-to-speech
    isSpeaking,
    voiceEnabled,
    toggleVoice,
    speak,
    stopSpeaking,
  }
}