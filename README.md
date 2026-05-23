# 🚨 RoadSOS — AI Emergency Road Safety Assistant

> Built for IIT Madras Road Safety Hackathon 2026 | Theme: AI in Road Safety

## What is RoadSOS?

RoadSOS is an AI-powered emergency chatbot that helps accident victims, bystanders, 
and travellers find immediate help during road emergencies — ambulance, police, 
hospitals, towing, and more — in seconds.

**Live Demo:** [Your Vercel URL here after deployment]

---

## Key Features

| Feature | Description |
|---|---|
| 🤖 AI Chat | Claude-powered emergency assistant with context awareness |
| 🚨 Panic Mode | One-tap SOS with countdown, family alerts, voice guidance |
| 📍 Location-Aware | Real GPS + OpenStreetMap service lookup |
| 📴 Offline Mode | Works with zero internet — critical numbers always cached |
| 📲 PWA | Installable on Android/iPhone home screen |
| 🌐 Global | Emergency numbers for 195+ countries |
| 🎙️ Voice | Text-to-speech alerts in Panic Mode |
| 👨‍👩‍👦 Family Alerts | SMS contacts automatically on SOS |

---

## Tech Stack

**Frontend:** React 18 + Vite + TailwindCSS + PWA (Service Worker)  
**Backend:** Node.js + Express  
**AI:** Claude claude-sonnet-4-20250514 (Anthropic) with streaming  
**Maps:** OpenStreetMap + Overpass API + Nominatim (all free)  
**SMS:** Native `sms:` protocol (no third-party needed)  
**Deployment:** Vercel (frontend) + Railway (backend)

---

## Emergency Numbers Covered (India)

| Service | Number |
|---|---|
| Ambulance | 108 |
| Police / Emergency | 112 |
| Fire Brigade | 101 |
| NHAI Highway | 1033 |
| Women Helpline | 1091 |

---

## Running Locally

### Prerequisites
- Node.js v18+
- Anthropic API key (free at console.anthropic.com)

### Frontend
```bash
cd roadsos
npm install
npm run dev
```

### Backend
```bash
cd roadsos-backend
npm install
# Create .env with your API key:
echo "ANTHROPIC_API_KEY=sk-ant-your-key" > .env
npm run dev
```

Open http://localhost:5173

---

## Architecture