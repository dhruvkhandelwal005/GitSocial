import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { supabase } from '../supabaseClient';
import pfpic from '../assets/profile.png';

export default function Profile({ user, logout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [repos, setRepos] = useState([]);
  const [exploreUsers, setExploreUsers] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const { username } = useParams();
  const navigate = useNavigate();
  const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
  const headers = { Authorization: `token ${GITHUB_TOKEN}` };

  const getRepoAge = (dateStr) => {
    const created = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    if (diffDays < 30) return `${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} months ago`;
    return `${Math.floor(diffMonths / 12)} years ago`;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const uname = username || user?.username;
        const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(uname)}`, { headers });
        if (!userRes.ok) throw new Error('User fetch failed');
        const userData = await userRes.json();
        setData(userData);

        const repoRes = await fetch(`https://api.github.com/users/${encodeURIComponent(uname)}/repos`, { headers });
        if (repoRes.ok) setRepos(await repoRes.json());

        const [followersRes, followingRes] = await Promise.all([
          fetch(`https://api.github.com/users/${encodeURIComponent(uname)}/followers`, { headers }),
          fetch(`https://api.github.com/users/${encodeURIComponent(uname)}/following`, { headers }),
        ]);
        if (followersRes.ok) setFollowers(await followersRes.json());
        if (followingRes.ok) setFollowing(await followingRes.json());
      } catch (err) {
        console.error('GitHub API error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [username, user]);

  useEffect(() => {
    async function fetchExplore() {
      const { data: usersData, error } = await supabase.from('users').select('uname');
      if (!error && usersData) setExploreUsers(usersData);
    }
    fetchExplore();
  }, []);

  if (loading) return <Loader />;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const openDialog = (type) => {
    setDialogType(type);
    setShowDialog(true);
  };

  const closeDialog = () => setShowDialog(false);
  const dialogData = dialogType === 'followers' ? followers : following;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top left, #0f172a, #000)',
        color: '#e2e8f0',
        fontFamily: 'Inter, sans-serif',
        padding: '20px 15px',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          background: 'rgba(17, 25, 40, 0.85)',
          borderRadius: '20px',
          padding: '30px 20px',
          boxShadow: '0 0 20px rgba(99,102,241,0.2)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(99,102,241,0.3)',
        }}
      >
        {/* Profile Header */}
        <div style={{ textAlign: 'center' }}>
          <img
            src={data?.avatar_url || pfpic}
            alt="avatar"
            style={{
              width: '130px',
              height: '130px',
              borderRadius: '50%',
              border: '3px solid #6366f1',
              objectFit: 'cover',
              boxShadow: '0 0 20px rgba(99,102,241,0.4)',
            }}
          />
          <h2 style={{ marginTop: 20, fontSize: '1.8rem' }}>{data?.name || data?.login}</h2>
          <p style={{ color: '#94a3b8' }}>@{data?.login}</p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              marginTop: '15px',
              flexWrap: 'wrap',
            }}
          >
            <div
              onClick={() => openDialog('followers')}
              style={{
                cursor: 'pointer',
                padding: '10px 16px',
                borderRadius: '10px',
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                color: '#a5b4fc',
              }}
            >
              <strong>{data?.followers}</strong> Followers
            </div>
            <div
              onClick={() => openDialog('following')}
              style={{
                cursor: 'pointer',
                padding: '10px 16px',
                borderRadius: '10px',
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                color: '#a5b4fc',
              }}
            >
              <strong>{data?.following}</strong> Following
            </div>
          </div>

          <a
            href={data?.html_url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-block',
              marginTop: '20px',
              color: '#818cf8',
              textDecoration: 'none',
              transition: '0.3s',
            }}
          >
            Visit GitHub Profile ↗️
          </a>

          <br />
          <button
            onClick={handleLogout}
            style={{
              background: 'linear-gradient(90deg, #ef4444, #b91c1c)',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              marginTop: '25px',
              transition: '0.3s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Logout 🚪
          </button>
        </div>

        {/* Explore People Horizontal Scroll */}
        {exploreUsers.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h3 style={{ color: '#c7d2fe', marginBottom: '12px' }}>Explore People</h3>
            <div
              style={{
                display: 'flex',
                overflowX: 'auto',
                gap: '15px',
                paddingBottom: '10px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {exploreUsers.map((u, i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/profile/${u.uname}`)}
                  style={{
                    minWidth: '110px',
                    flex: '0 0 auto',
                    height: '160px', // taller than width
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '16px',
                    padding: '10px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 6px 15px rgba(99,102,241,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
                  }}
                >
                  <img
                    src={pfpic}
                    alt={u.uname}
                    style={{ width: '70px', height: '70px', borderRadius: '50%', marginBottom: '10px' }}
                  />
                  <span style={{ color: '#e2e8f0', fontWeight: 500, fontSize: '14px' }}>@{u.uname}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Repositories Section */}
        <h3
          style={{
            marginTop: '40px',
            fontSize: '1.5rem',
            color: '#c7d2fe',
            textAlign: 'center',
          }}
        >
          Repositories
        </h3>

        {repos.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '10px' }}>No repositories found.</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '20px',
              marginTop: '30px',
            }}
          >
            {repos.map((repo) => (
              <div
                key={repo.id}
                onClick={() => navigate(`/repo/${data.login}/${repo.id}`)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  borderRadius: '12px',
                  padding: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 0 10px rgba(0,0,0,0.4)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 0 15px rgba(99,102,241,0.5)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 0 10px rgba(0,0,0,0.4)')}
              >
                <h4 style={{ color: '#a5b4fc', marginBottom: '8px' }}>{repo.name}</h4>
                <p style={{ color: '#9ca3af', fontSize: '13px', minHeight: '35px' }}>
                  {repo.description || 'No description'}
                </p>
                <div style={{ fontSize: '13px', marginTop: '10px', color: '#cbd5e1' }}>
                  ⭐ {repo.stargazers_count} | 🍴 {repo.forks_count} | ⏳ {getRepoAge(repo.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog Overlay */}
      {showDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={closeDialog}
        >
          <div
            style={{
              background: 'rgba(17,25,40,0.95)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '16px',
              padding: '20px',
              width: '100%',
              maxWidth: '400px',
              maxHeight: '75vh',
              overflowY: 'auto',
              boxShadow: '0 0 20px rgba(99,102,241,0.4)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ textAlign: 'center', color: '#c7d2fe', marginBottom: '15px' }}>
              {dialogType === 'followers' ? 'Followers' : 'Following'}
            </h3>
            {dialogData.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#9ca3af' }}>No {dialogType} found.</p>
            ) : (
              dialogData.map((f) => (
                <div
                  key={f.id}
                  onClick={() => {
                    closeDialog();
                    navigate(`/profile/${f.login}`);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderBottom: '1px solid rgba(99,102,241,0.2)',
                    color: '#e2e8f0',
                    cursor: 'pointer',
                    transition: '0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>@{f.login}</span>
                  <img src={f.avatar_url} alt={f.login} style={{ width: 35, height: 35, borderRadius: '50%' }} />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
