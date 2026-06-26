import { useState } from 'react'
import api from '../services/api'
import './AuthPage.css'

export default function AuthPage({ onLogin, showToast }) {
  const [mode, setMode] = useState('login') // 'login' or 'register'
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'developer',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      })
      onLogin(res.data.token, res.data.user)
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      showToast('Name is required', 'error')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })
      onLogin(res.data.token, res.data.user)
      showToast('Account created successfully!', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-bg"></div>
      
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <i className="fa-solid fa-rocket"></i>
          </div>
          <h1>Task<span>Forge</span></h1>
        </div>
        <p className="auth-subtitle">Team Task Manager</p>

        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <div className="form-input-wrap">
                <input
                  type="email"
                  className="form-input"
                  placeholder="your@email.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <i className="fa-solid fa-envelope"></i>
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="form-input-wrap">
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <i className="fa-solid fa-lock"></i>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <span className="loading"></span> : <i className="fa-solid fa-arrow-right-to-bracket"></i>}
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <div className="form-input-wrap">
                <input
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <i className="fa-solid fa-user"></i>
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <div className="form-input-wrap">
                <input
                  type="email"
                  className="form-input"
                  placeholder="your@email.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <i className="fa-solid fa-envelope"></i>
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="form-input-wrap">
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <i className="fa-solid fa-lock"></i>
              </div>
            </div>

            <div className="form-group">
              <label>Role</label>
              <div className="form-input-wrap">
                <select
                  className="form-input"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="developer">Developer</option>
                  <option value="manager">Manager</option>
                  <option value="viewer">Viewer</option>
                </select>
                <i className="fa-solid fa-user-tag"></i>
                <span className="select-arrow"><i className="fa-solid fa-chevron-down"></i></span>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <span className="loading"></span> : <i className="fa-solid fa-user-plus"></i>}
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="auth-switch">
          {mode === 'login' ? (
            <>
              Don't have an account? <button 
                onClick={() => { setMode('register'); setFormData({ email: '', password: '', name: '', role: 'developer' }); }}
                className="auth-link"
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account? <button 
                onClick={() => { setMode('login'); setFormData({ email: '', password: '', name: '', role: 'developer' }); }}
                className="auth-link"
              >
                Login
              </button>
            </>
          )}
        </div>

        {/* Demo Accounts */}
        {mode === 'login' && (
          <div className="demo-accounts">
            <p className="demo-label">Demo accounts:</p>
            <div className="demo-buttons">
              <button 
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setFormData(prev => ({ ...prev, email: 'alex@taskforge.io', password: 'admin123' }))
                }}
              >
                Admin
              </button>
              <button 
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setFormData(prev => ({ ...prev, email: 'sarah@taskforge.io', password: 'pass123' }))
                }}
              >
                Manager
              </button>
              <button 
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setFormData(prev => ({ ...prev, email: 'james@taskforge.io', password: 'pass123' }))
                }}
              >
                Member
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
