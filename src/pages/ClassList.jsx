// frontend/src/pages/ClassList.jsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_API_KEY;
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

const START_DATE = '2025-08-18';
const TIMEZONE = 'Asia/Jakarta';

function ClassList() {
  const location = useLocation();
  const classes = location.state?.classes;
  const navigate = useNavigate();

  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [tokenClient, setTokenClient] = useState(null);
  const [bgLoaded, setBgLoaded] = useState(false);
  // const [loadingProgress, setLoadingProgress] = useState(0);
  

  const backgroundUrl = '/background-variation-2.png';

  // Load background image
  useEffect(() => {
    const img = new Image();
    img.src = backgroundUrl;
    // img.onload = () => {
      // setTimeout(() => {
        // setBgLoaded(true)
      // }, 2000);
    // };
    img.onload = () => setBgLoaded(true);
  }, []);

  // Load Google API (GAPI)
  useEffect(() => {
    const scriptGAPI = document.createElement('script');
    scriptGAPI.src = 'https://apis.google.com/js/api.js';
    scriptGAPI.async = true;
    scriptGAPI.defer = true;
    scriptGAPI.onload = () => {
      window.gapi.load('client', async () => {
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        setGapiLoaded(true);
      });
    };
    document.body.appendChild(scriptGAPI);

    const scriptGIS = document.createElement('script');
    scriptGIS.src = 'https://accounts.google.com/gsi/client';
    scriptGIS.async = true;
    scriptGIS.defer = true;
    scriptGIS.onload = () => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // Set later
      });
      setTokenClient(client);
      setGisLoaded(true);
    };
    document.body.appendChild(scriptGIS);

    return () => {
      document.body.removeChild(scriptGAPI);
      document.body.removeChild(scriptGIS);
    };
  }, []);

  function getDayFromWeekday(weekday) {
    const map = {
      'Sunday': 'SU',
      'Monday': 'MO',
      'Tuesday': 'TU',
      'Wednesday': 'WE',
      'Thursday': 'TH',
      'Friday': 'FR',
      'Saturday': 'SA'
    };

    return map[weekday];
  }

  const addToCalendar = () => {
    if (!gapiLoaded || !gisLoaded || !tokenClient) {
      alert("Google API not fully loaded yet. Please try again");
      return
    }

    tokenClient.callback = async (resp) => {
      if (resp.error) {
        console.error(resp);
        alert("Authorization failed");
        return;
      }

      try {
        for (const jadwal of classes) {
          const mataKuliah              = jadwal.mata_kuliah;
          const kelas                   = jadwal.kelas;
          const hari                    = getDayFromWeekday(jadwal.hari);
          let startDate                 = null; // Initialize the startDate
          if (hari === 'MO') {
            startDate = '2025-08-18';
          }
          else if (hari === 'TU') {
            startDate = '2025-08-19';
          }
          else if (hari === 'WE') {
            startDate = '2025-08-20';
          }
          else if (hari === 'TH') {
            startDate = '2025-08-21';
          }
          else if (hari === 'FR') {
            startDate = '2025-08-22';
          }
          else if (hari === 'SA') {
            startDate = '2025-08-23';
          }
          else if (hari === 'SU') {
            startDate = '2025-08-24';
          }

          const [startTime, endTime]    = jadwal.jam.split("-");
          // const date = jadwal.tanggal.split("-").reverse().join("-"); // Convert dd-mm-yyyy → yyyy-mm-dd
          const ruangan                 = jadwal.ruangan;

          // const startDateTime = `${date}T${startTime}:00+07:00`;
          const startDateTime = `${startDate}T${startTime}:00+07:00`;
          // const endDateTime = `${date}T${endTime}:00+07:00`;
          const endDateTime = `${startDate}T${endTime}:00+07:00`;

          // console.log(`date: ${date}`);
          // console.log(`startDateTime: ${startDateTime}`);
          // console.log(`endDateTime: ${endDateTime}`);

          const event = {
            summary: `${mataKuliah} ${kelas}`, // e.g Pancasila PPN19
            location: `${ruangan}`,
            start: {
              // dateTime: `${exam.tanggal}T${exam.jam}`,
              dateTime: startDateTime,
              timeZone: "Asia/Jakarta",
            },
            end: {
              // dateTime: `${exam.tanggal}T${calculateEndTime(exam.jam)}`,
              dateTime: endDateTime,
              timeZone: "Asia/Jakarta",
            },
            recurrence: [
              `RRULE:FREQ=WEEKLY;BYDAY=${hari};COUNT=12;`
            ],
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'popup', minutes: 60 },
                { method: 'popup', minutes: 30 }
              ]
            }
          };

          await window.gapi.client.calendar.events.insert({
            calendarId: "primary",
            resource: event,
          });
        }
        alert("Events added to your Google Calendar!");
      }
      catch (err) {
        console.error("Error adding event:", err);
        alert("Failed to add some events. Please check console for details.");
      }
    };

    // Triger auth flow
    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: "consent" });
    }
    else {
      tokenClient.requestAccessToken({ prompt: "" });
    }
  };

  const handleCancel = () => navigate('/');

  // Loading screen component
  const LoadingScreen = () => (
    <div className='flex flex-col items-center justify-center w-screen min-h-screen bg-gradient-to-b from-blue-300 via-pink-50 to-pink-200'>
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

  if (!bgLoaded) {
    return (
      <div className="flex items-center justify-center w-full h-screen from-blue-300 to-pink-200 bg-gradient-to-b">
        <div className='p-4 space-y-4 rounded-lg animate-pulse'>
          <p className="text-4xl font-semibold text-white font-inter">Please Wait...</p>
          <div className='w-16 h-16 mx-auto border-4 border-white rounded-full border-t-transparent animate-spin'></div>
        </div>
      </div>
      // <LoadingScreen/>
    );
  }

  if (!classes) return (
    <p
      className='flex justify-center min-h-screen py-24 text-4xl font-bold text-center text-white bg-center font-inter'
      style={{ backgroundImage: "url('/error-background.png')" }}
    >
      No class schedule data found. Please upload a file first.
    </p>
  );
  
  if (!Array.isArray(classes)) return (
    <p
      className='flex items-center justify-center min-h-screen text-4xl font-bold text-center text-white font-inter'
      style={{ backgroundImage: "url('/error-background.png')" }}
    >
      Invalid data format. Please try uploading again. class_schedule is {typeof(classes)}
    </p>
  );

  return (
    <div
      className='flex flex-col items-center justify-center w-full min-h-screen px-4 py-8 bg-center bg-cover'
      style={{backgroundImage: "url('/background-variation-2.png')"}}
    >
      <div className="w-full max-w-3xl p-4 md:p-8">
        <h1 className="mb-6 text-3xl font-bold text-center text-white md:text-5xl font-inter">
          Jadwal Kuliah Kamu
        </h1>
        
        {/* Exams Container */}
        <div className='space-y-3'>
          {classes.map((jadwal, index) => (
            // Exam Card
            <div key={index} className='flex items-center gap-2 px-4 py-4 bg-white rounded-lg shadow-lg sm:flex-row sm:gap-4'>
              {/* Number */}
              <div className='w-1/12 text-center'>
                <h2 className='text-xl font-bold'>{index + 1}</h2>
              </div>

              {/* Rest of the data */}
              <div className='w-full sm:w-11/12'>
                <h2 className='text-lg font-bold font-inter'>{jadwal.mata_kuliah}</h2>
                {/* <p className='text-md font-inter'>📅 {exam.tanggal} • 🕗 {exam.jam} • 🏫{exam.ruangan} • #️⃣{exam.no_kursi}</p> */}
                <div className='grid grid-cols-2 mt-2'>
                  <div>
                    <p className='text-md font-inter'>📚 Kelas {jadwal.kelas}</p>
                    <p className='text-md font-inter'>📅 {jadwal.hari}</p>
                  </div>
                  <div>
                    <p className='text-md font-inter'>🕗 {jadwal.jam}</p>
                    <p className='text-md font-inter'>🏫 {jadwal.ruangan}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Buttons */}
          <div className='flex flex-col gap-3 mt-6 sm:flex-row sm:space-x-4 sm:gap-0'>
            
            {/* Add to Google Calendar */}
            <button
              className='px-4 py-3 font-bold text-white transition bg-blue-500 rounded-md hover:bg-blue-300 font-inter'
              onClick={addToCalendar}
            >
              Add to Google Calendar
            </button>

            {/* Cancel */}
            <button 
              className='px-4 py-3 font-bold text-blue-500 transition border border-blue-500 rounded-md hover:bg-red-500 hover:text-white hover:border-red-500 font-inter'
              onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
    
  );
}

export default ClassList;
