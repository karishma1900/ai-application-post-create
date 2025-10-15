import React, { useState, useContext } from 'react';
import './login.css';
import { toast } from 'react-toastify';
import { AuthContext } from '../AuthContext'; // Adjust the path as needed

const Login = ({ closeModal, openRegisterModal }) => {
  const { login } = useContext(AuthContext); // get login function from context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = await login({ email, password });

    if (success) {
      closeModal();  // close modal if login was successful
    } else {
      // Optional: additional error handling here if needed
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
