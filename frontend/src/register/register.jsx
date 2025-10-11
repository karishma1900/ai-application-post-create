import React, { useState } from 'react';
import { toast } from 'react-toastify';

const Register = ({ closeModal, openLoginModal, onLoginSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Registration failed');
        return;
      }

      toast.success('Registered and logged in successfully!');

      // IMPORTANT: call onLoginSuccess to update Header state immediately
      if (onLoginSuccess) {
        onLoginSuccess(data);
      } else {
        closeModal();
      }
    } catch (err) {
      toast.error('Something went wrong!');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          className="input-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="input-field"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" className="submit-btn">
          Register
        </button>

        <p className='register-login2'>
          Already have an account?{' '}
          <button type="button" className='register-login' onClick={openLoginModal}>Login</button>
        </p>
      </form>

      <button className="close-btn" onClick={closeModal}>
        &times;
      </button>
    </div>
  );
};

export default Register;
