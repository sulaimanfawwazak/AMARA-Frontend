import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { BsFileEarmarkCheck } from 'react-icons/bs';
import { FaCode, FaGithub, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Landing({ onFileSelect }) {
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
    '/ugm-background.png',
    '/class-3d-4.png',
    '/exam-3d-4.png'
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
      // const backendUrl = import.meta.env.VITE_APP_MODE === "PROD"
        // ? import.meta.env.VITE_BACKEND_URL_PROD 
        // : "http://localhost:5000";

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
      const response = await fetch(`${backendUrl}/exam-schedule-upload`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const exams = await response.json();
      console.log(exams);
      
      // Small delay to show 100% completion
      setTimeout(() => {
        navigate('/exam-list', { state: { exams: exams.jadwal } })
      }, 500);

      // Redirect to `/exam`
      // navigate('/exam-list', { state: { exams: exams.jadwal } })
    }
    catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
      setUploadProgress(0);
      alert("Upload failed. Please try again");
    }
  };

  const handleClassSchedule = () => navigate('/class-schedule');
  const handleExamSchedule = () => navigate('/exam-schedule');

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
  )

  // Show loading screen until images are loaded
  if (!imagesLoaded) {
    return <LoadingScreen/>;
  }

  return (
    <div 
      className='flex flex-col items-center justify-center w-screen min-h-screen px-6 py-6 bg-center bg-cover'
      style={{
        backgroundImage: "url('/grainy-background.png')",
        // backgroundImage: "url('/ugm-background.png')",
        // backgroundImage: "url('/grainy-background-2.png')",
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
      {/* Top */}
      <div className='flex flex-col items-center justify-center mt-12'>
        {/* Title */}
        <h1 className='text-4xl font-bold text-center text-white font-inter'>
          Halo, Sobat UGM!
        </h1>

        {/* Description */}
        <p className='w-3/4 mt-4 text-xl text-center text-white'>Ga perlu repot masukin jadwal satu-satu ke Google Calendar lagi! Tinggal 
          <span className='font-bold'> upload ⬆️</span>, 
          <span className='font-bold'> klik 👆</span>, 
          dan <span className='font-bold'>jadi! ✅</span>
        </p>

        {/* Steps Card */}
        <div className='px-8 mt-8 md:mt-12'>
          {/* Horizontal Line */}
          <div className='w-3/4 mx-auto border border-white md:w-1/2'></div>
          {/* Sub Title */}
          <h1 className='mt-8 text-xl font-bold text-center text-white md:mt-12'>Gimana Caranya?</h1>
          
          <div className='grid flex-row grid-cols-1 mt-4 gap-y-4 sm:gap-y-0 sm:grid-cols-5 gap-x-4'>
            {/* Step 1 */}
            <div className='flex flex-col items-center justify-between px-2 py-4 rounded-md bg-white/20 gap-y-2'>
              <h1 className='w-8 h-8 p-1 text-center bg-blue-400 rounded-full'>1</h1>
              <p className='text-center text-white'>Download jadwal kamu di SIMASTER</p>
              <img src='/download-3d-1.png' className='w-24 md:w-32'/>
            </div>

            {/* Step 2 */}
            <div className='flex flex-col items-center justify-between px-2 py-4 rounded-md bg-white/20 gap-y-2'>
              <h1 className='w-8 h-8 p-1 text-center bg-blue-400 rounded-full'>2</h1>
              <p className='text-center text-white'>Pilih mau masukin jadwal kelas/ujian</p>
              <img src='/pick-3d.png' className='w-24 md:w-32'/>
            </div>

            {/* Step 3 */}
            <div className='flex flex-col items-center justify-between px-2 py-4 rounded-md bg-white/20 gap-y-2'>
              <h1 className='w-8 h-8 p-1 text-center bg-blue-400 rounded-full'>3</h1>
              <p className='text-center text-white'>Upload jadwal kamu</p>
              <img src='/upload-3d.png' className='w-24 md:w-32'/>
            </div>

            {/* Step 4 */}
            <div className='flex flex-col items-center justify-between px-2 py-4 rounded-md bg-white/20 gap-y-2'>
              <h1 className='w-8 h-8 p-1 text-center bg-blue-400 rounded-full'>4</h1>
              <p className='text-center text-white'>Edit dan sesuaikan jadwalnya</p>
              <img src='/edit-3d.png' className='w-24 md:w-32'/>
            </div>

            {/* Step 5 */}
            <div className='flex flex-col items-center justify-between px-2 py-4 rounded-md bg-white/20 gap-y-2'>
              <h1 className='w-8 h-8 p-1 text-center bg-blue-400 rounded-full'>5</h1>
              <p className='text-center text-white'>Jadwal kamu siap dimasukin ke Google Calendar</p>
              <img src='/calendar-3d.png' className='w-24 md:w-32'/>
            </div>
          </div>
        </div>        
      </div>

      {/* Bottom */}
      <div className='w-full mt-8 md:mt-12'>
        {/* Horizontal Line */}
        <div className='w-3/4 mx-auto border border-white md:w-1/2'></div>
        {/* Sub TItle */}
        <h1 className='mt-8 text-xl font-bold text-center text-white md:mt-12'>Pilih Jadwal</h1>

        {/* Options */}
        <div className='flex flex-col justify-center h-full mt-4 gap-x-4 gap-y-4 md:gap-y-0 md:flex-row'>
          {/* Class Schedule Card */}
          <div 
            className='flex flex-col items-center justify-between max-w-lg px-24 py-4 space-y-4 transition rounded-lg cursor-pointer hover:-translate-y-2 bg-gradient-to-tr from-pink-100 to-blue-200 hover:from-pink-200 hover:to-blue-300'
            onClick={handleClassSchedule}
          >
            <h2 className='text-xl font-semibold text-center text-white md:text-2xl font-inter'>Jadwal Kelas</h2>
            <img src='/class-3d-4.png' className='w-52 md:w-60'/>
          </div>
        
          {/* Exam Schedule Card */}
          <div
            className='flex flex-col items-center justify-between max-w-lg px-24 py-4 space-y-4 transition rounded-lg cursor-pointer hover:-translate-y-2 bg-gradient-to-tr from-pink-100 to-blue-200 hover:from-pink-200 hover:to-blue-300'
            onClick={handleExamSchedule}
          >
            <h2 className='text-xl font-semibold text-center text-white md:text-2xl font-inter'>Jadwal Ujian</h2>
            <img src='/exam-3d-4.png' className='w-52 md:w-60'/>
          </div>
        </div>
      </div>

      {/* Left */}
      <div className='flex flex-col items-center justify-center w-full h-full gap-8 px-4 mt-12 md:w-2/3'>
        {/* Horizontal Line */}

        {/* Footer */}
        <div className='hidden space-y-1 md:block'>
          {/* UGM Logo */}
          <div className='flex items-center justify-center mt-4 gap-x-4'>
            {/* <img className='w-24 md:w-32' src='/schedule-3d.png' alt='schedule-3d'/> */}
            <img className='w-24 md:w-32' src='/logo-ugm-putih.png' alt='schedule-3d'/>
            <img className='w-24 md:w-32' src='/exam-3d-2.png' alt='exam-3d-2'/>
          </div>

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
      
      {/* Footer */}
      <div className='block space-y-1 md:hidden'>
      {/* UGM Logo */}
        <div className='flex items-center justify-center mt-4 mb-4 gap-x-4'>
          {/* <img className='w-24 md:w-32' src='/schedule-3d.png' alt='schedule-3d'/> */}
          <img className='w-24 md:w-32' src='/logo-ugm-putih.png' alt='schedule-3d'/>
          <img className='w-24 md:w-32' src='/exam-3d-2.png' alt='exam-3d-2'/>
        </div>

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

export default Landing;