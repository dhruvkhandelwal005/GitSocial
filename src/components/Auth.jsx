import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Loader from './Loader';

export default function Auth({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function signUp() {
    setLoading(true);
    setErrorMsg('');
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) setErrorMsg(error.message);
    else handleSuccess(data.user);
  }

  async function signIn() {
    setLoading(true);
    setErrorMsg('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) setErrorMsg(error.message);
    else handleSuccess(data.user);
  }

  function handleSuccess(userData) {
    const u = { email: userData.email, loggedIn: true };
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
    navigate('/username'); // redirect to username setup
  }

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
      {loading && <Loader message="Authenticating..." />}
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: '#1f2937',
          padding: '40px 30px',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Login / Signup</h2>

        <input
          type="email"
          placeholder="Email connected to github"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: '12px 15px',
            borderRadius: '10px',
            border: '1px solid #334155',
            background: '#111827',
            color: '#f8fafc',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <input
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: '12px 15px',
            borderRadius: '10px',
            border: '1px solid #334155',
            background: '#111827',
            color: '#f8fafc',
            fontSize: '14px',
            outline: 'none',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
          <button
            onClick={signIn}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px 0',
              borderRadius: '10px',
              border: 'none',
              background: '#6366f1',
              color: '#f8fafc',
              fontWeight: 600,
              cursor: 'pointer',
              transition: '0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#4f46e5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#6366f1')}
          >
            Sign In
          </button>
          <button
            onClick={signUp}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px 0',
              borderRadius: '10px',
              border: 'none',
              background: '#10b981',
              color: '#f8fafc',
              fontWeight: 600,
              cursor: 'pointer',
              transition: '0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#059669')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#10b981')}
          >
            Sign Up
          </button>
        </div>

        {errorMsg && <p style={{ color: '#f87171', textAlign: 'center' }}>{errorMsg}</p>}
      </div>
    </div>
  );
}
