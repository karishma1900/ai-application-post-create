import React, { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { FiSend } from "react-icons/fi";
import './home.css';
import Credit from '../credit/Credit';
import Login from '../login/login';
import { AuthContext } from '../AuthContext';

function Home() {
  const [topic, setTopic] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [planCredits] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false); // 🔹 NEW STATE

  const {
    isLoggedIn,
    credits,
    handleLoginSuccess,
    fetchUserData,
  } = useContext(AuthContext);

  const currentCredits = credits !== null ? credits : 100;
  const usedCredits = planCredits - currentCredits;

  const openLoginModal = () => setIsModalOpen(true);
  const closeLoginModal = () => setIsModalOpen(false);

  const handleLoginSuccessLocal = () => {
    handleLoginSuccess();
    closeLoginModal();
  };

  const handleRequest = async () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    if (!topic) {
      toast.error('Please enter a topic name.');
      return;
    }

    if (currentCredits < 3) {
      toast.error('Insufficient credits! ❌');
      return;
    }

    setIsSubmitting(true); // 🔹 DISABLE BUTTON

    const url = 'https://aiautomation15.app.n8n.cloud/webhook/e142e4a5-187e-4cd9-9957-37e979d2e639';
    const payload = { topic, category: 'blogs' };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Request failed.');

      toast.success('Topic submitted successfully! ✅');
      setTopic('');

      const token = localStorage.getItem('accessToken');
      const creditRes = await fetch('https://ai-application-post-create.onrender.com/api/credit/deduct', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: 3 }),
      });

      if (creditRes.ok) {
        await fetchUserData();
      } else {
        toast.warning('Request submitted, but failed to update credits.');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Submission failed! ❌');
    } finally {
      setIsSubmitting(false); // 🔹 RE-ENABLE BUTTON
    }
  };


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
          <button
  onClick={handleRequest}
  disabled={isSubmitting}
  className={`send-btn ${isSubmitting ? 'disabled' : ''}`}
>
  <FiSend style={{ fontSize: '24px', color: '#fff' }} />
</button>


        </div>
      </div>

      {isLoggedIn && <Credit total={planCredits} used={usedCredits} />}

      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.classList.contains('modal-overlay')) closeLoginModal();
        }}>
          <div className="modal-content">
            <button className="close-btn" onClick={closeLoginModal}>&times;</button>
            <Login
              closeModal={closeLoginModal}
              onLoginSuccess={handleLoginSuccessLocal}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
