import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Loader from '../components/Loader';
import pfpic from '../assets/profile.png';
import Error from '../components/Error';

export default function Home({ user, logout }) {
  const [data, setData] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [feed, setFeed] = useState([]);
  const [exploreUsers, setExploreUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
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
    async function fetchGitHub() {
      try {
        const userRes = await fetch(
          `https://api.github.com/users/${encodeURIComponent(user?.username)}`,
          { headers }
        );
        if (!userRes.ok) throw new Error(`GitHub user fetch failed (${userRes.status})`);
        const userData = await userRes.json();
        setData(userData);

        const followersRes = await fetch(userData.followers_url, { headers });
        if (!followersRes.ok) throw new Error('Followers fetch failed.');
        const followersData = await followersRes.json();
        setFollowers(followersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchGitHub();
  }, [user]);

  useEffect(() => {
    async function fetchUsers() {
      const { data: usersData, error } = await supabase.from('users').select('uname');
      if (!error && usersData) setExploreUsers(usersData);
    }
    fetchUsers();
  }, []);

  const loadRandomRepos = useCallback(async () => {
    if (!followers.length) return;
    setLoadingMore(true);
    try {
      const randomFollowers = [...followers].sort(() => 0.5 - Math.random()).slice(0, 10);

      const repoPromises = randomFollowers.map(async (f) => {
        const res = await fetch(`https://api.github.com/users/${f.login}/repos`, { headers });
        if (!res.ok) return null;
        const repos = await res.json();
        if (!repos.length) return null;
        const randomRepo = repos[Math.floor(Math.random() * repos.length)];

        const [issuesRes, pullsRes, langsRes] = await Promise.all([
          fetch(randomRepo.issues_url.replace('{/number}', ''), { headers }),
          fetch(`https://api.github.com/repos/${f.login}/${randomRepo.name}/pulls`, { headers }),
          fetch(randomRepo.languages_url, { headers }),
        ]);

        const [issues, pulls, languages] = await Promise.all([
          issuesRes.ok ? issuesRes.json() : [],
          pullsRes.ok ? pullsRes.json() : [],
          langsRes.ok ? langsRes.json() : {},
        ]);

        return {
          follower: f,
          repo: randomRepo,
          details: {
            issues: issues.length,
            pulls: pulls.length,
            languages: Object.keys(languages),
          },
        };
      });

      const repoData = (await Promise.all(repoPromises)).filter(Boolean);
      setFeed((prev) => [...prev, ...repoData]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }, [followers]);

  const observer = useRef();
  const lastFeedRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) loadRandomRepos();
      });
      if (node) observer.current.observe(node);
    },
    [loadingMore, loadRandomRepos]
  );

  useEffect(() => {
    if (followers.length > 0) loadRandomRepos();
  }, [followers, loadRandomRepos]);

  if (loading) return <Loader />;
  if (error) return <Error message="Unable to fetch user data" details={error} logout={logout} />;

  const icons = {
    star: '⭐',
    fork: '🍴',
    eye: '👀',
    bug: '🐞',
    pull: '🔀',
    repo: '💻',
    lang: '🏷️',
    link: '🔗',
    clock: '⏳',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#e2e8f0',
        padding: 20,
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 20,
      }}
    >
      {/* Feed + Profile */}
      <div style={{ flex: 1, maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 25 }}>
        {/* Profile Card */}
        <div
          style={{
            background: '#1e293b',
            borderRadius: 16,
            padding: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <img
              src={data?.avatar_url || pfpic}
              alt="Profile"
              style={{ width: 70, height: 70, borderRadius: '50%', border: '2px solid #475569', cursor: 'pointer' }}
              onClick={() => navigate(`/profile/${user?.username}`)}
            />
            <div>
              <h2 style={{ margin: 0 }}>{data?.name || user?.username}</h2>
              <p style={{ margin: 0, fontSize: 14, color: '#94a3b8' }}>@{user?.username}</p>
            </div>
          </div>
          <button
            style={{
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              transition: '0.2s',
            }}
            onMouseOver={(e) => (e.target.style.background = '#2563eb')}
            onMouseOut={(e) => (e.target.style.background = '#3b82f6')}
            onClick={logout}
          >
            Logout
          </button>
        </div>

        {/* Feed */}
        <h3 style={{ color: '#f8fafc' }}>Your Feed</h3>
        {feed.length === 0 && <p style={{ textAlign: 'center', color: '#94a3b8' }}>No repositories to show yet...</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {feed.map((item, index) => (
            <div
              key={`${item.repo.id}-${index}`}
              ref={index === feed.length - 1 ? lastFeedRef : null}
              style={{
                background: '#1e293b',
                borderRadius: 16,
                padding: 16,
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <img
                  src={item.follower.avatar_url}
                  alt={item.follower.login}
                  style={{ width: 50, height: 50, borderRadius: '50%', border: '2px solid #475569' }}
                  onClick={() => navigate(`/profile/${item.follower.login}`)}
                />
                <strong
                  style={{ fontSize: 16 }}
                  onClick={() => navigate(`/profile/${item.follower.login}`)}
                >
                  {item.follower.login}
                </strong>
              </div>

              <div>
                <h4
                  style={{ color: '#3b82f6', fontSize: 18, margin: '6px 0', cursor: 'pointer' }}
                  onClick={() => navigate(`/repo/${item.follower.login}/${item.repo.id}`)}
                >
                  {icons.repo} {item.repo.name}
                </h4>
                <p style={{ fontSize: 14, color: '#cbd5e1' }}>{item.repo.description || 'No description provided.'}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{icons.clock} Created {getRepoAge(item.repo.created_at)}</span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {item.details.languages.length > 0
                      ? item.details.languages.map((lang, i) => (
                          <span key={i} style={{ background: '#334155', color: '#cbd5e1', padding: '4px 10px', borderRadius: 12, fontSize: 12 }}>
                            {icons.lang} {lang}
                          </span>
                        ))
                      : <span style={{ fontSize: 12, color: '#94a3b8' }}>No languages</span>
                    }
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15, fontSize: 13, color: '#cbd5e1', marginTop: 8 }}>
                  <span>{icons.star} {item.repo.stargazers_count} stars</span>
                  <span>{icons.fork} {item.repo.forks_count} forks</span>
                  <span>{icons.eye} {item.repo.watchers_count} watchers</span>
                  <span>{icons.bug} {item.details.issues} issues</span>
                  <span>{icons.pull} {item.details.pulls} PRs</span>
                </div>

                <a
                  href={item.repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: 10 }}
                >
                  {icons.link} View on GitHub
                </a>
              </div>
            </div>
          ))}
        </div>

        {loadingMore && <Loader />}
      </div>

      {/* Explore People */}
      <div style={{
        flex: '0 0 250px',
        minWidth: 220,
        background: '#1e293b',
        borderRadius: 16,
        padding: 16,
        height: 'fit-content',
      }}>
        <h3 style={{ color: '#f8fafc', marginBottom: 12 }}>Explore People</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {exploreUsers.length === 0 && <p style={{ color: '#94a3b8' }}>Nothing to show here...</p>}
          {exploreUsers.map((u, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                background: '#334155',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onClick={() => navigate(`/profile/${u.uname}`)}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#475569')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#334155')}
            >
              <img src={pfpic} alt={u.uname} style={{ width: 35, height: 35, borderRadius: '50%' }} />
              <span>@{u.uname}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
