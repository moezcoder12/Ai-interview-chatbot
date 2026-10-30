import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Signup = () => {
  const navigate = useNavigate()

  // Form input states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    date_of_birth: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Input change handler
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    try {
      const response = await fetch('http://127.0.0.1:8000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          date_of_birth: formData.date_of_birth
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Signup failed! Please try again.')
      }

      if (data.message === 'Email already exists.') {
        setError('Ye email pehle se registered hai.')
      } else {
        setSuccessMsg('Account successfully ban gaya! Redirection to Login...')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (err) {
      setError(err.message || 'Server connection error.')
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
        <div className='flex flex-col justify-center items-center gap-5'>
          <h1 className='font-bold text-white text-3xl'>SignUp</h1>

          {error && <p className='text-red-400 text-sm font-semibold'>{error}</p>}
          {successMsg && <p className='text-green-400 text-sm font-semibold'>{successMsg}</p>}

          <input 
            className='flex text-white border-white focus:outline-none border p-2 rounded-3xl w-full' 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder='Enter Full Name' 
            required
          />

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
            placeholder='Set Password' 
            required
          />

          <input 
            className='flex text-white border-white focus:outline-none border p-2 rounded-3xl w-full' 
            type="date" 
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            required
          />

          <button 
            type="submit"
            disabled={loading}
            className='cursor-pointer bg-blue-900 hover:bg-blue-800 disabled:bg-gray-600 p-2 text-xl rounded-3xl py-2 px-12 transition'
          >
            {loading ? 'Creating...' : 'SignUp'}
          </button>

          <div className='flex gap-2 text-sm mt-2'>
            <span>Already have an account?</span>
            <Link to='/login' className='text-blue-400 cursor-pointer underline'>Login</Link>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Signup