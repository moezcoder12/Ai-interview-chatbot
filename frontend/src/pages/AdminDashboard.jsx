import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetchAllInterviews()
  }, [])

  // Fetch All Interviews for Admin
  const fetchAllInterviews = async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/admin/interviews', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Access denied or failed to load interviews')
      }

      setInterviews(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Delete Candidate Function
  const handleDeleteCandidate = async (userId, candidateName) => {
    if (!window.confirm(`Kya aap sure hain ke candidate "${candidateName}" ko delete karna chahte hain?`)) {
      return
    }

    setError('')
    setSuccessMsg('')
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`http://127.0.0.1:8000/admin/candidates/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to delete candidate')
      }

      setSuccessMsg(`Candidate "${candidateName}" successfully delete ho gaya!`)
      // Refresh interviews list after deletion
      fetchAllInterviews()
    } catch (err) {
      setError(err.message)
    }
  }

  // View Candidate Detailed Report
  const handleViewReport = (sessionId) => {
    navigate('/result', { state: { sessionId } })
  }

  if (loading) {
    return (
      <div className='min-h-screen w-full bg-purple-200 pt-28 flex justify-center items-center'>
        <p className='text-xl font-bold text-gray-800'>Loading Admin Portal...</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen w-full bg-purple-200 pt-28 pb-12 px-4'>
      <div className='max-w-6xl mx-auto flex flex-col gap-6'>
        
        <div className='flex justify-between items-center border-b pb-4 border-gray-400'>
          <h1 className='text-3xl font-extrabold text-gray-900'>
            Admin Dashboard - All Candidate Interviews
          </h1>
          <span className='bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase'>
            Admin Panel
          </span>
        </div>

        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl'>
            <p className='font-semibold'>{error}</p>
          </div>
        )}

        {successMsg && (
          <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl'>
            <p className='font-semibold'>{successMsg}</p>
          </div>
        )}

        <div className='bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='bg-gray-100 border-b border-gray-200 text-gray-700 text-sm font-bold'>
                  <th className='p-4'>Session ID</th>
                  <th className='p-4'>Candidate Name</th>
                  <th className='p-4'>Email</th>
                  <th className='p-4'>Score</th>
                  <th className='p-4'>Status</th>
                  <th className='p-4'>Started At</th>
                  <th className='p-4 text-center'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 text-sm text-gray-800'>
                {interviews.length === 0 ? (
                  <tr>
                    <td colSpan='7' className='p-6 text-center text-gray-500 font-medium'>
                      Koi interviews record nahi mile.
                    </td>
                  </tr>
                ) : (
                  interviews.map((item) => (
                    <tr key={item.session_id} className='hover:bg-gray-50 transition'>
                      <td className='p-4 font-bold'>#{item.session_id}</td>
                      <td className='p-4 font-semibold'>{item.candidate?.name || 'N/A'}</td>
                      <td className='p-4 text-gray-600'>{item.candidate?.email || 'N/A'}</td>
                      <td className='p-4 font-bold text-blue-600'>{item.score}</td>
                      <td className='p-4'>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          item.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className='p-4 text-xs text-gray-500'>
                        {item.started_at ? new Date(item.started_at).toLocaleString() : 'N/A'}
                      </td>
                      <td className='p-4'>
                        <div className='flex items-center justify-center gap-2'>
                          <button
                            onClick={() => handleViewReport(item.session_id)}
                            className='bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer'
                          >
                            View Report
                          </button>
                          {item.candidate?.id && (
                            <button
                              onClick={() => handleDeleteCandidate(item.candidate.id, item.candidate.name)}
                              className='bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer'
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AdminDashboard