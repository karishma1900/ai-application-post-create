import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import React, { useState } from 'react';
import Header from './header/header';
import 'react-toastify/dist/ReactToastify.css';
// Import your Pricing page and other pages
import Pricing from './pricing/pricing'; // Make sure to create a Pricing.js component
import { ToastContainer, toast } from 'react-toastify';
import Home from './home/Home';
import Credit from './credit/Credit';
import { AuthProvider } from './AuthContext';
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    <Router>
      <AuthProvider >
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
      <ToastContainer 
  position="top-right" 
  autoClose={3000} 
  closeOnClick={true} // Ensures clicking the body closes it
  closeButton={true}  // Ensures the 'x' icon is available
  pauseOnHover={true}
/>
</AuthProvider>
    </Router>
    
  );
}

export default App;
