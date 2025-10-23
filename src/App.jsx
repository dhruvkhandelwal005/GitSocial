import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import Username from './components/Username'
import Home from './pages/Home'
import Repo from './pages/Repo'
import Loader from './components/Loader'
import Profile from './pages/Profile'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user exists in localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setLoading(false)
      return
    }

    // Otherwise, check Supabase session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const u = { email: data.session.user.email, loggedIn: true }
        setUser(u)
        localStorage.setItem('user', JSON.stringify(u))
      }
      setLoading(false)
    })

    // Realtime auth listener
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = { email: session.user.email, loggedIn: true }
        setUser(u)
        localStorage.setItem('user', JSON.stringify(u))
      } else {
        setUser(null)
        localStorage.removeItem('user')
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    localStorage.removeItem('user')
  }

  if (loading) return <Loader />

  return (
    <BrowserRouter>
      <Routes>
        {/* / route */}
        <Route
          path="/"
          element={
            user?.loggedIn
              ? user?.username
                ? <Navigate to="/home" />
                : <Navigate to="/username" />
              : <Auth setUser={setUser} />
          }
        />

        {/* /username route */}
        <Route
          path="/username"
          element={
            user?.loggedIn
              ? user?.username
                ? <Navigate to="/home" />
                : <Username user={user} setUser={setUser} />
              : <Navigate to="/" />
          }
        />

        {/* /home route */}
        <Route
          path="/home"
          element={
            user?.loggedIn
              ? user?.username
                ? <Home user={user} logout={logout} />
                : <Navigate to="/username" />
              : <Navigate to="/" />
          }
        />
    <Route path="/profile" element={user?.loggedIn ?<Profile user={user} logout={logout} />:<Navigate to="/" />}/>
    <Route path="/profile/:username" element={user?.loggedIn ?<Profile user={user} logout={logout} />:<Navigate to="/" />} />
    <Route path="/repo/:username/:id" element={<Repo/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
