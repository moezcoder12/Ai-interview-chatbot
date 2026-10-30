import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'

const Result = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Interview page se aane wala sessionId extract karein
  const sessionId = location.state?.sessionId

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found. Please complete an interview first.')
      setLoading(false)
      return
    }

    fetchReport()
  }, [sessionId])

  const fetchReport = async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/report/${sessionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch interview report.')
      }

      setReport(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen w-full bg-purple-200 pt-28 flex justify-center items-center'>
        <p className='text-xl font-bold text-gray-800'>Loading your result report...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen w-full bg-purple-200 pt-28 flex flex-col justify-center items-center gap-4'>
        <div className='bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl'>
          <p className='font-bold'>{error}</p>
        </div>
        <Link to='/interview' className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'>
          Start New Interview
        </Link>
      </div>
    )
  }

  return (
    <div className='min-h-screen w-full bg-purple-200 pt-28 pb-12 px-4'>
      <div className='max-w-4xl mx-auto flex flex-col gap-6'>
        
        {/* Overall Score Summary Header */}
        <div className='w-full bg-cyan-700 text-white rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4'>
          <div>
            <h1 className='text-3xl font-extrabold'>Interview Summary</h1>
            <p className='text-cyan-100 mt-1'>
              Candidate: <span className='font-semibold text-white'>{report?.candidate?.name}</span> ({report?.candidate?.email})
            </p>
            <p className='text-sm text-cyan-200 mt-1'>
              Status: <span className='font-bold uppercase'>{report?.status}</span>
            </p>
          </div>

          <div className='bg-white text-gray-900 px-6 py-4 rounded-xl text-center shadow-md'>
            <span className='block text-xs font-bold text-gray-500 uppercase tracking-wider'>Final Percentage</span>
            <span className='text-4xl font-extrabold text-blue-600'>{report?.percentage}%</span>
            <span className='block text-xs text-gray-600 mt-1'>Total Score: {report?.score}</span>
          </div>
        </div>

        {/* Detailed Answer Breakdown */}
        <div className='bg-white rounded-2xl p-6 shadow-md'>
          <h2 className='text-2xl font-bold text-gray-800 mb-6 border-b pb-3'>
            Question Breakdown & Evaluation
          </h2>

          <div className='flex flex-col gap-6'>
            {report?.answers?.map((ans, idx) => (
              <div key={idx} className='border border-gray-200 rounded-xl p-5 bg-gray-50 flex flex-col gap-3'>
                <div className='flex justify-between items-start gap-2'>
                  <h3 className='font-bold text-gray-900 text-lg'>
                    Q{idx + 1}. {ans.question}
                  </h3>
                  <span className='bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap'>
                    Score: {ans.ai_score}
                  </span>
                </div>

                <div className='text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-100'>
                  <p className='font-semibold text-gray-900 mb-1'>Expected Answer:</p>
                  <p>{ans.expected_answer}</p>
                </div>

                <div className='text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-100'>
                  <p className='font-semibold text-gray-900 mb-1'>Your Answer:</p>
                  <p className='italic text-gray-800'>{ans.candidate_answer || 'No answer provided'}</p>
                </div>

                <div className='text-sm bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg'>
                  <p className='font-bold text-blue-900 mb-1'>AI Feedback:</p>
                  <p className='text-blue-800'>{ans.feedback}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className='flex justify-center gap-4 mt-4'>
          <Link 
            to='/' 
            className='bg-gray-700 hover:bg-gray-800 text-white font-semibold px-6 py-2 rounded-xl transition'
          >
            Back to Home
          </Link>
          <Link 
            to='/interview' 
            className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl transition'
          >
            Start New Practice
          </Link>
        </div>

      </div>
    </div>
  )
}

export default Result