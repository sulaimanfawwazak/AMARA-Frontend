import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FileUpload from './pages/FileUpload';
import ExamList from './pages/ExamList';
import Playground from './pages/Playground'
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  // <StrictMode>
  //   <App />
  // </StrictMode>,

  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FileUpload />} />
        <Route path="/exam" element={<ExamList />} />
        <Route path="/playground" element={<Playground />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
