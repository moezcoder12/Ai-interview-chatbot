import React from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import History from './pages/History'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/profile'
import Interview from './pages/Interview'
import Result from './pages/Result'
import AdminDashboard from './pages/AdminDashboard'
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
        <Route path='/interview' element={<Interview/>}/>
        <Route path='/result' element={<Result/>}/>
        <Route path='/admin' element={<AdminDashboard/>}/>
      </Routes>
    </div>
  )
}

export default App