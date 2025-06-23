import { useState } from 'react'
import './App.css'
import ExamScheduleUpload from './pages/ExamScheduleUpload'

function App() {

  const handleFileSelect = (file) => {
    console.log("Selected file: ", file.name);
  };

  return (
    <div className='absolute top-0 left-0'>
      <ExamScheduleUpload onFileSelect={handleFileSelect}/>
    </div>
  )
}

export default App
