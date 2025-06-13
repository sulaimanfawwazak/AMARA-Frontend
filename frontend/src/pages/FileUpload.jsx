import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { BsFileEarmarkCheck } from 'react-icons/bs';

function FileUpload({ onFileSelect }) {
  const [fileName, setFileName] = useState('');

  // Configure dropzone
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles[0]) {
      setFileName(acceptedFiles[0].name);
      onFileSelect(acceptedFiles[0]);
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
    const formData = new FormData();
    formData.append('file', fileName); // Attach the file

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      const exams = await response.json();
      console.log(exams);
    }
    catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center w-screen h-screen gap-24 bg-blue-500'>
      <h1 className='text-4xl font-bold text-center text-white font-geist'>
        Exam Schedule to Google Calendar
      </h1>

      {/* Upload card */}
      <div className='flex flex-col items-center justify-center gap-6 px-8 py-6 bg-gray-100 border rounded-md w-96'>
        <h2 className='text-xl font-semibold text-center font-geist'>
          Upload Your Schedule
        </h2>
        
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
                width={100}
                className={`transition-opacity ${isDragActive ? 'opacity-60' : 'opacity-100'}`}
              />
              {isDragActive ? (
                <p className='text-green-600'>Drop the PDF here!</p>
              ) : (
                <p className='text-gray-700'>Click to upload or drag your file here</p>
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
              onClick={handleContinue()}
            >

              Continue
            </button>
            
            <button
              className='px-2 py-3 text-blue-500 transition border border-blue-500 rounded-md hover:bg-red-500 hover:border-red-500 hover:text-white'
              onClick={(e) => {
                e.stopPropagation();
                setFileName('');
              }}
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;