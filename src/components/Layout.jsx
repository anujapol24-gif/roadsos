import OfflineBanner from './OfflineBanner'
import { getLanguage } from '../utils/languages'

const NAV_ITEMS = [
  { id: 'chat',      icon: '💬', label: 'Chat'      },
  { id: 'emergency', icon: '🚨', label: 'Emergency'  },
  { id: 'firstaid',  icon: '🩺', label: 'First Aid'  },
  { id: 'more',      icon: '⋯',  label: 'More'       },
  { id: 'settings',  icon: '⚙️',  label: 'Settings'  },
]

const MORE_TAB_IDS = [
  'addresssearch', 'heatmap', 'safetytips',
  'insurance', 'hospital', 'drivesafe', 'report',
]

function MoreMenu({ onNavigate }) {
  const moreItems = [
    {
      id: 'addresssearch',
      icon: '🔍',
      label: 'Search by Address',
      description: 'Find services at any location you type',
      color: 'bg-blue-900 border-blue-700',
    },
    {
      id: 'heatmap',
      icon: '🗺️',
      label: 'Accident Heatmap',
      description: 'High-risk zones on Indian highways',
      color: 'bg-red-900 border-red-700',
    },
    {
      id: 'safetytips',
      icon: '💡',
      label: 'Road Safety Tips',
      description: 'Daily tips — highway, monsoon, night driving',
      color: 'bg-yellow-900 border-yellow-700',
    },
    {
      id: 'insurance',
      icon: '🛡️',
      label: 'Insurance Helper',
      description: 'Step-by-step post-accident insurance guide',
      color: 'bg-green-900 border-green-700',
    },
    {
      id: 'hospital',
      icon: '🏥',
      label: 'Hospital Finder',
      description: 'Find hospitals by specialty and blood banks',
      color: 'bg-pink-900 border-pink-700',
    },
    {
      id: 'drivesafe',
      icon: '🚗',
      label: 'Drive Safe Monitor',
      description: 'Speed monitor and break reminders',
      color: 'bg-teal-900 border-teal-700',
    },
    {
      id: 'report',
      icon: '📋',
      label: 'Incident Report',
      description: 'Generate formal accident report with AI',
      color: 'bg-purple-900 border-purple-700',
    },
  ]

  return (
    <div className="flex flex-col h-full px-4 py-4 gap-3 overflow-y-auto">
      <div>
        <h2 className="text-white text-xl font-bold">More Features</h2>
        <p className="text-gray-400 text-xs mt-1">Additional RoadSOS tools</p>
      </div>

      <div className="flex flex-col gap-3">
        {moreItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-4 rounded-2xl border p-4
                        transition-all active:scale-95 text-left
                        ${item.color}`}
          >
            <span className="text-4xl">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-base">{item.label}</p>
              <p className="text-gray-300 text-xs mt-0.5">{item.description}</p>
            </div>
            <span className="ml-auto text-gray-400 text-lg flex-shrink-0">
              →
            </span>
          </button>
        ))}
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
          Quick Emergency Numbers
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Ambulance', number: '108',  icon: '🚑' },
            { label: 'Police',    number: '112',  icon: '🚔' },
            { label: 'Fire',      number: '101',  icon: '🚒' },
            { label: 'Highway',   number: '1033', icon: '🛣️' },
          ].map((item) => (
            <button
              key={item.number}
              onClick={() => { window.location.href = `tel:${item.number}` }}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700
                         rounded-xl px-3 py-2 transition-colors border
                         border-gray-700 hover:border-red-600"
            >
              <span>{item.icon}</span>
              <div className="text-left">
                <p className="text-white text-sm font-bold">{item.number}</p>
                <p className="text-gray-500 text-xs">{item.label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="h-4" />
    </div>
  )
}

export default function Layout({
  children,
  activeTab,
  onTabChange,
  locationName,
  locationLoading,
  onPanicOpen,
  isOnline,
  language,
  onMoreNavigate,
}) {
  const lang = getLanguage(language)

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white max-w-md mx-auto relative">

      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-red-500 text-xl">🚨</span>
          <span className="text-white font-bold text-lg tracking-wide">
            RoadSOS
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm">{lang.flag}</span>
          {locationLoading && (
            <span className="text-gray-400 text-xs">📡</span>
          )}
          {locationName && !locationLoading && (
            <span className="text-gray-400 text-xs truncate max-w-[100px]">
              📍 {locationName.split(',')[0]}
            </span>
          )}
          <span className={`w-2 h-2 rounded-full flex-shrink-0 animate-pulse
            ${isOnline ? 'bg-green-400' : 'bg-yellow-400'}`}
          />
        </div>
      </div>

      <OfflineBanner isOnline={isOnline} />

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'more'
          ? <MoreMenu onNavigate={onMoreNavigate} />
          : children
        }
      </div>

      <button
        onClick={onPanicOpen}
        className="absolute bottom-20 right-4 z-40
                   w-14 h-14 rounded-full bg-red-600 hover:bg-red-500
                   flex items-center justify-center
                   shadow-lg shadow-red-900/50
                   transition-transform active:scale-90 animate-pulse"
        title="Panic Mode — SOS"
      >
        <span className="text-2xl">🆘</span>
      </button>

      <div className="flex bg-gray-900 border-t border-gray-800">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex-1 flex flex-col items-center justify-center
                        py-3 gap-1 transition-colors
                        ${activeTab === item.id ||
                          (item.id === 'more' && MORE_TAB_IDS.includes(activeTab))
                            ? 'text-red-400'
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
          >
            <span className={item.icon === '⋯'
              ? 'text-2xl font-bold leading-none'
              : 'text-xl'
            }>
              {item.icon}
            </span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>

    </div>
  )
}