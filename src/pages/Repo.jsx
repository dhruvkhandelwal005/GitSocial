import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Loader from '../components/Loader'

export default function Repo() {
  const { username, id } = useParams()
  const navigate = useNavigate()

  const [repo, setRepo] = useState(null)
  const [contributors, setContributors] = useState([])
  const [languages, setLanguages] = useState([])
  const [otherRepos, setOtherRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN
  const headers = GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365))
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  useEffect(() => {
    async function fetchRepoData() {
      try {
        const res = await fetch(`https://api.github.com/repositories/${id}`, { headers })
        if (!res.ok) throw new Error('Failed to fetch repository data')
        const data = await res.json()
        setRepo(data)

        const langRes = await fetch(data.languages_url, { headers })
        const langs = await langRes.json()
        setLanguages(Object.keys(langs))

        const contribRes = await fetch(data.contributors_url, { headers })
        const contribs = await contribRes.json()
        setContributors(contribs.slice(0, 6))

        const userReposRes = await fetch(`https://api.github.com/users/${data.owner.login}/repos`, { headers })
        const userRepos = await userReposRes.json()
        setOtherRepos(userRepos.filter((r) => r.id !== data.id))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchRepoData()
  }, [id])

  if (loading) return <Loader />
  if (error) return <p style={{ textAlign: 'center', marginTop: 40, color: '#f87171' }}>{error}</p>
  if (!repo) return <p style={{ textAlign: 'center', marginTop: 40 }}>No repository found.</p>

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#e2e8f0',
        paddingBottom: 80,
      }}
    >
      {/* Header */}
      <header
  style={{
    width: '100%',
    background: '#1e293b',
    borderBottom: '1px solid #334155',
    display: 'flex',
    justifyContent: 'center', // center content horizontally
    alignItems: 'center',
    padding: '14px 20px',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  }}
>
  <h2 style={{ fontSize: 18, fontWeight: '600', color: '#f8fafc' }}>
    {repo.name}
  </h2>
</header>


      {/* Repo Card */}
      <div
        style={{
          width: '92%',
          maxWidth: 700,
          background: '#1e293b',
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          marginTop: 30,
          overflow: 'hidden',
        }}
      >
        {/* Owner Info */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 15 }}>
          <img
            src={repo.owner?.avatar_url}
            alt={repo.owner?.login}
            style={{ width: 60, height: 60, borderRadius: '50%', border: '2px solid #475569' }}
          />
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: '600', color: '#f8fafc' }}>{repo.owner?.login}</h3>
            {repo.fork && <span style={{ fontSize: 13, color: '#fbbf24' }}>🍴 Forked Repository</span>}
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>Created {timeAgo(repo.created_at)}</p>
          </div>
        </div>

        {/* Description */}
        <div style={{ padding: '20px 24px' }}>
          <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>{repo.description || 'No description provided.'}</p>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 20,
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            {[
              { label: 'Stars', value: repo.stargazers_count, emoji: '⭐' },
              { label: 'Forks', value: repo.forks_count, emoji: '🍴' },
              { label: 'Issues', value: repo.open_issues_count, emoji: '🐛' },
              { label: 'Pulls', value: repo.forks_count, emoji: '🔀' },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  background: '#0f172a',
                  borderRadius: 10,
                  padding: '12px 0',
                  textAlign: 'center',
                  color: '#e2e8f0',
                }}
              >
                {s.emoji} {s.value}
                <br />
                <small style={{ color: '#94a3b8' }}>{s.label}</small>
              </div>
            ))}
          </div>

          {/* Languages */}
          {languages.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h4 style={{ marginBottom: 8, color: '#f8fafc' }}>Languages:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {languages.map((lang) => (
                  <span
                    key={lang}
                    style={{
                      background: '#334155',
                      color: '#cbd5e1',
                      padding: '6px 10px',
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contributors */}
          {contributors.length > 0 && (
            <div style={{ marginTop: 25 }}>
              <h4 style={{ marginBottom: 10, color: '#f8fafc' }}>Contributors:</h4>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {contributors.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      textAlign: 'center',
                      color: '#cbd5e1',
                      width: 60,
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/profile/${c.login}`)}
                  >
                    <img
                      src={c.avatar_url}
                      alt={c.login}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        border: '2px solid #475569',
                      }}
                    />
                    <div style={{ fontSize: 12, marginTop: 4 }}>{c.login}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GitHub Link */}
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'block',
              textAlign: 'center',
              marginTop: 25,
              background: '#3b82f6',
              color: '#fff',
              padding: '12px 0',
              borderRadius: 10,
              textDecoration: 'none',
              fontWeight: '600',
              transition: '0.2s',
            }}
            onMouseOver={(e) => (e.target.style.background = '#2563eb')}
            onMouseOut={(e) => (e.target.style.background = '#3b82f6')}
          >
            🔗 View on GitHub
          </a>
        </div>
      </div>

      {/* Explore More Repos */}
      {otherRepos.length > 0 && (
        <div style={{ width: '92%', maxWidth: 700, marginTop: 40 }}>
          <h3 style={{ marginBottom: 12, color: '#f8fafc' }}>Explore more from {repo.owner.login}</h3>
          <div
            style={{
              display: 'flex',
              overflowX: 'auto',
              gap: 16,
              paddingBottom: 10,
              scrollbarWidth: 'none',
            }}
          >
            {otherRepos.slice(0, 10).map((r) => (
              <div
                key={r.id}
                onClick={() => navigate(`/repo/${r.owner.login}/${r.id}`)}
                style={{
                  minWidth: 180,
                  background: '#334155',
                  borderRadius: 12,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  padding: 14,
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'transform 0.2s ease, background 0.2s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <h4 style={{ margin: 0, fontSize: 15, color: '#f1f5f9' }}>{r.name}</h4>
                <p style={{ fontSize: 12, color: '#cbd5e1', margin: '6px 0 0' }}>
                  ⭐ {r.stargazers_count} | 🍴 {r.forks_count}
                </p>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>🕒 {timeAgo(r.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
