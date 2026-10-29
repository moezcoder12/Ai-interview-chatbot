import React from 'react'
import { Link } from 'react-router-dom'

const Login = () => {
  return (
    <div className='min-h-screen w-full mt-20'>
      <div className='relative'>
         <img className='h-screen w-full object-cover inset-0 relative' src="https://plus.unsplash.com/premium_photo-1661964003610-2422de390fec?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D" alt="" />
      </div>
      <form className='top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-120 mt-10 w-full max-w-md rounded-2xl p-10 bg-black/30 backdrop-blur-sm absolute' action="">
        <h1 className='flex justify-center items-center font-bold text-gray-950 text-3xl'>Login</h1>
        <input className='flex justify-center border-black focus:outline-none border-1 p-2 rounded-3xl mt-15 w-full' type="email" placeholder='Enter email' />
        <input className='flex justify-center focus:outline-none border-black  border-1 p-2 rounded-3xl mt-15 w-full' type="password" placeholder='Password' />
        <button className='flex cursor-pointer items-center mt-15 ml-25 bg-blue-900 hover:bg-blue-800 p-2 text-xl rounded-3xl py-2 px-12'>Login</button>
        <div className='mt-10 flex gap-3'>
           <h3>Don't have an account.</h3>
           <Link to='/signup' className='text-blue-500 cursor-pointer underline'>Signup</Link>
        </div>
      </form>
      <div>
      </div>

      
    </div>
  )
}

export default Login
