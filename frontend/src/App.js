import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import React, { useState } from 'react';
import Header from './header/header';
// Import your Pricing page and other pages
import Pricing from './pricing/pricing'; // Make sure to create a Pricing.js component
import { ToastContainer, toast } from 'react-toastify';
import Home from './home/Home';
import Credit from './credit/Credit';
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    <Router>
       <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <div className="App">
        <div className="grid-overlay"></div>
  <div className="glow-spot"></div>
        {/* Define your routes here */}
    
      
        <Routes>
         
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/credit"  element={<Credit />} />
        </Routes>
   
      </div>
       <ToastContainer position="top-right" autoClose={3000} />
    </Router>
    
  );
}

export default App;
