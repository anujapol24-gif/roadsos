// VoiceButton.jsx
// The microphone button shown in the chat input bar

export default function VoiceButton({
  isListening,
  isSpeaking,
  sttSupported,
  onStart,
  onStop,
  transcript,
  error,
}) {
  if (!sttSupported) {
    return (
      <button
        disabled
        title="Voice not supported in this browser. Use Chrome."
        className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700
                   flex items-center justify-center opacity-40 cursor-not-allowed"
      >
        <span className="text-lg">🎙️</span>
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={isListening ? onStop : onStart}
        title={isListening ? 'Tap to stop' : 'Tap to speak'}
        className={`w-10 h-10 rounded-xl flex items-center justify-center
                    transition-all duration-150 active:scale-95 border
                    ${isListening
                      ? 'bg-red-600 border-red-400 animate-pulse'
                      : isSpeaking
                        ? 'bg-blue-700 border-blue-500'
                        : 'bg-gray-800 border-gray-700 hover:border-red-500'
                    }`}
      >
        <span className="text-lg">
          {isListening ? '⏹️' : isSpeaking ? '🔊' : '🎙️'}
        </span>
      </button>

      {/* Listening indicator — shows partial transcript */}
      {isListening && (
        <div className="absolute bottom-12 right-0 w-56 bg-gray-900 border
                        border-red-600 rounded-xl px-3 py-2 z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-xs font-medium">Listening...</span>
          </div>
          <p className="text-white text-xs min-h-4">
            {transcript || 'Speak now...'}
          </p>
        </div>
      )}

      {/* Error tooltip */}
      {error && !isListening && (
        <div className="absolute bottom-12 right-0 w-56 bg-red-950 border
                        border-red-700 rounded-xl px-3 py-2 z-10">
          <p className="text-red-300 text-xs">{error}</p>
        </div>
      )}
    </div>
  )
}