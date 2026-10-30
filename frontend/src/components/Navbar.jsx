import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const [role, setRole] = useState('')

  useEffect(() => {
    if (token) {
      fetchUserRole()
    } else {
      setRole('')
    }
  }, [token])

  const fetchUserRole = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        setRole(data.role)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_name')
    setRole('')
    navigate('/login')
  }

  return (
    <div className='fixed top-0 left-0 z-50 flex justify-between items-center h-20 w-full bg-black/30 border-b border-white/30 shadow-lg backdrop-blur-sm px-6'>
      <Link to='/'>
        <img className='w-44' src="/truespokenlogo.png" alt="TrueSpoken Logo" />
      </Link>

      <div className='flex gap-6 items-center'>
        <Link to='/' className='rounded-3xl hover:bg-blue-500 active:bg-blue-300 bg-blue-400 px-4 py-2 transition text-white font-medium'>
          Home
        </Link>

        {token && (
          <Link to='/history' className='rounded-3xl hover:bg-blue-500 active:bg-blue-300 bg-blue-400 px-4 py-2 transition text-white font-medium'>
            History
          </Link>
        )}

        {/* Admin Link if role is admin */}
        {token && role === 'admin' && (
          <Link to='/admin' className='rounded-3xl hover:bg-red-700 bg-red-600 px-4 py-2 transition text-white font-bold'>
            Admin Panel
          </Link>
        )}

        {!token ? (
          <>
            <Link to='/login' className='rounded-3xl hover:bg-blue-500 active:bg-blue-300 bg-blue-400 px-4 py-2 transition text-white font-medium'>
              Login
            </Link>
            <Link to='/signup' className='rounded-3xl hover:bg-blue-400 active:bg-blue-300 bg-white px-4 py-2 transition text-gray-900 font-medium'>
              Sign UP
            </Link>
          </>
        ) : (
          <>
            <Link to='/profile' className='cursor-pointer'>
              <img className='h-10 w-10 rounded-full object-cover border-2 border-blue-400' src="/profile.png" alt="Profile" />
            </Link>
            <button 
              onClick={handleLogout}
              className='rounded-3xl bg-red-500 hover:bg-red-600 px-4 py-2 text-white font-medium transition cursor-pointer'
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default Navbar