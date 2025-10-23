import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';
import { supabase } from '../supabaseClient';

export default function Username({ user, setUser }) {
  const [githubUsername, setGithubUsername] = useState(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchGitHubUsername() {
      try {
        const res = await fetch(
          `https://api.github.com/search/users?q=${encodeURIComponent(user?.email)}`
        );
        const data = await res.json();

        if (data.total_count === 0) {
          setGithubUsername(null);
        } else {
          setGithubUsername(data.items[0].login);
          setUsername(data.items[0].login); // auto-fill input
        }
      } catch (err) {
        console.error('GitHub API error:', err);
        setGithubUsername(null);
      } finally {
        setLoading(false);
      }
    }

    fetchGitHubUsername();
  }, [user]);

  async function handleSubmit() {
    if (!username.trim()) {
      setErrorMsg('Username cannot be empty.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const updatedUser = { ...user, username: username.trim() };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      const { error } = await supabase
        .from('users')
        .insert([{ uname: username.trim() }])
        .select();

      if (error) {
        if (error.code === '23505') {
          console.warn('Username already exists, skipping insert.');
        } else {
          console.error(error);
          setErrorMsg('Failed to save username to database.');
        }
      }

      setTimeout(() => {
        setLoading(false);
        navigate('/home');
      }, 500);
    } catch (err) {
      console.error('Error setting username:', err);
      setErrorMsg('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  if (loading) return <Loader message="Fetching your GitHub info..." />;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#1f2937',
          padding: '40px 25px',
          borderRadius: '15px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '1.6rem', marginBottom: '10px' }}>Set Your Username</h2>
        <input
          type="text"
          placeholder={githubUsername || 'Enter your GitHub username'}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            padding: '12px 15px',
            borderRadius: '10px',
            border: '1px solid #334155',
            background: '#111827',
            color: '#f8fafc',
            fontSize: '14px',
            outline: 'none',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
        {errorMsg && <p style={{ color: '#f87171', fontSize: '0.9rem' }}>{errorMsg}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: '12px 0',
            borderRadius: '10px',
            border: 'none',
            background: '#6366f1',
            color: '#f8fafc',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#4f46e5')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#6366f1')}
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
}
