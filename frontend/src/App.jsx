import { useState } from 'react'
import './App.css'
import FileUpload from './pages/FileUpload'

function App() {

  const handleFileSelect = (file) => {
    console.log("Selected file: ", file.name);
  };

  return (
    <div className='absolute top-0 left-0'>
      <FileUpload onFileSelect={handleFileSelect}/>
    </div>
  )
}

export default App
