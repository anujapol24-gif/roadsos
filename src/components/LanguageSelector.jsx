import { LANGUAGES } from '../utils/languages'

export default function LanguageSelector({ currentLanguage, onSelect }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl
                        border transition-all text-left
                        ${currentLanguage === lang.code
                          ? 'bg-red-700 border-red-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                        }`}
          >
            <span className="text-xl">{lang.flag}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight truncate">
                {lang.nativeName}
              </p>
              <p className={`text-xs leading-tight truncate
                ${currentLanguage === lang.code ? 'text-red-200' : 'text-gray-500'}`}>
                {lang.name}
              </p>
            </div>
            {currentLanguage === lang.code && (
              <span className="ml-auto text-green-400 flex-shrink-0">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}