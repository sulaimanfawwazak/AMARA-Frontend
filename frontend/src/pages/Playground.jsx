import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { BsFileEarmarkCheck } from 'react-icons/bs';
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
      const response = await fetch('http://localhost:5000/upload', {
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
      className='flex flex-row w-screen h-screen px-8 py-4 bg-center bg-cover'
      style={{backgroundImage: "url('/grainy-background.png')"}}
    >
      {/* Left */}
      <div className='flex flex-col items-center justify-center w-2/3 h-full gap-8 p-4'>
        <div className='w-3/4 space-y-4'>
          <h1 className='text-5xl font-bold text-center text-white font-inter'>
            Exam Schedule to Google Calendar
          </h1>
          <p className='text-xl text-center text-white'>
            Keep your exam schedule organized! No more manually inserting your schedule into Google Calendar, use this to automatically integrate you exam with Google Calendar!
          </p>
        </div>
        <div className='flex flex-row items-center justify-center'>
          <img className='w-1/4' src='/schedule-3d.png' width={100} alt='schedule-3d'/>
          <img className='w-1/4' src='/exam-3d-2.png' width={100} alt='exam-3d-2'/>
        </div>
      </div>

      {/* Right */}
      <div className='flex items-center justify-center w-1/3 h-full py-28'>
        <div className='flex flex-col items-center justify-center px-8 py-12 space-y-4 rounded-lg bg-gradient-to-tr from-pink-100 to-blue-200'>
          <h2 className='text-3xl font-semibold font-inter'>Upload Your Schedule</h2>

          {/* Dropzone area */}
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center gap-4 p-4 border-2 border-dashed rounded-md hover:cursor-pointer hover:bg-blue-100 transition ${
              isDragActive ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'
            }`}
          >
            <input {...getInputProps()} />
            {!fileName ? (
              <>
                <img 
                  src='/file-upload-blue.png' 
                  alt='upload-file-icon' 
                  width={130}
                  className={`transition-opacity ${isDragActive ? 'opacity-60' : 'opacity-100'}`}
                />
                {isDragActive ? (
                  <p className='text-xl text-center text-green-600'>Drop the PDF here!</p>
                ) : (
                  <p className='text-xl text-center text-gray-700'>Click to upload or drag your file here</p>
                )}
              </>
            ) : (
              <div className='flex flex-col items-center gap-2'>
                <BsFileEarmarkCheck className='text-6xl text-blue-500'/>
                <p className='w-56 text-gray-700 truncate'>
                  Selected: <span className='font-bold'>{fileName}</span>
                </p>
              </div>
            )}
          </div>

          {/* Continue Button */}
          {fileName && (
            <div className='flex flex-row justify-start w-full gap-x-4'>
              <button 
                className='px-2 py-3 text-white bg-blue-500 rounded-md hover:bg-blue-400'
                onClick={handleContinue}
              >

                Continue
              </button>
              
              <button
                className='px-2 py-3 text-blue-500 transition border border-blue-500 rounded-md hover:bg-red-500 hover:border-red-500 hover:text-white'
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
    </div>
  );
}

export default FileUpload;