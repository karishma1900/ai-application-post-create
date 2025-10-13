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
const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken') || null);

useEffect(() => {
  const getGravatar = async (email) => {
    const hash = await md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
  };

  const checkAuth = async () => {
    if (!accessToken) return; // Don't call /me if there's no token

    try {
      const res = await fetch('https://ai-application-post-create.onrender.com/api/auth/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setIsLoggedIn(true);
        setUserEmail(data.email);
        setProfileImage(data.profileImage || (await getGravatar(data.email)));
      } else {
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error('Not logged in', err);
      setIsLoggedIn(false);
    }
  };

  checkAuth();
}, [accessToken]); // ✅ watch accessToken here!

const onLoginSuccess = (token, userData) => {
  localStorage.setItem('accessToken', token); // ✅ persist token
  setAccessToken(token);
  setIsLoggedIn(true);
  setUserEmail(userData.email);
  setProfileImage(userData.profileImage);
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
localStorage.removeItem('accessToken');
setAccessToken(null);

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
  closeModal={closeModal}
  onLoginSuccess={onLoginSuccess}
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



