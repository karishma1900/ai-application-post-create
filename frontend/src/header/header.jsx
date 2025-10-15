import React, { useState, useEffect } from 'react';
import './Header.css';
import Login from '../login/login';
import Register from '../register/register';

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('login');
  const [userEmail, setUserEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');

  const checkIfTokenExpired = (token) => {
    if (!token) return true; // If no token exists, consider it expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode the base64 payload
      const expirationTime = payload.exp * 1000; // Convert from seconds to milliseconds
      return Date.now() > expirationTime; // Check if the current time is greater than the expiration time
    } catch (error) {
      console.error('Failed to decode token:', error);
      return true; // If there's an error decoding the token, consider it expired
    }
  };

  const getGravatar = async (email) => {
    const hash = await md5(email.trim().toLowerCase()); // Wait for md5 to resolve
    return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
  };

  const md5 = (string) => {
    return crypto.subtle.digest("MD5", new TextEncoder().encode(string))
      .then(buffer => [...new Uint8Array(buffer)]
      .map(b => b.toString(16).padStart(2, '0')).join(''));
  };

  useEffect(() => {
    const refreshAccessToken = async () => {
      try {
        const res = await fetch('https://ai-application-post-create.onrender.com/api/auth/refresh', {
          method: 'POST',
          credentials: 'include', // For cookies
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem('accessToken', data.accessToken);
          return true;
        } else {
          return false;
        }
      } catch (err) {
        console.error('Token refresh failed', err);
        return false;
      }
    };

   const checkAuth = async () => {
  let token = localStorage.getItem('accessToken');
  const isTokenExpired = checkIfTokenExpired(token);

  if (isTokenExpired) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      setIsLoggedIn(false);
      return;
    }
    token = localStorage.getItem('accessToken'); // Get new token
  }

  try {
    const res = await fetch('https://ai-application-post-create.onrender.com/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',  // Make sure credentials are included in the request
    });

    const data = await res.json();
    if (res.ok) {
      setIsLoggedIn(true);
      setUserEmail(data.email);

      if (data.profileImage) {
        setProfileImage(data.profileImage);
      } else {
        const gravatarUrl = await getGravatar(data.email);
        setProfileImage(gravatarUrl);
      }
    } else {
      setIsLoggedIn(false);
      localStorage.removeItem('email');
    }
  } catch (err) {
    console.error('Not logged in', err);
    setIsLoggedIn(false);
  }
};

    checkAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUserEmail(userData.email);
    setProfileImage(userData.profileImage || getGravatar(userData.email));
    setIsModalOpen(false);
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
        setIsLoggedIn(false); // Update shared state
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

  return (
    <header className="header">
      <div className="logo">AI App</div>

      <div className="auth-buttons">
        {!isLoggedIn ? (
          <>
            <button className="login-btn" onClick={openLoginModal}>Login</button>
            {/* <button className="register-btn" onClick={openRegisterModal}>Register</button> */}
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
      // NOTE: Remove the forced reload if you use handleLoginSuccess properly
      // setTimeout(() => window.location.reload(), 500); 
    }}
    // --- CRUCIAL CHANGE: Pass the success handler ---
    onLoginSuccess={handleLoginSuccess} 
    // --- END CRUCIAL CHANGE ---
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



