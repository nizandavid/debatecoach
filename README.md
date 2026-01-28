# 🎯 DebateCoach

AI-powered debate practice app for Israeli high school students.

## ✨ Features

- **AI Debate Partner**: Practice with GPT-4o-mini
- **Speech-to-Text**: Record your arguments with Whisper
- **Text-to-Speech**: Hear AI responses
- **Real-time Feedback**: Get English corrections and debate coaching
- **Structured Flow**: 6-turn debate format (3 arguments + summaries)
- **Competition Mode**: Timed turns for realistic practice
- **Multiple Difficulty Levels**: Easy, Medium, Hard
- **Switch Sides**: Practice both PRO and CON positions

## 📁 Project Structure

```
debatecoach/
│
├── server.js              # Express backend with OpenAI API
├── package.json           # Dependencies
├── .env                   # Environment variables (create from .env.example)
│
└── public/                # Frontend (served statically)
    ├── index.html
    ├── styles.css
    ├── debate_logo.png
    │
    └── js/                # Modular JavaScript (ES6 modules)
        ├── main.js        # Entry point, event listeners
        ├── state.js       # Global state
        ├── dom.js         # DOM element references
        ├── ui.js          # UI updates (bubbles, header)
        ├── flow.js        # Debate flow logic
        ├── api.js         # Server API calls
        ├── recording.js   # Microphone recording
        ├── tts.js         # Text-to-speech
        ├── timer.js       # Competition timer
        ├── toast.js       # Notifications
        ├── accordion.js   # Settings accordion
        ├── export.js      # Download/Print session
        └── utils.js       # Helper functions
```

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd debatecoach
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-actual-key-here
PORT=3000
```

Get your API key from: https://platform.openai.com/api-keys

### 4. Run the server

**Development (with auto-restart):**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

The app will be available at: http://localhost:3000

## 🌐 Deployment (Render)

### Render Setup

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Create new **Web Service**
3. Connect your GitHub repository
4. Set the following:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add `OPENAI_API_KEY`

### Push to Deploy

```bash
git add .
git commit -m "Update DebateCoach"
git push origin main
```

Render will auto-deploy from the `main` branch.

## 📝 Module Responsibilities

### Core Modules

- **main.js**: Entry point, initializes everything, binds all event listeners
- **state.js**: Central state object (session, settings, messages)
- **dom.js**: Returns references to all DOM elements
- **flow.js**: Debate turn logic, determines who goes next

### UI Modules

- **ui.js**: Adds chat bubbles, shows/hides sections
- **accordion.js**: Settings accordion behavior
- **toast.js**: Notification toasts

### Feature Modules

- **api.js**: Fetch requests to `/topics`, `/ask`, `/feedback`, `/stt`
- **recording.js**: MediaRecorder for audio capture
- **tts.js**: SpeechSynthesis for reading AI responses
- **timer.js**: Competition mode countdown

### Utilities

- **utils.js**: Helper functions (`safe()`, `formatTime()`, etc.)
- **export.js**: Download transcript, print session

## 🐛 Debugging

### Browser Console

```javascript
// Check state
__DC_STATE__

// Check DOM elements
__DC_DOM__

// Test TTS
__DC.say("hello world")

// Unlock TTS manually
__DC.unlockTTS()

// Stop speaking
__DC.stop()
```

### Server Logs

Watch server logs for API errors:

```bash
npm run dev
```

## 📦 Dependencies

### Backend
- **express**: Web server
- **cors**: Cross-origin requests
- **dotenv**: Environment variables
- **openai**: OpenAI API client (GPT-4o-mini, Whisper)
- **multer**: File upload (audio)

### Frontend
- Vanilla JavaScript (ES6 modules)
- Native Web APIs:
  - MediaRecorder (audio recording)
  - SpeechSynthesis (TTS)
  - Fetch API
  - FormData

## 🎨 Styling

All CSS is in `public/styles.css`:
- CSS Variables for theming
- Gradient animated background
- Responsive design
- Card-based layout
- Smooth animations

## 🔐 Security Notes

- ⚠️ **Never commit `.env` file** (it's in `.gitignore`)
- 🔑 Keep your OpenAI API key private
- 💰 Monitor OpenAI usage (GPT-4o-mini + Whisper costs)
- 🛡️ Rate limiting recommended for production

## 📄 License

MIT

## 🙏 Credits

Built with:
- OpenAI GPT-4o-mini (debate AI)
- OpenAI Whisper (speech-to-text)
- Web Speech API (text-to-speech)

---

**Made for Israeli high school students learning debate and English** 🇮🇱
