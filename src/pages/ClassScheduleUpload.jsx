import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { BsFileEarmarkCheck } from 'react-icons/bs';
import { FaCode, FaGithub, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function ClassScheduleUpload({ onFileSelect }) {
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const navigate = useNavigate();

  // List of all images that need to be preloaded
  const imagesToPreload = [
    '/grainy-background.png',
    '/logo-ugm-putih.png',
    '/exam-3d-2.png',
    '/file-upload-blue.png',
    '/ugm-background.png'
  ];

  // Preload images on component mount
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = imagesToPreload.map((src, index) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            setLoadingProgress(prev => prev + (100 / imagesToPreload.length));
            resolve(src);
          };
          img.onerror = () => {
            console.warn(`Failed to load image: ${src}`);
            setLoadingProgress(prev => prev + (100 / imagesToPreload.length));
            resolve(src);
          };
          img.src = src;
        });
      });
      
      try {
        await Promise.all(imagePromises);
        // Small dealy to ensure smooth transition
        setTimeout(() => {
          setImagesLoaded(true);
        }, 100);
      }
      catch (error) {
        console.error('Error preloading images:', error);
        setImagesLoaded(true);
      }
    };

    preloadImages();
  }, []);

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
    if (!selectedFile || isUploading) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('file', selectedFile); // Attach the file

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL_PROD || "http://localhost:5000";
      console.log(backendUrl);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
        
      // const response = await fetch(`http://localhost:5000/upload`, {
      const response = await fetch(`${backendUrl}/class-schedule-upload`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const classes = await response.json();
      console.log(classes);
      
      // Small delay to show 100% completion
      setTimeout(() => {
        navigate('/class-list', { state: { classes: classes.schedule } })
      }, 500);
    }
    catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
      setUploadProgress(0);
      alert("Upload failed. Please try again");
    }
  };

  // Loading screen component
  const LoadingScreen = () => (
    <div className='flex flex-col items-center justify-center w-screen min-h-screen bg-gradient-to-b from-blue-300 to-pink-200'>
      <div className='space-y-6 text-center'>
        <div className='w-16 h-16 mx-auto border-4 border-white rounded-full border-t-transparent animate-spin'></div>
        <h2 className='text-2xl font-bold text-white font-inter'>Loading...</h2>
        <div className='flex items-center justify-center w-64 h-2 bg-gray-200 rounded-full'>
          <div 
            className='h-2 transition-all duration-300 ease-out bg-blue-500 rounded-full'
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>
        <p className='text-white opacity-75'>{Math.round(loadingProgress)}%</p>
      </div>
    </div>
  );

  const Loading = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-blue-400 to-pink-300">
      <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg">
        <div className="w-10 h-10 mb-4 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        <p className="text-lg font-semibold text-blue-600 font-inter">Loading</p>
      </div>
    </div>
  );

  // Show loading screen until images are loaded
  if (!imagesLoaded) {
    // return <LoadingScreen/>;
    return <Loading/>;
  }

  return (
    <div 
      className='flex flex-col items-center justify-center w-screen min-h-screen px-6 py-6 space-y-6 bg-center bg-cover md:flex-row'
      style={{
        backgroundImage: "url('/grainy-background.png')",
        animation: 'fadeIn 0.5s ease-in-out forwards'
      }}
    >
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out forwards;
        }
      `}</style>

      {/* Left */}
      <div className='flex flex-col items-center justify-center w-full h-full gap-8 px-4 md:w-2/3'>
        <div className='w-3/4 space-y-4'>
          <h1 className='text-4xl font-bold text-center text-white font-inter'>
            UGM <span className='text-transparent bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text'>Class Schedule</span> to Google Calendar Converter
          </h1>
          <p className='text-xl text-center text-white'>
            Ga perlu repot masukin jadwal kelasmu satu-satu ke Google Calendar lagi! Tinggal
            <span className='font-bold'> upload ⬆️</span>, 
            <span className='font-bold'> klik 👆</span>, 
            dan <span className='font-bold'>jadi! ✅</span>
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
            <a href='https://www.linkedin.com/in/sfawwazak/'>
              <FaLinkedinIn className='transition cursor-pointer hover:text-blue-700'/>
            </a>
            <a href='https://sfawwaz-web.vercel.app/'>
              <FaCode className='transition cursor-pointer hover:text-blue-700'/>
            </a>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className='flex items-center justify-center w-full h-full md:w-1/3'>
        <div className='flex flex-col items-center justify-center w-full max-w-md px-6 py-10 space-y-4 rounded-lg bg-gradient-to-tr from-pink-100 to-blue-200'>
        {/* <div className='flex flex-col items-center justify-center w-full max-w-md px-6 py-10 space-y-4 border rounded-lg backdrop-filter backdrop-blur-md border-white/30 bg-white/20'> */}
          <h2 className='text-2xl font-semibold text-center text-white md:text-2xl font-inter'>Upload Jadwal Kelas Kamu</h2>

          {/* Dropzone area */}
          <div
            {...getRootProps()}
            className={`w-full p-4 border-2 border-dashed rounded-md transition cursor-pointer hover:bg-white/70 flex flex-col items-center justify-center gap-4 ${
              isDragActive ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-white/30'
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
              <div className='flex flex-col items-center gap-2 w-52'>
                <BsFileEarmarkCheck className='text-5xl text-blue-500'/>
                <p className='w-full px-4 text-center text-gray-700 truncate'>
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
                className={`w-full px-4 py-2 text-white bg-blue-500 rounded-md sm:w-auto ${
                  isUploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-400'
                }`}
                onClick={handleContinue}
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className='flex flex-col items-center justify-center'>
                    <div className='w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin'></div>
                    <span className='text-center'>Uploading...</span>
                  </div>
                ) : (
                  'Continue'
                )}
                {/* Continue */}
              </button>
              
              {/* Cancel */}
              <button
                className={`w-full px-4 py-2 transition border rounded-md sm:w-auto ${
                  isUploading
                    ? 'text-gray-400 border-gray-400 cursor-not-allowed'
                    : 'text-blue-500 border-blue-500 hover:bg-red-500 hover:border-red-500 hover:text-white'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isUploading) {
                    setSelectedFile(null);
                    setFileName('');
                  }
                }}
                disabled={isUploading}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className='w-full space-y-2'>
              <div className='w-full h-2 bg-gray-200 rounded-full'>
                <div 
                  className='h-2 transition-all duration-300 ease-out bg-blue-500 rounded-full'
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className='text-sm text-center text-gray-600'>
                {Math.round(uploadProgress)}% uploaded
              </p>
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
            <a href='https://www.linkedin.com/in/sfawwazak/'>
              <FaLinkedinIn className='transition cursor-pointer hover:text-blue-700'/>
            </a>
            <a href='https://sfawwaz-web.vercel.app/'>
              <FaCode className='transition cursor-pointer hover:text-blue-700'/>
            </a>
          </div>
      </div>
    </div>
  );
}

export default ClassScheduleUpload;