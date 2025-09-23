

import React, { useEffect, useState } from 'react'
import { IoSearch } from "react-icons/io5";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import { FaArrowLeft } from "react-icons/fa";
import useMobile from '../hooks/useMobile';
import { MdKeyboardVoice, MdMicOff } from "react-icons/md";

const Search = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSearchPage, setIsSearchPage] = useState(false)
  const [isMobile] = useMobile()
  const params = useLocation()
  const searchText = params.search?.slice(3) || ""
  const [query, setQuery] = useState(searchText)

  // Voice search states
  const [listening, setListening] = useState(false)
  const [isVoiceSupported, setIsVoiceSupported] = useState(false)
  const [voiceError, setVoiceError] = useState('')

  useEffect(() => {
    const isSearch = location.pathname === "/search"
    setIsSearchPage(isSearch)
  }, [location])

  // Check for voice search support
  useEffect(() => {
    const checkVoiceSupport = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      setIsVoiceSupported(!!SpeechRecognition)
    }
    
    checkVoiceSupport()
  }, [])

  const handleOnChange = (e) => {
    const value = e.target.value
    setQuery(value)
    navigate(`/search?q=${value}`)
  }

  // Improved voice search handler
  const handleVoiceSearch = () => {
    if (listening) {
      stopListening()
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setVoiceError("Voice search is not supported in this browser")
      return
    }

    startVoiceRecognition(SpeechRecognition)
  }

  const startVoiceRecognition = (SpeechRecognition) => {
    const recognition = new SpeechRecognition()
    
    // Enhanced Configuration for better reliability
    recognition.continuous = false
    recognition.interimResults = true  // Changed to true for better responsiveness
    recognition.maxAlternatives = 3     // Increased alternatives
    
    // Set language based on user preference or default to English
    recognition.lang = navigator.language || 'en-US'
    
    // Mobile-specific optimizations
    if (isMobile) {
      recognition.continuous = true    // Better for mobile
      recognition.interimResults = true
    }
    
    setListening(true)
    setVoiceError('')

    // Extended timeout for better user experience
    const timeoutId = setTimeout(() => {
      if (recognition) {
        recognition.stop()
      }
    }, 15000) // Increased to 15 seconds

    let finalTranscript = ''
    let interimTranscript = ''

    recognition.onstart = () => {
      setListening(true)
      console.log('Voice recognition started')
      // Play start sound
      playNotificationSound('start')
    }

    recognition.onresult = async (event) => {
      interimTranscript = ''
      finalTranscript = ''

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      // Show interim results in console for debugging
      if (interimTranscript) {
        console.log('Interim:', interimTranscript)
      }

      // Process final result
      if (finalTranscript.trim()) {
        clearTimeout(timeoutId)
        
        // Play end/success sound first
        await playNotificationSound('end')
        
        // Clean and process the transcript
        const cleanTranscript = finalTranscript.trim().toLowerCase()
        
        if (cleanTranscript.length > 1) {
          // Small delay to let sound finish before navigation
          setTimeout(() => {
            setQuery(cleanTranscript)
            navigate(`/search?q=${encodeURIComponent(cleanTranscript)}`)
          }, 200)
        }
        
        recognition.stop()
      }
      
      // Auto-stop on mobile if we have a good interim result and silence
      if (isMobile && interimTranscript.trim().length > 3) {
        setTimeout(() => {
          if (recognition && listening) {
            recognition.stop()
          }
        }, 1500)
      }
    }

    recognition.onaudiostart = () => {
      console.log('Audio capture started')
    }

    recognition.onaudioend = () => {
      console.log('Audio capture ended')
    }

    recognition.onspeechstart = () => {
      console.log('Speech detected')
    }

    recognition.onspeechend = () => {
      console.log('Speech ended')
      // Don't auto-stop here, let onresult handle it
    }

    recognition.onerror = (event) => {
      clearTimeout(timeoutId)
      setListening(false)
      
      console.error('Voice recognition error:', event.error)
      
      // Handle different error types with better messages
      switch(event.error) {
        case 'not-allowed':
        case 'permission-denied':
          setVoiceError("🎤 Please allow microphone access in your browser settings and try again.")
          break
        case 'no-speech':
          setVoiceError("No speech detected. Try speaking closer to your device or in a quieter environment.")
          break
        case 'audio-capture':
          setVoiceError("🎤 Microphone not found. Please check your device settings.")
          break
        case 'network':
          setVoiceError("🌐 Connection error. Please check your internet and try again.")
          break
        case 'service-not-allowed':
          setVoiceError("Voice service blocked. Please check your browser permissions.")
          break
        case 'aborted':
          // User cancelled, no error message needed
          return
        case 'language-not-supported':
          setVoiceError("Language not supported. Switching to English.")
          // Retry with English
          setTimeout(() => {
            const englishRecognition = new SpeechRecognition()
            englishRecognition.lang = 'en-US'
            startVoiceRecognitionWithConfig(englishRecognition)
          }, 1000)
          return
        default:
          setVoiceError(`Voice search failed (${event.error}). Please try again or speak more clearly.`)
      }
      
      // Play error sound
      playNotificationSound('error')
    }

    recognition.onend = () => {
      clearTimeout(timeoutId)
      setListening(false)
      console.log('Voice recognition ended')
    }

    // Start recognition with error handling
    try {
      recognition.start()
      // Note: Start sound will be played in onstart event
    } catch (error) {
      clearTimeout(timeoutId)
      setListening(false)
      setVoiceError("Failed to start voice recognition. Please try again.")
      console.error('Failed to start recognition:', error)
    }

    // Store recognition instance for stopping
    window.currentRecognition = recognition
  }

  const stopListening = () => {
    if (window.currentRecognition) {
      window.currentRecognition.stop()
      window.currentRecognition = null
    }
    setListening(false)
  }

  // Play notification sounds with fallback options
  const playNotificationSound = async (type) => {
    try {
      // First try to play your audio files
      let audioFile = null
      switch(type) {
        case 'start':
          audioFile = "/sounds/start.mp3"
          break
        case 'success':
        case 'end':
          audioFile = "/sounds/end.mp3"
          break
        default:
          break
      }
      
      if (audioFile) {
        try {
          const audio = new Audio(audioFile)
          audio.volume = 0.5
          await audio.play()
          return // Successfully played file
        } catch (fileError) {
          console.warn('Could not play audio file:', fileError)
          // Fall back to generated sound
        }
      }
      
      // Fallback: Generate sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Different tones for different events (Google-like sounds)
      switch(type) {
        case 'start':
          oscillator.frequency.value = 800
          gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
          break
        case 'success':
        case 'end':
          oscillator.frequency.value = 1000
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
          break
        case 'error':
          oscillator.frequency.value = 400
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
          break
      }
      
      oscillator.type = 'sine'
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + (type === 'error' ? 0.3 : 0.15))
      
    } catch (error) {
      // Complete fallback: no sound if everything fails
      console.warn('Could not play any notification sound:', error)
    }
  }

  // Clear error after some time
  useEffect(() => {
    if (voiceError) {
      const timer = setTimeout(() => {
        setVoiceError('')
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [voiceError])

  return (
    <div>
      {/* Main Search Box */}
      <div className='w-full min-w-[300px] lg:min-w-[420px] h-11 lg:h-12 rounded-lg border overflow-hidden flex items-center text-neutral-500 bg-slate-50 group focus-within:border-primary-200'>
        <div>
          {isMobile && isSearchPage ? (
            <Link
              to={"/"}
              className='flex justify-center items-center h-full p-2 m-1 group-focus-within:text-primary-200 bg-white rounded-full shadow-md'
            >
              <FaArrowLeft size={20} />
            </Link>
          ) : (
            <button className='flex justify-center items-center h-full p-3 group-focus-within:text-primary-200'>
              <IoSearch size={22} />
            </button>
          )}
        </div>

        <div className='w-full h-full flex items-center'>
          {!isSearchPage ? (
            <div
              onClick={() => navigate("/search")}
              className='w-full h-full flex items-center cursor-text'
            >
              <TypeAnimation
                sequence={[
                  'Search "milk"', 1000,
                  'Search "bread"', 1000,
                  'Search "sugar"', 1000,
                  'Search "paneer"', 1000,
                  'Search "chocolate"', 1000,
                  'Search "curd"', 1000,
                  'Search "rice"', 1000,
                  'Search "egg"', 1000,
                  'Search "chips"',
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
            </div>
          ) : (
            <>
              <input
                type='text'
                placeholder='Search for atta dal and more.'
                autoFocus
                value={query}
                className='bg-transparent w-full h-full outline-none'
                onChange={handleOnChange}
              />
              
              {/* Voice Search Button */}
              {isVoiceSupported && (
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className={`px-3 py-2 transition-all duration-200 rounded-full mx-1 ${
                    listening 
                      ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  title={listening ? "Stop listening" : "Voice search"}
                  disabled={false} // Always enabled when supported
                >
                  {listening ? (
                    <MdMicOff size={20} className="animate-pulse" />
                  ) : (
                    <MdKeyboardVoice size={20} />
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Voice Error Display */}
      {voiceError && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{voiceError}</p>
        </div>
      )}

      {/* Listening Modal */}
      {listening && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
          <div className="bg-white text-gray-800 p-6 rounded-2xl text-center max-w-sm mx-4 shadow-2xl">
            {/* Listening Animation */}
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-red-100 mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20"></div>
              <div className="absolute inset-2 rounded-full bg-red-400 animate-pulse opacity-40"></div>
              <MdKeyboardVoice size={28} className="text-red-600 z-10" />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">Listening...</h3>
            <p className="text-gray-600 text-sm mb-4">
              {isMobile ? "Speak clearly and close to your device" : "Speak now"}
            </p>
            
            {/* Voice level indicator */}
            <div className="flex justify-center mb-4">
              <div className="flex space-x-1">
                <div className="w-1 bg-green-400 rounded animate-pulse" style={{height: '20px'}}></div>
                <div className="w-1 bg-green-400 rounded animate-pulse" style={{height: '30px', animationDelay: '0.1s'}}></div>
                <div className="w-1 bg-green-400 rounded animate-pulse" style={{height: '25px', animationDelay: '0.2s'}}></div>
                <div className="w-1 bg-green-400 rounded animate-pulse" style={{height: '35px', animationDelay: '0.3s'}}></div>
                <div className="w-1 bg-green-400 rounded animate-pulse" style={{height: '20px', animationDelay: '0.4s'}}></div>
              </div>
            </div>
            
            {/* Stop Button */}
            <button
              onClick={stopListening}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-full text-white font-medium transition-colors duration-200"
            >
              Stop
            </button>
            
            <p className="text-xs text-gray-400 mt-4">
              Will stop automatically after 15 seconds
            </p>
            
            {/* Tips for better recognition */}
            <div className="mt-3 text-xs text-gray-500">
              💡 Tips: Speak clearly, avoid background noise
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close modal */}
      {listening && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={stopListening}
        ></div>
      )}
    </div>
  )
}

export default Search