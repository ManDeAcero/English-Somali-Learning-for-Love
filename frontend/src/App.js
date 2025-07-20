import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import Dashboard from './pages/Dashboard';
import TestPronunciation from './pages/TestPronunciation';
import './App.css';

function App() {
  // For now, show the test pronunciation page to demonstrate the feature
  const showTest = window.location.search.includes('test');
  
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={showTest ? <TestPronunciation /> : <Dashboard />} />
          <Route path="/test" element={<TestPronunciation />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;