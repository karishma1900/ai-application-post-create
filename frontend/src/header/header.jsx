import React, { useState, useContext } from 'react';
import './Header.css';
import Login from '../login/login';
import Register from '../register/register';
import { AuthContext } from '../AuthContext';

const Header = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('login');

  const {
    isLoggedIn,
    userEmail,
    profileImage,
    credits,
    handleLoginSuccess,
    logout,
  } = useContext(AuthContext);

  const handleLoginSuccessLocal = (userData) => {
    handleLoginSuccess(userData);
    setIsModalOpen(false);
  };

  const handleLogout = async () => {
    await logout();
  };

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

  return (
    <header className="header">
      <div className="logo">AI App</div>

      <div className="auth-buttons">
        {!isLoggedIn ? (
          <button className="login-btn" onClick={openLoginModal}>Login</button>
        ) : (
          <div className="profile">
            { /* {profileImage && (
              <img
                src={profileImage}
                alt="Profile"
                className="profile-image"
              />
            )} */}
            {/* <div className="profile-info">
              <p className="user-email">{userEmail}</p>
              <p className="user-credits">Credits: {credits !== null ? credits : 'Loading...'}</p>
            </div> */}
            <button onClick={handleLogout} className='login-btn'>Logout</button>
          </div>
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
                onLoginSuccess={handleLoginSuccessLocal}
              />
            )}
            {modalType === 'register' && (
              <Register
                openLoginModal={openLoginModal}
                closeModal={closeModal}
                onLoginSuccess={handleLoginSuccessLocal}
              />
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;


