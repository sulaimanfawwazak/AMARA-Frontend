import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { BsFileEarmarkCheck } from 'react-icons/bs';
import { FaGithub, FaInstagram } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function FileUpload({ onFileSelect }) {
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  // Configure dropzone
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles[0]) {
      setFileName(acceptedFiles[0].name);
      setSelectedFile(acceptedFiles[0]);
      // onFileSelect?.(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'] // Only accept PDFs
    },
    maxFiles: 1, // Allow only one file
  });

  const handleContinue = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile); // Attach the file

    try {
      const backendUrl = import.meta.env.VITE_APP_MODE === "PROD"
        ? import.meta.env.VITE_BACKEND_URL_PROD 
        : "http://localhost:5000";
        
      const response = await fetch(`${backendUrl}/upload`, {
        method: 'POST',
        body: formData,
      });
      const exams = await response.json();
      console.log(exams);

      // Redirect to `/exam`
      navigate('/exam', { state: { exams: exams.jadwal } })
    }
    catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div 
      className='flex flex-col items-center justify-center w-screen min-h-screen px-6 py-6 space-y-6 bg-center bg-cover md:flex-row'
      style={{backgroundImage: "url('/grainy-background.png')"}}
    >
      {/* Left */}
      <div className='flex flex-col items-center justify-center w-full h-full gap-8 px-4 md:w-2/3'>
        <div className='w-3/4 space-y-4'>
          <h1 className='text-4xl font-bold text-center text-white font-inter'>
            UGM Exam Schedule to Google Calendar Converter
          </h1>
          <p className='text-xl text-center text-white'>
            No more manual entry! Sync your upcoming exam schedule to Google Calendar instantly!
          </p>
        </div>

        <div className='flex flex-wrap items-center justify-center gap-4'>
          {/* <img className='w-24 md:w-32' src='/schedule-3d.png' alt='schedule-3d'/> */}
          <img className='w-24 md:w-32' src='/logo-ugm-putih.png' alt='schedule-3d'/>
          <img className='w-24 md:w-32' src='/exam-3d-2.png' alt='exam-3d-2'/>
        </div>

        {/* Footer */}
        <div className='hidden space-y-1 md:block'>
          <p className='font-mono text-sm text-center'>Made with <span className='font-sans'>❤️</span> and <span className='font-sans'>☕</span> by <a className='font-mono text-blue-700 underline underline-offset-2' href="https://github.com/sulaimanfawwazak">pwnwas</a> </p>
          <p className='font-mono text-sm text-center'><a className='text-blue-700 underline' href='https://saweria.co/pwnwas'>Donate</a> buat mam di warmindo 💵😋</p>
          <div className='flex flex-row justify-center py-4 space-x-8'>
            <a href='https://github.com/sulaimanfawwazak'>
              <FaGithub className='transition cursor-pointer hover:text-blue-700'/>
            </a>
            <a href='https://instagram.com/sfawwazak'>
              <FaInstagram className='transition cursor-pointer hover:text-blue-700'/>
            </a>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className='flex items-center justify-center w-full h-full md:w-1/3'>
        <div className='flex flex-col items-center justify-center w-full max-w-md px-6 py-10 space-y-4 rounded-lg bg-gradient-to-tr from-pink-100 to-blue-200'>
          <h2 className='text-2xl font-semibold text-center text-white md:text-3xl font-inter'>Upload Your Schedule</h2>

          {/* Dropzone area */}
          <div
            {...getRootProps()}
            className={`w-full p-4 border-2 border-dashed rounded-md transition cursor-pointer hover:bg-blue-100 flex flex-col items-center justify-center gap-4 ${
              isDragActive ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'
            }`}
          >
            <input {...getInputProps()} />
            {!fileName ? (
              <>
                <img 
                  src='/file-upload-blue.png' 
                  alt='upload-file-icon' 
                  className={`w-24 transition-opacity ${isDragActive ? 'opacity-60' : 'opacity-100'}`}
                />
                {isDragActive ? (
                  <p className='text-center text-green-500 font-inter'>Drop the PDF here!</p>
                ) : (
                  <p className='text-center text-gray-700 font-inter'>Click to upload or drag your file here</p>
                )}
              </>
            ) : (
              <div className='flex flex-col items-center gap-2'>
                <BsFileEarmarkCheck className='text-5xl text-blue-500'/>
                <p className='w-56 text-center text-gray-700 truncate'>
                  Selected: <span className='font-bold'>{fileName}</span>
                </p>
              </div>
            )}
          </div>

          {/* Buttons */}
          {fileName && (
            <div className='flex flex-col w-full gap-4 sm:flex-row'>
              
              {/* Continue */}
              <button 
                className='w-full px-4 py-2 text-white bg-blue-500 rounded-md sm:w-auto hover:bg-blue-400'
                onClick={handleContinue}
              >
                Continue
              </button>
              
              {/* Cancel */}
              <button
                className='w-full px-4 py-2 text-blue-500 transition border border-blue-500 rounded-md sm:w-auto hover:bg-red-500 hover:border-red-500 hover:text-white'
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setFileName('');
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Footer */}
      <div className='block space-y-1 md:hidden'>
        <p className='font-mono text-sm text-center'>Made with <span className='font-sans'>❤️</span> and <span className='font-sans'>☕</span> by <a className='font-mono text-blue-700 underline underline-offset-2' href="https://github.com/sulaimanfawwazak">pwnwas</a> </p>
        <p className='font-mono text-sm text-center'><a className='text-blue-700 underline' href='https://saweria.co/pwnwas'>Donate</a> buat mam di warmindo 💵😋</p>
          <div className='flex flex-row justify-center py-4 space-x-8'>
            <a href='https://github.com/sulaimanfawwazak'>
              <FaGithub href='https://github.com/sulaimanfawwazak' className='transition cursor-pointer hover:text-blue-700'/>
            </a>
            <a href='https://instagram.com/sfawwazak'>
              <FaInstagram className='transition cursor-pointer hover:text-blue-700'/>
            </a>
          </div>
      </div>
    </div>
  );
}

export default FileUpload;