import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ExamScheduleUpload from './pages/ExamScheduleUpload';
import ExamList from './pages/ExamList';
import Playground from './pages/Playground'
import './index.css';
import ClassList from './pages/ClassList';
import ClassScheduleUpload from './pages/ClassScheduleUpload';
import Landing from './pages/Landing';

ReactDOM.createRoot(document.getElementById('root')).render(
  // <StrictMode>
  //   <App />
  // </StrictMode>,

  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/exam-schedule" element={<ExamScheduleUpload />} />
        <Route path="/class-schedule" element={<ClassScheduleUpload />} />
        <Route path="/exam-list" element={<ExamList />} />
        <Route path="/class-list" element={<ClassList />} />
        <Route path="/playground" element={<Playground />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
