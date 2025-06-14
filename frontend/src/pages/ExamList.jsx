// frontend/src/pages/ExamList.jsx
import { useEffect, useState } from 'react';
import { redirect, useLocation, useNavigate } from 'react-router-dom';

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_API_KEY;
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

function ExamList() {
  const location = useLocation();
  const exams = location.state?.exams;
  const navigate = useNavigate();

  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [tokenClient, setTokenClient] = useState(null);

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
        for (const exam of exams) {
          const [startTime, endTime] = exam.jam.split("-");
          const date = exam.tanggal.split("-").reverse().join("-"); // Convert dd-mm-yyyy → yyyy-mm-dd

          const startDateTime = `${date}T${startTime}:00+07:00`;
          const endDateTime = `${date}T${endTime}:00+07:00`;

          // console.log(`date: ${date}`);
          // console.log(`startDateTime: ${startDateTime}`);
          // console.log(`endDateTime: ${endDateTime}`);

          const event = {
            summary: exam.mata_kuliah,
            location: `${exam.ruangan}, ${exam.no_kursi}`,
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

  if (!exams) return (
    <p
      className='flex items-center justify-center min-h-screen text-4xl font-bold text-white font-inter'
      style={{ backgroundImage: "url('/error-background.png')" }}
    >
      No exam data found. Please upload a file first.
    </p>
  );
  
  if (!Array.isArray(exams)) return (
    <p
      className='flex items-center justify-center min-h-screen text-4xl font-bold text-white font-inter'
      style={{ backgroundImage: "url('/error-background.png')" }}
    >
      Invalid data format. Please try uploading again. exams is {typeof(exams)}
    </p>
  );

  return (
    <div
      className='flex flex-col items-center justify-center w-full min-h-screen px-4 py-8 bg-center bg-cover'
      style={{backgroundImage: "url('/background-variation-2.png')"}}
    >
      <div className="w-full max-w-3xl p-4 md:p-8">
        <h1 className="mb-6 text-3xl font-bold text-center text-white md:text-5xl font-inter">
          Your Exam Schedule
        </h1>
        
        {/* Exams Container */}
        <div className='space-y-3'>
          {exams.map((exam, index) => (
            // Exam Card
            <div key={index} className='flex items-center gap-2 px-4 py-4 bg-white rounded-lg shadow-lg sm:flex-row sm:gap-4'>
              {/* Number */}
              <div className='w-1/12 text-center'>
                <h2 className='text-xl font-bold'>{index + 1}</h2>
              </div>

              {/* Rest of the data */}
              <div className='w-full sm:w-11/12'>
                <h2 className='text-lg font-bold font-inter'>{exam.mata_kuliah}</h2>
                <p className='text-md font-inter'>{exam.tanggal} • {exam.jam} • {exam.ruangan} • {exam.no_kursi}</p>
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
              Add to Goole Calendar
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

export default ExamList;
