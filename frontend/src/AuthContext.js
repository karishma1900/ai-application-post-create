// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);

  // MD5 function for gravatar
  const md5 = async (string) => {
    const buffer = await crypto.subtle.digest("MD5", new TextEncoder().encode(string));
    return [...new Uint8Array(buffer)]
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const getGravatar = async (email) => {
    const hash = await md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
  };

  const checkIfTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() > payload.exp * 1000;
    } catch {
      return true;
    }
  };

  const refreshAccessToken = async () => {
    try {
      const res = await fetch('https://ai-application-post-create.onrender.com/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('accessToken', data.accessToken);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Token refresh failed', err);
      return false;
    }
  };

  // Fetch user info & credits
  const fetchUserData = useCallback(async () => {
    setLoading(true);
    let token = localStorage.getItem('accessToken');
    const isExpired = checkIfTokenExpired(token);

    if (isExpired) {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        setIsLoggedIn(false);
        setUserEmail('');
        setProfileImage('');
        setCredits(null);
        setLoading(false);
        return;
      }
      token = localStorage.getItem('accessToken');
    }

    try {
      const res = await fetch('https://ai-application-post-create.onrender.com/api/auth/me', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json();

      if (res.ok) {
        setIsLoggedIn(true);
        setUserEmail(data.email);
        setCredits(data.credits);

        if (data.profileImage) {
          setProfileImage(data.profileImage);
        } else {
          const gravatarUrl = await getGravatar(data.email);
          setProfileImage(gravatarUrl);
        }
      } else {
        setIsLoggedIn(false);
        setUserEmail('');
        setProfileImage('');
        setCredits(null);
        localStorage.removeItem('email');
      }
    } catch (err) {
      console.error('Failed to fetch user data', err);
      setIsLoggedIn(false);
      setUserEmail('');
      setProfileImage('');
      setCredits(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Login handler: called after successful login in Login component
  const handleLoginSuccess = ({ email, credits: newCredits, profileImage: img }) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    setCredits(newCredits ?? credits);
    if (img) setProfileImage(img);
    else getGravatar(email).then(setProfileImage);

    localStorage.setItem('email', email);
  };

  const login = async ({ email, password }) => {
    try {
      const res = await fetch('https://ai-application-post-create.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Login failed');
        return false;
      }

      localStorage.setItem('accessToken', data.accessToken);
      handleLoginSuccess({
        email,
        credits: data.credits,
        profileImage: data.profileImage,
      });

      toast.success('Login successful!');
      return true;
    } catch (err) {
      console.error('Login error', err);
      toast.error('Something went wrong!');
      return false;
    }
  };

  const logout = async () => {
    try {
      const res = await fetch('https://ai-application-post-create.onrender.com/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        setIsLoggedIn(false);
        setUserEmail('');
        setProfileImage('');
        setCredits(null);
        localStorage.removeItem('email');
        localStorage.removeItem('accessToken');
      } else {
        toast.error('Logout failed');
      }
    } catch (err) {
      console.error('Logout error', err);
      toast.error('Logout failed');
    }
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      userEmail,
      profileImage,
      credits,
      loading,
      login,
      logout,
      fetchUserData,
      handleLoginSuccess,
      setCredits,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
