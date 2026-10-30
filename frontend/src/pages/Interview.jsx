import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const Interview = () => {
  const navigate = useNavigate()

  // State management
  const [sessionId, setSessionId] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [followupQuestion, setFollowupQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Mic / Voice states
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  // Load Initial Interview Session
  useEffect(() => {
    startNewInterview()
  }, [])

  const startNewInterview = async () => {
    setLoading(true)
    setError('')
    const token = localStorage.getItem('token')

    if (!token) {
      setError('Please login first to start an interview.')
      navigate('/login')
      return
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/start-interview', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.detail || 'Failed to start interview')

      setSessionId(data.session_id)
      setCurrentQuestion(data.question)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle Response from API (Common for Text & Audio)
  const handleInterviewResponse = (data) => {
    setFeedback(data.feedback || '')

    // Case 1: Needs Followup Question
    if (data.followup_question) {
      setFollowupQuestion(data.followup_question)
      setAnswer('')
      return
    }

    // Reset Followup state if cleared
    setFollowupQuestion('')

    // Case 2: Interview Completed
    if (data.message === 'Interview Completed') {
      alert('Interview Completed Successfully!')
      navigate('/result', { state: { sessionId } })
      return
    }

    // Case 3: Next Question received
    if (data.next_question) {
      setCurrentQuestion(data.next_question)
      setAnswer('')
    }
  }

  // Submit Text Answer
  const handleSubmitText = async () => {
    if (!answer.trim()) return
    setLoading(true)
    setError('')
    const token = localStorage.getItem('token')

    try {
      const res = await fetch('http://127.0.0.1:8000/submit-answer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          answer: answer
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error submitting answer')

      handleInterviewResponse(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Start Audio Recording
  const startRecording = async () => {
    audioChunksRef.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        sendAudioToBackend(audioBlob)
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (err) {
      setError('Microphone access permission denied or unavailable.')
    }
  }

  // Stop Audio Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Submit Audio File to FastAPI (/submit-audio)
  const sendAudioToBackend = async (audioBlob) => {
    setLoading(true)
    setError('')
    const token = localStorage.getItem('token')

    if (!token) {
      setError('Authorization token missing. Please login again.')
      setLoading(false)
      return
    }

    // WebM / WAV blob ko proper File object me convert karein
    const audioFile = new File([audioBlob], 'audio_recording.wav', {
      type: 'audio/wav'
    })

    const formData = new FormData()
    formData.append('audio', audioFile)

    try {
      const res = await fetch(`http://127.0.0.1:8000/submit-audio?session_id=${sessionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` // Authorization Header Pass Karein
        },
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || data.message || 'Error processing audio on server')
      }

      if (data.transcript) {
        setAnswer(data.transcript)
      }

      if (data.result) {
        handleInterviewResponse(data.result)
      }
    } catch (err) {
      console.error("Audio submit error:", err)
      setError(err.message || 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen w-full bg-purple-200 pt-24 px-4 flex flex-col items-center'>
      {error && <p className='text-red-600 font-semibold mb-4 bg-red-100 p-2 rounded'>{error}</p>}

      {currentQuestion && (
        <div className='w-full max-w-3xl flex flex-col items-center gap-4'>
          {/* Question Box */}
          <div className='w-full bg-cyan-600 text-black p-6 rounded-2xl shadow-lg'>
            <h3 className='font-extrabold text-xl text-center mb-2'>
              Question #{currentQuestion.id} (Marks: {currentQuestion.marks})
            </h3>
            <p className='text-lg text-center font-medium'>
              {currentQuestion.question}
            </p>
          </div>

          {/* Followup Question Warning if active */}
          {followupQuestion && (
            <div className='w-full bg-amber-200 border-l-4 border-amber-500 p-4 rounded-lg'>
              <p className='font-bold text-amber-800'>Follow-up Required:</p>
              <p className='text-amber-900'>{followupQuestion}</p>
            </div>
          )}

          {/* Feedback Display */}
          {feedback && (
            <div className='w-full bg-blue-100 border border-blue-400 text-blue-800 p-3 rounded-xl text-sm'>
              <strong>AI Feedback:</strong> {feedback}
            </div>
          )}

          {/* Textarea Answer Input */}
          <textarea
            className='w-full bg-white border border-black max-w-3xl rounded-2xl focus:outline-none p-4 text-gray-800'
            rows={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder='Type your answer or record using mic...'
          />

          {/* Action Buttons (Submit & Voice) */}
          <div className='flex gap-4 items-center mt-2'>
            <button
              onClick={handleSubmitText}
              disabled={loading || !answer.trim()}
              className='bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded-lg cursor-pointer transition'
            >
              {loading ? 'Processing...' : 'Submit Answer'}
            </button>

            {/* Mic Recording Controls */}
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={loading}
                className='bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer transition flex items-center gap-2'
              >
                🎙️ Speak Answer
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className='bg-gray-800 hover:bg-black text-white font-semibold px-4 py-2 rounded-lg cursor-pointer animate-pulse transition'
              >
                ⏹️ Stop Recording
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Interview