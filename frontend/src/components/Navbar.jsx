import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <div className='fixed top-0 left-0 z-50 flex justify-between items-center h-20 w-full  bg-black/30 border-b border-white/30 shadow-lg backdrop-blur-sm'>
      <img
      className='flex w-44 ml-5'
      src="/truespokenlogo.png" 
      alt="" />
      <div className='flex gap-8 items-center mr-4'>
        <Link to='/' className='cursor-pointer rounded-3xl hover:bg-blue-500 active:bg-blue-300 bg-blue-400 px-4 py-2 transition'>
          Home
        </Link>
        <Link to='/history' className='cursor-pointer rounded-3xl hover:bg-blue-500 active:bg-blue-300 bg-blue-400 px-4 py-2 transition'>
          History
        </Link>
        <Link to='/login' className='cursor-pointer rounded-3xl hover:bg-blue-500 active:bg-blue-300 bg-blue-400 px-4 py-2 transition'>
          Login
        </Link>
        <Link to='/signup' className='cursor-pointer rounded-3xl hover:bg-blue-400 active:bg-blue-300 bg-white px-4 py-2 transition'>
          Sign UP
        </Link>
        <Link to='/profile' className='cursor-pointer'>
          <img className='h-10 w-10 rounded-full object-cover' src="/profile.png" alt="" />
        </Link>
      </div>
    </div>
  )
}

export default Navbar
