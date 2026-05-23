import { useState, useEffect, useCallback } from 'react'
import Layout from './components/Layout'
import EmergencyDashboard from './components/EmergencyDashboard'
import ChatInterface from './components/ChatInterface'
import SettingsTab from './components/SettingsTab'
import PanicMode from './components/PanicMode'
import SplashScreen from './components/SplashScreen'
import FirstAidGuide from './components/FirstAidGuide'
import IncidentReport from './components/IncidentReport'
import AddressSearch from './components/AddressSearch'
import SafetyTips from './components/SafetyTips'
import AccidentHeatmap from './components/AccidentHeatmap'
import InsuranceHelper from './components/InsuranceHelper'
import HospitalFinder from './components/HospitalFinder'
import DriveSafe from './components/DriveSafe'
import { useLocation } from './hooks/useLocation'
import { useOffline } from './hooks/useOffline'
import { useLanguage } from './hooks/useLanguage'

function App() {
  const [activeTab,  setActiveTab]  = useState('chat')
  const [panicOpen,  setPanicOpen]  = useState(false)
  const [showSplash, setShowSplash] = useState(true)

  const { location, locationName, loading: locationLoading } = useLocation()
  const { isOnline }              = useOffline()
  const { language, setLanguage } = useLanguage()

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('[RoadSOS] SW registered:', reg.scope))
        .catch((err) => console.log('[RoadSOS] SW failed:', err))
    }
  }, [])

  const handleSplashComplete = useCallback(() => setShowSplash(false), [])
  const handleMoreNavigate   = (tabId) => setActiveTab(tabId)

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <ChatInterface
            location={location}
            locationName={locationName}
            isOnline={isOnline}
            language={language}
          />
        )
      case 'emergency':
        return <EmergencyDashboard location={location} />
      case 'firstaid':
        return <FirstAidGuide />
      case 'addresssearch':
        return <AddressSearch />
      case 'safetytips':
        return <SafetyTips />
      case 'heatmap':
        return <AccidentHeatmap />
      case 'insurance':
        return <InsuranceHelper />
      case 'hospital':
        return (
          <HospitalFinder
            location={location}
            locationName={locationName}
          />
        )
      case 'drivesafe':
        return <DriveSafe />
      case 'report':
        return (
          <IncidentReport
            location={location}
            locationName={locationName}
            language={language}
          />
        )
      case 'settings':
        return (
          <SettingsTab
            location={location}
            language={language}
            onLanguageChange={setLanguage}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <Layout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        locationName={locationName}
        locationLoading={locationLoading}
        onPanicOpen={() => setPanicOpen(true)}
        isOnline={isOnline}
        language={language}
        onMoreNavigate={handleMoreNavigate}
      >
        {renderContent()}
      </Layout>
      <PanicMode
        isOpen={panicOpen}
        onClose={() => setPanicOpen(false)}
        location={location}
      />
    </>
  )
}

export default App