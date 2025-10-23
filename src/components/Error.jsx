import { useNavigate } from 'react-router-dom'

export default function Error({ message = 'Something went wrong!', details, logout }) {
  const navigate = useNavigate()

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        color: '#333',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <h1 style={{ fontSize: '2.5rem', color: '#e11d48' }}>⚠️ Error</h1>
      <p style={{ fontSize: '1.2rem', marginTop: '10px' }}>{message}</p>

      {details && (
        <pre
          style={{
            background: '#fff',
            padding: '10px 15px',
            borderRadius: '8px',
            marginTop: '15px',
            maxWidth: '600px',
            textAlign: 'left',
            fontSize: '0.9rem',
            color: '#555',
            overflowX: 'auto',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
        >
          {details}
        </pre>
      )}

      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1rem',
        }}
      >
        Go Home
      </button>
      <button
        onClick={logout}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1rem',
        }}
      >
        Logout
      </button>
    </div>
  )
}
