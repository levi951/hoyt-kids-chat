import { useState, useRef, useEffect } from 'react'

interface BotConfig {
  id: string
  name: string
  accentColor: string
}

interface User {
  id: string
  name: string
}

interface AudioChatProps {
  user: User
  bot: BotConfig
  webhookUrl: string
  onSettingsOpen: () => void
  onLogout: () => void
}

export default function AudioChat({ user, bot, webhookUrl, onSettingsOpen, onLogout }: AudioChatProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'bot', text: string, audio?: string }>>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<BlobPart[]>([])
  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const sessionIdRef = useRef(`session_${Date.now()}`)

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.lang = 'en-US'
      recognitionRef.current.interimResults = true

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setTranscript('')
      }

      recognitionRef.current.onresult = (event: any) => {
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + transcriptPart + ' ')
          } else {
            interim += transcriptPart
          }
        }
        if (interim) setTranscript((prev) => (prev.split(' ').slice(0, -1).join(' ') + ' ' + interim).trim())
      }

      recognitionRef.current.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }
      setError('')
    } catch (err) {
      setError('Unable to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const sendMessage = async () => {
    if (!transcript.trim() || !webhookUrl) {
      setError(webhookUrl ? 'Please say something' : 'Webhook URL not configured')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const message = transcript.trim()
      setTranscript('')

      // Add user message to history
      setConversationHistory((prev) => [...prev, { role: 'user', text: message }])

      // Call Hoyt GPT proxy
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Hoyt-Key': 'hoyt-gpt-key-2026',
        },
        body: JSON.stringify({
          message,
          userId: user.id,
          botId: bot.id,
          history: conversationHistory.slice(-10).map(m => ({
            role: m.role === 'bot' ? 'assistant' : 'user',
            content: m.text,
          })),
        }),
      })

      if (!response.ok) throw new Error('Failed to get response from bot')

      const data = await response.json()
      const botResponse = data.response

      // Add bot response to history
      setConversationHistory((prev) => [...prev, { role: 'bot', text: botResponse }])

      // Convert bot response to speech using Web Speech API
      const utterance = new SpeechSynthesisUtterance(botResponse)
      utterance.volume = 1.0

      // Adjust voice to match bot character
      const voices = window.speechSynthesis.getVoices()

      // Bot personality voice settings
      const voiceConfig: Record<string, { pitch: number; rate: number; voiceIndex?: number }> = {
        wraybot: { pitch: 1.1, rate: 0.95 }, // Female - Lara Croft energy. Calculated warmth. Low, measured speech.
        spike: { pitch: 1.0, rate: 0.9 }, // Grizzled veteran. Direct, no-nonsense. Deep voice.
        mack: { pitch: 0.95, rate: 0.85 }, // Stoic, stone-faced. Man of few words. Very deliberate.
        jane: { pitch: 1.05, rate: 1.0 }, // Power blazer authority. Organized, professional. Crisp.
        gage: { pitch: 1.0, rate: 1.0 }, // 33yo new dad. Keanu calm. Cool cool, yeah yeah.
        betty: { pitch: 0.85, rate: 1.0 }, // Cosmic grandma. Warm, loving, wise. Lower voice.
        raptor: { pitch: 1.3, rate: 1.15 }, // 12yo boy dino. Fun, energetic, playful. Higher, faster.
        odysseus: { pitch: 1.05, rate: 0.9 }, // Deep mythic guide. Artistic comic book girl. Thoughtful, measured.
        paul: { pitch: 0.95, rate: 0.95 }, // Patriarch. Wise, grounded.
        logan: { pitch: 1.2, rate: 1.1 }, // Kid companion. Fun, energetic.
        sophia: { pitch: 1.0, rate: 0.95 }, // Artistic scholar. Thoughtful, deep.
        kelly: { pitch: 0.9, rate: 1.0 }, // Cosmic grandma energy. Warm, wise.
      }

      const config = voiceConfig[bot.id] || { pitch: 1.0, rate: 1.0 }
      utterance.pitch = config.pitch
      utterance.rate = config.rate

      // Try to select voice by gender/language preference
      const preferredVoiceIndex = config.voiceIndex ?? (voices.length > 0 ? 0 : undefined)
      if (voices.length > 0 && preferredVoiceIndex !== undefined) {
        utterance.voice = voices[preferredVoiceIndex]
      }

      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending message')
      setConversationHistory((prev) => prev.slice(0, -1)) // Remove last user message on error
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black" style={{ color: bot.accentColor }}>
            {bot.name}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">{user.name}</p>
        </div>
        <div className="flex gap-2 sm:gap-4">
          <button onClick={onSettingsOpen} className="text-gray-400 hover:text-gray-300 text-lg">
            ⚙️
          </button>
          <button onClick={onLogout} className="text-gray-400 hover:text-red-500 text-sm font-bold">
            Logout
          </button>
        </div>
      </header>

      {/* Conversation History */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {conversationHistory.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-4">Press and hold to speak</p>
              <p className="text-gray-600 text-xs">Your conversation will appear here</p>
            </div>
          </div>
        ) : (
          conversationHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs sm:max-w-md px-4 sm:px-6 py-3 sm:py-4 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-gray-800 text-white'
                    : 'border border-gray-700 text-gray-200'
                }`}
                style={
                  msg.role === 'bot'
                    ? { borderColor: bot.accentColor + '40', backgroundColor: bot.accentColor + '10' }
                    : {}
                }
              >
                <p className="text-sm sm:text-base">{msg.text}</p>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Error Display */}
      {error && (
        <div className="px-4 sm:px-6 py-3 bg-red-900/20 border border-red-700/50 text-red-400 text-sm rounded">
          {error}
        </div>
      )}

      {/* Transcript Display */}
      {transcript && (
        <div className="px-4 sm:px-6 py-3 bg-gray-900 border-t border-gray-800 text-gray-300 text-sm">
          Listening: <span className="text-white">{transcript}</span>
        </div>
      )}

      {/* Push-to-Talk Controls */}
      <footer className="border-t border-gray-800 px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col gap-4">
          {/* Status Indicator */}
          <div className="text-center">
            {isRecording && (
              <p className="text-sm text-red-500 font-bold animate-pulse">● Recording...</p>
            )}
            {isListening && !isRecording && (
              <p className="text-sm text-yellow-500 font-bold animate-pulse">● Listening...</p>
            )}
            {isProcessing && (
              <p className="text-sm text-blue-500 font-bold animate-pulse">● Processing...</p>
            )}
          </div>

          {/* Push-to-Talk Button */}
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={isProcessing}
            className="w-full py-6 sm:py-8 rounded-full font-black text-white text-lg sm:text-xl transition-all active:scale-95 disabled:opacity-50"
            style={{
              backgroundColor: isRecording ? '#ef4444' : bot.accentColor,
              boxShadow: isRecording
                ? `0 0 30px ${bot.accentColor}40, inset 0 0 30px ${bot.accentColor}20`
                : 'none',
            }}
          >
            {isRecording ? '● RELEASE TO SEND' : '🎤 PRESS & HOLD TO TALK'}
          </button>

          {/* Send Button (if manual input desired) */}
          {transcript && (
            <button
              onClick={sendMessage}
              disabled={isProcessing || !webhookUrl}
              className="w-full py-3 sm:py-4 font-bold rounded-lg transition-all disabled:opacity-50"
              style={{ backgroundColor: bot.accentColor + 'cc' }}
            >
              Send
            </button>
          )}

          {!webhookUrl && (
            <p className="text-xs sm:text-sm text-center text-red-400">
              Configure webhook in Settings to chat
            </p>
          )}
        </div>
      </footer>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} />
    </div>
  )
}
