

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

  // 🔹 For Modal
  const [listening, setListening] = useState(false)

  useEffect(() => {
    const isSearch = location.pathname === "/search"
    setIsSearchPage(isSearch)
  }, [location])

  const handleOnChange = (e) => {
    const value = e.target.value
    setQuery(value)
    navigate(`/search?q=${value}`)
  }

  // 🔹 Handle Voice Search with Modal
  const handleVoiceSearch = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Your browser doesn't support voice search")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-IN"
    recognition.continuous = false
    recognition.interimResults = false

    // Play start sound
    new Audio("/sounds/start.mp3").play()
    setListening(true)

    recognition.start()

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)

      // Play end sound
      new Audio("/sounds/end.mp3").play()

      setListening(false) // close modal
      navigate(`/search?q=${transcript}`)
    }

    recognition.onerror = (event) => {
      console.error("Voice search error:", event.error)
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
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
              {/* Mic Button */}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className="px-2 text-gray-600 hover:text-green-600"
              >
                <MdKeyboardVoice size={22} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 🔹 Listening Modal */}
      {listening && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-50">
          <div className="bg-gray-900 text-white p-8 rounded-xl text-center">
            <p className="text-xl mb-4">Listening...</p>
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-600 animate-pulse">
              <MdKeyboardVoice size={22} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Search
