import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiSend } from "react-icons/fi";
import './home.css';
import Credit from '../credit/Credit';
import Login from '../login/login';  // Import your Login component

function Home({ isLoggedIn, setIsLoggedIn }) {
  const [topic, setTopic] = useState('');
  const [credits, setCredits] = useState(null);
  const [planCredits] = useState(100);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoggedIn(false);
        return;
      }
      try {
        const res = await fetch('https://ai-application-post-create.onrender.com/api/auth/me', {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setCredits(data.credits);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setIsLoggedIn(false);
      }
    };

    fetchUser();
  }, [setIsLoggedIn]);

  const openLoginModal = () => setIsModalOpen(true);
  const closeLoginModal = () => setIsModalOpen(false);

  const handleRequest = async () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    if (!topic) {
      toast.error('Please enter a topic name.');
      return;
    }

    if (credits < 3) {
      toast.error('Insufficient credits! ❌');
      return;
    }

    const url = 'https://aiautomation15.app.n8n.cloud/webhook/e142e4a5-187e-4cd9-9957-37e979d2e639';
    const payload = { topic, category: 'blogs' };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Request failed.');

      const result = await res.json();
      toast.success('Topic submitted successfully! ✅');
      setTopic('');

      const token = localStorage.getItem('accessToken');

      const creditRes = await fetch('https://ai-application-post-create.onrender.com/api/credit/deduct', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: 3 }),
      });

      if (creditRes.ok) {
        setCredits(prev => prev - 3);
      } else {
        toast.warning('Request submitted, but failed to update credits.');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Submission failed! ❌');
    }
  };

  const usedCredits = credits !== null ? planCredits - credits : 0;

  return (
    <div className='homepage'>
      <h2 className='heading'>Tell Us What to Write About</h2>
      <div className="topic-input">
        <div className="mainfiled">
          <input
            id="topic-name"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter topic name"
          />
          <button onClick={handleRequest}>
            <FiSend style={{ fontSize: '24px', color: '#fff' }} />
          </button>
        </div>
      </div>

      {/* <ToastContainer position="top-right" autoClose={3000} /> */}

      {/* Show credits only if logged in */}
      {isLoggedIn && <Credit total={planCredits} used={usedCredits} />}

      {/* Login modal */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.classList.contains('modal-overlay')) closeLoginModal();
          }}
        >
          <div className="modal-content">
            <button className="close-btn" onClick={closeLoginModal}>&times;</button>
            <Login
              closeModal={closeLoginModal}
              // >>> CRUCIAL FIX: Pass a function to handle successful credit data <<<
              onLoginSuccess={(userData) => {
                // userData should contain { credits }
                if (userData.credits !== undefined) {
                  setCredits(userData.credits);
                  setIsLoggedIn(true);
                  closeLoginModal(); // Close modal immediately after updating state
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
