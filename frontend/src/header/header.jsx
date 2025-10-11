import React, { useState, useEffect } from 'react';
import './Header.css';
import Login from '../login/login';
import Register from '../register/register';

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('login');
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
 
// Header.js

useEffect(() => {
  // Use a variable to track if the request is still valid
  let isRequestStale = false; 
 const getGravatar = async (email) => {
    const hash = await md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
  };

  const checkAuth = async () => {
    try {
      const res = await fetch('https://ai-application-post-create.onrender.com/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json();
      
      // ✅ Check the flag before updating state
      if (isRequestStale) return; 

      if (res.ok) {
        setIsLoggedIn(true);
        setUserEmail(data.email);

        if (data.profileImage) {
          setProfileImage(data.profileImage);
        } else {
          // You need to make this async if your getGravatar uses the crypto API
          const gravatarUrl = await getGravatar(data.email); 
          setProfileImage(gravatarUrl);
        }
        localStorage.setItem('email', data.email);
      } else {
        // ✅ Check the flag before updating state
        if (isRequestStale) return;
        
        setIsLoggedIn(false);
        localStorage.removeItem('email');
      }
    } catch (err) {
      // ✅ Check the flag before updating state
      if (isRequestStale) return; 
      console.error('Not logged in', err);
      setIsLoggedIn(false);
    }
  };

  checkAuth();
  
  // 🧹 Cleanup function: This runs on re-render
  // If the component re-renders (e.g., after a successful login), 
  // we mark the previous request as stale.
  return () => {
    isRequestStale = true;
  };
}, []); 
// The empty dependency array ensures this runs only on mount, but 
// the cleanup function handles the subsequent state changes correctly.


// NOTE: Also make sure to update your getGravatar function to be async if it uses the crypto API as shown in your original code.
// const md5 = (string) => { ... } // needs to be used with await if inside an async function
const handleLoginSuccess = (userData , token) => {
  setIsLoggedIn(true);
  setUserEmail(userData.email);
  setProfileImage(userData.profileImage || getGravatar(userData.email));
  setIsModalOpen(false); 
  localStorage.setItem('authToken', token); // Storing the token in localStorage

  // Log the token to see it in the console for debugging
  console.log('Login successful, token:', token);
};

  const getGravatar = (email) => {
    const hash = md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
  };

  // Function to open modals
  const openLoginModal = () => {
    setModalType('login');
    setIsModalOpen(true);
  };

  const openRegisterModal = () => {
    setModalType('register');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType('login');
  };

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeModal();
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('https://ai-application-post-create.onrender.com/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        setIsLoggedIn(false); // <== Update shared state
        setUserEmail('');
        setProfileImage('');
        localStorage.removeItem('email');
      } else {
        console.error('Logout failed');
      }
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  // For Gravatar hashing
  const md5 = (string) => {
    return crypto.subtle.digest("MD5", new TextEncoder().encode(string))
      .then(buffer => [...new Uint8Array(buffer)]
      .map(b => b.toString(16).padStart(2, '0')).join(''));
  };

  return (
    <header className="header">
      <div className="logo">AI App</div>

      <div className="auth-buttons">
        {!isLoggedIn ? (
          <>
            <button className="login-btn" onClick={openLoginModal}>Login</button>
            <button className="register-btn" onClick={openRegisterModal}>Register</button>
          </>
        ) : (
          <>
           {profileImage && (
  <div className="profile-dropdown">
    <img
      src={profileImage}
      alt="Profile"
      className="profile-image"
    />
    <div className="dropdown-menu">
      <button onClick={handleLogout} className='logout-button'>Logout</button>
    </div>
  </div>
)}

          </>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleOutsideClick}>
          <div className="modal-content">
            <button className="close-btn" onClick={closeModal}>&times;</button>
            {modalType === 'login' && (
              <Login
  openRegisterModal={openRegisterModal}
  closeModal={() => {
    setIsModalOpen(false);
    setTimeout(() => window.location.reload(), 500);
  }}
  onLoginSuccess={handleLoginSuccess}  // Pass as a prop here
/>
            )}
            {modalType === 'register' && (
              <Register
  openLoginModal={openLoginModal}
  closeModal={() => setIsModalOpen(false)}
  onLoginSuccess={handleLoginSuccess}
/>

            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
