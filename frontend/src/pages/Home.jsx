import React from 'react'

const Home = () => {
  return (
    <div className='min-h-screen w-full bg-purple-200'>

      <div className='mx-auto max-w-4xl px-6 pt-16'>

        <h1 className='text-center text-4xl font-bold text-black'>
          Welcome to TrueSpoken AI!
        </h1>

        <p className='mt-6 text-center text-lg font-semibold leading-8 text-gray-800'>
          Your personal partner on the journey to interview success! Whether
          you're preparing for your first job interview or looking to advance
          your career, we're here to help you build confidence and sharpen your
          communication skills. Practice real-world interview questions,
          challenge yourself with AI-powered interviews, and receive intelligent
          feedback to understand your strengths and improve your weaknesses.
          Every practice session brings you one step closer to becoming a better
          communicator and a more confident candidate. Take the first step
          today, prepare smarter, speak confidently, and turn your interview
          goals into reality with TrueSpoken AI!
        </p>

      </div>
        <img className='ml-120 mt-0 h-30 w-100' src="ticker.png" alt="" />
        <button className='ml-158 bg-blue-500 cursor-pointer active:bg-blue-300 hover:bg-blue-400 rounded p-2'>Start Interview</button>

    </div>
  )
}

export default Home