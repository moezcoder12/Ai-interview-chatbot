import React from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import History from './pages/History'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/profile'
import { Route, Routes } from "react-router-dom";

const App = () => {
  return (
    <div className='min-h-screen w-full'>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/history' element={<History/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/profile' element={<Profile/>}/>
      </Routes>
    </div>
  )
}

export default App
