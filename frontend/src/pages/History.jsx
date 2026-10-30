import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const History = () => {
  const navigate = useNavigate()
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/interviews/my', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to load history')
      }

      setInterviews(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewReport = (sessionId) => {
    navigate('/result', { state: { sessionId } })
  }

  if (loading) {
    return (
      <div className='min-h-screen w-full bg-purple-200 pt-28 flex justify-center items-center'>
        <p className='text-xl font-bold text-gray-800'>Loading interview history...</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen w-full bg-purple-200 pt-28 pb-12 px-4'>
      <div className='max-w-4xl mx-auto flex flex-col gap-6'>
        
        <h1 className='text-3xl font-extrabold text-gray-900 border-b pb-3 border-gray-400'>
          Your Interview History
        </h1>

        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl'>
            <p className='font-semibold'>{error}</p>
          </div>
        )}

        {interviews.length === 0 && !error ? (
          <div className='bg-white rounded-2xl p-8 text-center text-gray-700 shadow-md'>
            <p className='text-lg font-medium mb-4'>Aapne abhi tak koi interview attempt nahi kiya.</p>
            <button 
              onClick={() => navigate('/interview')}
              className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl transition cursor-pointer'
            >
              Start Your First Interview
            </button>
          </div>
        ) : (
          <div className='grid gap-4'>
            {interviews.map((item) => (
              <div 
                key={item.session_id} 
                className='bg-white rounded-2xl p-5 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-gray-100'
              >
                <div>
                  <h3 className='text-lg font-bold text-gray-800'>
                    Interview Session #{item.session_id}
                  </h3>
                  <p className='text-xs text-gray-500 mt-1'>
                    Started: {new Date(item.started_at).toLocaleString()}
                  </p>
                  <span className={`inline-block mt-2 text-xs font-extrabold px-3 py-1 rounded-full ${
                    item.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className='flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end'>
                  <div className='text-right'>
                    <span className='block text-xs font-semibold text-gray-500 uppercase'>Score</span>
                    <span className='text-xl font-bold text-blue-600'>{item.score}</span>
                  </div>

                  {item.status === 'Completed' ? (
                    <button
                      onClick={() => handleViewReport(item.session_id)}
                      className='bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition cursor-pointer'
                    >
                      View Report
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/interview')}
                      className='bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition cursor-pointer'
                    >
                      Continue
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default History