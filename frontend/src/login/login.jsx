import React, { useState } from 'react';
import './login.css';
import { toast } from 'react-toastify';

const Login = ({ closeModal, openRegisterModal,onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://ai-application-post-create.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log('Status:', res.status, 'Body:', data);

      if (!res.ok) {
        toast.error(data.error || 'Login failed');
        return;
      }

      // ✅ Pass token and user info to parent
      onLoginSuccess(data.accessToken, {
        email: data.email,
        profileImage: data.profileImage,
      });

      toast.success('Login successful!');
      localStorage.setItem('accessToken', data.accessToken);

      closeModal();
    } catch (err) {
      toast.error('Something went wrong!');
      console.error(err);
    }
  };


  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          className="input-field"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="input-field"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="submit-btn">
          Login
        </button>
      </form>

      <p className='register-login2'>
        Don't have an account?{' '}
        <button type="button" className='register-login' onClick={openRegisterModal}>Register</button>
      </p>

      <button className="close-btn" onClick={closeModal}>
        &times;
      </button>
    </div>
  );
};

export default Login;



