import React from 'react'

const Interview = () => {
  return (
    <div className='min-h-screen w-full mt-0 bg-purple-200'>
      <div className='flex justify-center items-center flex-col mt-20'>
        <h2 className='w-full max-w-3xl text-xl font-bold min-h-40 bg-cyan-600 text-gray-800 p-4 rounded-2xl mt-12'>
          <h3 className='flex items-center justify-center font-extrabold text-black'>Question 1/10</h3>
      Hello guys kase ho ap sab log
      </h2>
      <textarea className='w-full mt-2 border resize-none text-gray-800 border-black max-w-3xl rounded-4xl focus:outline-none p-4' name="answer_input" id="answer" rows={1} placeholder='Enter your answer'>
      </textarea>
      </div>
      <div className='flex justify-center mt-4'>
        <button className='bg-blue-400 cursor-pointer hover:bg-blue-500 active:bg-blue-300 px-4 py-2 rounded-lg'>Submit Answer</button>
      </div>
      
    </div>
  )
}

export default Interview
