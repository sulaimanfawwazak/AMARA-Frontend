import React, { useEffect, useState } from 'react'

function GoogleCalendarButton({ exams }) {
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [tokenClient, setTokenClient] = useState(null);

  const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
  const SCOPES = "https://www.googleapis.com/auth/calendar.events";

  useEffect(() => {
    window.onload = () => {
      window.gapi.load("client", async () => {
        await window.gapi.client.init({
          apiKey: "",
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"]
        });
        setGapiLoaded(true);
      });

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
          window.gapi.client.setToken(tokenResponse);
          insertEvents();
      },
    });

    setTokenClient(client);
    };
  }, []);

  const insertEvents = async () => {
    for (let exam of exams) {
      const [startTime, endTime] = exam.jam.split("-");
      const date = exam.tanggal.split("-").reverse().join("-");

      const startDateTime = `${date}T${startTime}:00+07:00`
      const endDateTime = `${date}T${endTime}00+07:00`

      const event = {
        summary: exam.mata_kuliah,
        location: `${exam.ruangan}, ${exam.no_kursi}`,
        start: {
          dateTime: startDateTime,
          timeZone: "Asia/Jakarta",
        },
        end: {
          dateTime: endDateTime,
          timeZone: "Asia/Jakarta",
        },
      };

      await window.gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: event,
      });
    }

    alert("All exams have been added to your Google Calendar!");
  };

  const handleClick = () => {
    if (tokenClient) tokenClient.requestAccessToken();
  };

  return (
    <div
      onClick={handleClick}
      className='p-2 mt-8 text-center text-white transition bg-blue-500 rounded-md cursor-pointer hover:bg-blue-300 font-poppins'
    >
      Add to Google Calendar
    </div>
  );
}

export default GoogleCalendarButton