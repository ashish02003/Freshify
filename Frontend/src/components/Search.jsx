

// import React, { useEffect, useState } from 'react'
// import { IoSearch } from "react-icons/io5";
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { TypeAnimation } from 'react-type-animation';
// import { FaArrowLeft } from "react-icons/fa";
// import useMobile from '../hooks/useMobile';
// import { MdKeyboardVoice } from "react-icons/md";

// const Search = () => {
//   const navigate = useNavigate()
//   const location = useLocation()
//   const [isSearchPage, setIsSearchPage] = useState(false)
//   const [isMobile] = useMobile()
//   const params = useLocation()
//   const searchText = params.search?.slice(3) || ""
//   const [query, setQuery] = useState(searchText)

//   // 🔹 For Modal
//   const [listening, setListening] = useState(false)

//   useEffect(() => {
//     const isSearch = location.pathname === "/search"
//     setIsSearchPage(isSearch)
//   }, [location])

//   const handleOnChange = (e) => {
//     const value = e.target.value
//     setQuery(value)
//     navigate(`/search?q=${value}`)
//   }

//   // 🔹 Handle Voice Search with Modal

// // 🔹 Updated Handle Voice Search with Mobile Optimizations
// const handleVoiceSearch = async () => {
//   // Check if already listening
//   if (listening) {
//     return
//   }

//   const SpeechRecognition =
//     window.SpeechRecognition || window.webkitSpeechRecognition
//   if (!SpeechRecognition) {
//     alert("Your browser doesn't support voice search")
//     return
//   }

//   // 🔹 Request microphone permission for mobile devices
//   if (isMobile) {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
//       stream.getTracks().forEach(track => track.stop()) // Stop immediately after permission
//     } catch (error) {
//       console.error('Microphone permission denied:', error)
//       alert("Microphone access is required for voice search. Please enable it in your browser settings.")
//       return
//     }
//   }

//   const recognition = new SpeechRecognition()
//   recognition.lang = "en-IN"
//   recognition.continuous = false
//   recognition.interimResults = false
//   recognition.maxAlternatives = 1

//   // 🔹 Mobile-specific timeout (important!)
//   const timeoutId = setTimeout(() => {
//     if (listening) {
//       recognition.stop()
//       setListening(false)
//     }
//   }, isMobile ? 8000 : 12000) // 8 seconds on mobile, 12 on desktop

//   try {
//     // 🔹 Only play sound on desktop to avoid mobile audio conflicts
//     if (!isMobile) {
//       new Audio("/sounds/start.mp3").play().catch(e => {
//         console.warn("Could not play start sound:", e)
//       })
//     }
    
//     setListening(true)
//     recognition.start()

//     recognition.onresult = (event) => {
//       const transcript = event.results[0][0].transcript.trim()
      
//       if (transcript && transcript.length > 1) {
//         setQuery(transcript)

//         // 🔹 Only play end sound on desktop
//         if (!isMobile) {
//           new Audio("/sounds/end.mp3").play().catch(e => {
//             console.warn("Could not play end sound:", e)
//           })
//         }

//         setListening(false)
//         navigate(`/search?q=${transcript}`)
//       }
      
//       clearTimeout(timeoutId)
//     }

//     recognition.onerror = (event) => {
//       console.error("Voice search error:", event.error)
//       setListening(false)
//       clearTimeout(timeoutId)
      
//       // 🔹 Mobile-friendly error messages
//       switch(event.error) {
//         case 'not-allowed':
//           alert("🎤 Microphone access denied. Please enable microphone in your browser settings.")
//           break
//         case 'no-speech':
//           if (!isMobile) {
//             alert("No speech detected. Please try again.")
//           }
//           break
//         case 'audio-capture':
//           alert("🎤 No microphone found. Please check your device settings.")
//           break
//         case 'network':
//           alert("🌐 Network error. Please check your internet connection.")
//           break
//         default:
//           if (isMobile) {
//             alert("Voice search failed. Please try again or type your search.")
//           } else {
//             alert(`Voice search error: ${event.error}`)
//           }
//       }
//     }

//     recognition.onend = () => {
//       setListening(false)
//       clearTimeout(timeoutId)
//     }

//   } catch (error) {
//     console.error("Failed to start voice recognition:", error)
//     setListening(false)
//     clearTimeout(timeoutId)
//     alert("Voice search is not available right now. Please try typing your search.")
//   }
// }
//   return (
//     <div>
//       {/* 🔹 Main Search Box */}
//       <div className='w-full min-w-[300px] lg:min-w-[420px] h-11 lg:h-12 rounded-lg border overflow-hidden flex items-center text-neutral-500 bg-slate-50 group focus-within:border-primary-200 '>
//         <div>
//           {isMobile && isSearchPage ? (
//             <Link
//               to={"/"}
//               className='flex justify-center items-center h-full p-2 m-1 group-focus-within:text-primary-200 bg-white rounded-full shadow-md'
//             >
//               <FaArrowLeft size={20} />
//             </Link>
//           ) : (
//             <button className='flex justify-center items-center h-full p-3 group-focus-within:text-primary-200'>
//               <IoSearch size={22} />
//             </button>
//           )}
//         </div>

//         <div className='w-full h-full flex items-center'>
//           {!isSearchPage ? (
//             <div
//               onClick={() => navigate("/search")}
//               className='w-full h-full flex items-center cursor-text'
//             >
//               <TypeAnimation
//                 sequence={[
//                   'Search "milk"', 1000,
//                   'Search "bread"', 1000,
//                   'Search "sugar"', 1000,
//                   'Search "paneer"', 1000,
//                   'Search "chocolate"', 1000,
//                   'Search "curd"', 1000,
//                   'Search "rice"', 1000,
//                   'Search "egg"', 1000,
//                   'Search "chips"',
//                 ]}
//                 wrapper="span"
//                 speed={50}
//                 repeat={Infinity}
//               />
//             </div>
//           ) : (
//             <>
//               <input
//                 type='text'
//                 placeholder='Search for atta dal and more.'
//                 autoFocus
//                 value={query}
//                 className='bg-transparent w-full h-full outline-none'
//                 onChange={handleOnChange}
//               />
//               {/* Mic Button */}
//               <button
//                 type="button"
//                 onClick={handleVoiceSearch}
//                 className="px-2 text-gray-600 hover:text-green-600"
//               >
//                 <MdKeyboardVoice size={22} />
//               </button>
//             </>
//           )}
//         </div>
//       </div>

//       {/* 🔹 Listening Modal */}
//       {listening && (
//         <div className="fixed inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-50">
//           <div className="bg-gray-900 text-white p-8 rounded-xl text-center">
//             <p className="text-xl mb-4">Listening...</p>
//             <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-600 animate-pulse">
//               <MdKeyboardVoice size={22} />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default Search
import React, { useEffect, useState } from 'react'
import { IoSearch } from "react-icons/io5";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import { FaArrowLeft } from "react-icons/fa";
import useMobile from '../hooks/useMobile';
import { MdKeyboardVoice } from "react-icons/md";

const Search = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSearchPage, setIsSearchPage] = useState(false)
  const [isMobile] = useMobile()
  const params = useLocation()
  const searchText = params.search?.slice(3) || ""
  const [query, setQuery] = useState(searchText)

  // 🔹 For Modal and Permission Management
  const [listening, setListening] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(null) // null, true, false

  useEffect(() => {
    const isSearch = location.pathname === "/search"
    setIsSearchPage(isSearch)
  }, [location])

  // 🔹 Check microphone permission on component mount
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      if (!isMobile) return // Only check on mobile

      try {
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({ name: 'microphone' })
          setPermissionGranted(permission.state === 'granted')
          
          // Listen for permission changes
          permission.addEventListener('change', () => {
            setPermissionGranted(permission.state === 'granted')
          })
        }
      } catch (error) {
        console.warn('Could not check microphone permission:', error)
        setPermissionGranted(null) // Unknown permission state
      }
    }

    checkMicrophonePermission()
  }, [isMobile])

  const handleOnChange = (e) => {
    const value = e.target.value
    setQuery(value)
    navigate(`/search?q=${value}`)
  }

  // 🔹 Updated Handle Voice Search with Mobile Audio Fix
  const handleVoiceSearch = async () => {
    // Check if already listening
    if (listening) {
      return
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Your browser doesn't support voice search")
      return
    }

    // 🔹 Request microphone permission for mobile devices (only if not already granted)
    if (isMobile && permissionGranted !== true) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop()) // Stop immediately after permission
        setPermissionGranted(true)
      } catch (error) {
        console.error('Microphone permission denied:', error)
        setPermissionGranted(false)
        alert("🎤 Microphone access is required for voice search. Please enable it in your browser settings and refresh the page.")
        return
      }
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-IN"
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    // 🔹 Mobile-specific timeout (important!)
    const timeoutId = setTimeout(() => {
      if (listening) {
        recognition.stop()
        setListening(false)
      }
    }, isMobile ? 8000 : 12000) // 8 seconds on mobile, 12 on desktop

    try {
      // 🔹 Play start sound BEFORE starting recognition (mobile fix)
      const startSound = new Audio("/sounds/start.mp3")
      await startSound.play().catch(e => {
        console.warn("Could not play start sound:", e)
      })
      
      // 🔹 Small delay on mobile to let audio finish before mic starts
      if (isMobile) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      setListening(true)
      recognition.start()

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript.trim()
        
        if (transcript && transcript.length > 1) {
          // 🔹 Stop recognition first, then play sound
          recognition.stop()
          setListening(false)
          
          // 🔹 Small delay before playing end sound on mobile
          if (isMobile) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
          
          // 🔹 Play end sound for all devices
          const endSound = new Audio("/sounds/end.mp3")
          await endSound.play().catch(e => {
            console.warn("Could not play end sound:", e)
          })

          setQuery(transcript)
          navigate(`/search?q=${transcript}`)
        }
        
        clearTimeout(timeoutId)
      }

      recognition.onerror = (event) => {
        console.error("Voice search error:", event.error)
        setListening(false)
        clearTimeout(timeoutId)
        
        // 🔹 Mobile-friendly error messages
        switch(event.error) {
          case 'not-allowed':
            setPermissionGranted(false)
            alert("🎤 Microphone access denied. Please enable microphone in your browser settings.")
            break
          case 'no-speech':
            if (!isMobile) {
              alert("No speech detected. Please try again.")
            }
            break
          case 'audio-capture':
            alert("🎤 No microphone found. Please check your device settings.")
            break
          case 'network':
            alert("🌐 Network error. Please check your internet connection.")
            break
          default:
            if (isMobile) {
              alert("Voice search failed. Please try again or type your search.")
            } else {
              alert(`Voice search error: ${event.error}`)
            }
        }
      }

      recognition.onend = () => {
        setListening(false)
        clearTimeout(timeoutId)
      }

    } catch (error) {
      console.error("Failed to start voice recognition:", error)
      setListening(false)
      clearTimeout(timeoutId)
      alert("Voice search is not available right now. Please try typing your search.")
    }
  }

  return (
    <div>
      {/* 🔹 Main Search Box */}
      <div className='w-full min-w-[300px] lg:min-w-[420px] h-11 lg:h-12 rounded-lg border overflow-hidden flex items-center text-neutral-500 bg-slate-50 group focus-within:border-primary-200 '>
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
              {/* Mic Button with Permission Status */}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`px-2 transition-colors duration-200 ${
                  listening 
                    ? 'text-red-600 cursor-not-allowed' 
                    : permissionGranted === false
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-green-600'
                }`}
                disabled={listening || (isMobile && permissionGranted === false)}
                title={
                  listening ? "Listening..." : 
                  permissionGranted === false ? "Microphone access denied" :
                  "Voice search"
                }
              >
                <MdKeyboardVoice 
                  size={22} 
                  className={listening ? 'animate-pulse' : ''} 
                />
                {/* Show permission status on mobile */}
                {isMobile && permissionGranted === false && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></span>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 🔹 Enhanced Listening Modal */}
      {listening && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-50">
          <div className="bg-gray-900 text-white p-8 rounded-xl text-center max-w-sm mx-4">
            <p className="text-xl mb-4">Listening...</p>
            <p className="text-sm text-gray-300 mb-6">Speak clearly into your device</p>
            
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-600 animate-pulse mx-auto mb-6">
              <MdKeyboardVoice size={22} />
            </div>
            
            {/* Manual stop button for mobile */}
            <button
              onClick={() => setListening(false)}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg text-white font-medium"
            >
              Stop Listening
            </button>
            
            <p className="text-xs text-gray-400 mt-4">
              Automatically stops after {isMobile ? '8' : '12'} seconds
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Search