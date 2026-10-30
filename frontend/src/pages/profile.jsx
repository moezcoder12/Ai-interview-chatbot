import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch user profile')
      }

      setUser(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen w-full bg-purple-200 pt-28 flex justify-center items-center'>
        <p className='text-xl font-bold text-gray-800'>Loading Profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen w-full bg-purple-200 pt-28 flex justify-center items-center'>
        <p className='text-red-600 font-bold bg-red-100 p-4 rounded-xl'>{error}</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen w-full bg-purple-200 pt-28 px-4 flex justify-center'>
      <div className='w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-6 h-fit'>
        <img 
          className='w-28 h-28 rounded-full border-4 border-blue-500 object-cover' 
          src="/profile.png" 
          alt="User Profile" 
        />

        <h1 className='text-2xl font-bold text-gray-800'>{user?.name}</h1>

        <div className='w-full flex flex-col gap-4 text-gray-700 border-t pt-4'>
          <div className='flex justify-between border-b pb-2'>
            <span className='font-semibold'>User ID:</span>
            <span>{user?.id}</span>
          </div>

          <div className='flex justify-between border-b pb-2'>
            <span className='font-semibold'>Email:</span>
            <span>{user?.email}</span>
          </div>

          <div className='flex justify-between border-b pb-2'>
            <span className='font-semibold'>Date of Birth:</span>
            <span>{user?.date_of_birth || 'N/A'}</span>
          </div>

          <div className='flex justify-between border-b pb-2'>
            <span className='font-semibold'>Role:</span>
            <span className='capitalize font-bold text-blue-600'>{user?.role || 'Candidate'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile