import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
  const navigate = useNavigate()

  // Input states
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Input handler
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed! Check your credentials.')
      }

      // JWT Token aur User Details ko localStorage mein save karein
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user_id', data.user_id)
      localStorage.setItem('user_name', data.name)

      // Home page par redirect karein
      navigate('/')
    } catch (err) {
      setError(err.message || 'Server error, please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen w-full mt-20'>
      <div className='relative'>
        <img 
          className='h-screen w-full object-cover inset-0 relative' 
          src="https://plus.unsplash.com/premium_photo-1661964003610-2422de390fec?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" 
          alt="" 
        />
      </div>

      <form 
        onSubmit={handleSubmit}
        className='top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-10 w-full max-w-md rounded-2xl p-8 bg-black/40 backdrop-blur-sm absolute text-white'
      >
        <div className='flex flex-col justify-center items-center gap-6'>
          <h1 className='font-bold text-white text-3xl'>Login</h1>

          {error && <p className='text-red-400 text-sm font-semibold text-center'>{error}</p>}

          <input 
            className='flex text-white border-white focus:outline-none border p-2 rounded-3xl w-full' 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder='Enter email' 
            required
          />

          <input 
            className='flex text-white border-white focus:outline-none border p-2 rounded-3xl w-full' 
            type="password" 
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder='Password' 
            required
          />

          <button 
            type="submit"
            disabled={loading}
            className='cursor-pointer bg-blue-900 hover:bg-blue-800 disabled:bg-gray-600 p-2 text-xl rounded-3xl py-2 px-12 transition'
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className='flex gap-2 text-sm mt-2'>
            <span>Don't have an account?</span>
            <Link to='/signup' className='text-blue-400 cursor-pointer underline'>Signup</Link>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Login