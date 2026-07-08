import { useState, useRef } from 'react'
import api from '../services/api'
import './AuthPage.css'

export default function AuthPage({ onLogin, showToast }) {
  const [mode, setMode] = useState('login') // 'login' or 'register'
  const [loading, setLoading] = useState(false)
  const [showMemberSelect, setShowMemberSelect] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'developer',
  })

  const [showPromptModal, setShowPromptModal] = useState(false)
  const [promptMessage, setPromptMessage] = useState('')
  const [promptError, setPromptError] = useState('')
  const [promptInput, setPromptInput] = useState('')
  const [promptAttempt, setPromptAttempt] = useState(1)
  
  const promptResolveRef = useRef(null)

  const [showAlertModal, setShowAlertModal] = useState(false)
  const [alertTitle, setAlertTitle] = useState('')
  const [alertMessage, setAlertMessage] = useState('')
  
  const alertResolveRef = useRef(null)

  const triggerCustomPrompt = (message, attemptNum, errorMsg = '') => {
    setPromptMessage(message)
    setPromptAttempt(attemptNum)
    setPromptError(errorMsg)
    setPromptInput('')
    setShowPromptModal(true)
    return new Promise((resolve) => {
      promptResolveRef.current = resolve
    })
  }

  const triggerCustomAlert = (title, message) => {
    setAlertTitle(title)
    setAlertMessage(message)
    setShowAlertModal(true)
    return new Promise((resolve) => {
      alertResolveRef.current = resolve
    })
  }

  const handlePromptSubmit = (e) => {
    e.preventDefault()
    if (!promptInput.trim()) return
    setShowPromptModal(false)
    if (promptResolveRef.current) {
      promptResolveRef.current(promptInput)
      promptResolveRef.current = null
    }
  }

  const handlePromptCancel = () => {
    setShowPromptModal(false)
    if (promptResolveRef.current) {
      promptResolveRef.current(null)
      promptResolveRef.current = null
    }
  }

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
      if (err.response?.status === 401 && err.response?.data?.requiresMasterPhrase) {
        let attempt = 1
        let phrase = ''
        let success = false
        let errorMsg = ''
        
        while (attempt <= 3 && !success) {
          let promptMessage = ""
          if (attempt === 1) {
            promptMessage = "🔑 Please enter the Master Security Phrase to authorize login access to this account:"
          } else if (attempt === 2) {
            promptMessage = "⚠️ WARNING: Incorrect phrase entered! This attempt has been logged. Please enter the correct Master Security Phrase:"
          } else {
            promptMessage = "🚨 FINAL ATTEMPT: One more incorrect entry will temporarily lock access. Enter the Master Security Phrase:"
          }
          
          phrase = await triggerCustomPrompt(promptMessage, attempt, errorMsg)
          
          if (phrase === null) {
            showToast('Verification cancelled', 'error')
            setLoading(false)
            return
          }
          
          try {
            const retryRes = await api.post('/auth/login', {
              email: formData.email,
              password: formData.password,
              masterPhrase: phrase,
            })
            onLogin(retryRes.data.token, retryRes.data.user)
            showToast('Access Granted!', 'success')
            success = true
          } catch (retryErr) {
            if (retryErr.response?.status === 401 && retryErr.response?.data?.requiresMasterPhrase) {
              if (attempt < 3) {
                errorMsg = `❌ Attempt ${attempt}/3 failed! Incorrect phrase.`
              } else {
                await triggerCustomAlert("ACCESS DENIED", "3 incorrect attempts! The security team has been notified. Nice try, hacker! 😉")
              }
              attempt++
            } else {
              showToast(retryErr.response?.data?.message || 'Verification failed', 'error')
              setLoading(false)
              return
            }
          }
        }
      } else {
        showToast(err.response?.data?.message || 'Login failed', 'error')
      }
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
                  setFormData(prev => ({ ...prev, email: 'alex@taskforge.io', password: 'admin123' }));
                  setShowMemberSelect(false);
                }}
              >
                Admin
              </button>
              <button 
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setFormData(prev => ({ ...prev, email: 'sarah@taskforge.io', password: 'pass123' }));
                  setShowMemberSelect(false);
                }}
              >
                Manager
              </button>
              <button 
                type="button"
                className={`btn btn-secondary btn-sm ${showMemberSelect ? 'active' : ''}`}
                onClick={() => {
                  setShowMemberSelect(!showMemberSelect);
                }}
              >
                Member {showMemberSelect ? '▲' : '▼'}
              </button>
            </div>

            {showMemberSelect && (
              <div className="demo-member-select" style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: 'var(--text-secondary)' }}>Select a Member user:</p>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', width: '100%' }}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, email: 'james@taskforge.io', password: 'pass123' }));
                    setShowMemberSelect(false);
                  }}
                >
                  <span>James Wilson</span> <span style={{ opacity: 0.6, fontSize: '11px' }}>james@taskforge.io</span>
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', width: '100%' }}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, email: 'priya@taskforge.io', password: 'pass123' }));
                    setShowMemberSelect(false);
                  }}
                >
                  <span>Priya Sharma</span> <span style={{ opacity: 0.6, fontSize: '11px' }}>priya@taskforge.io</span>
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', width: '100%' }}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, email: 'marcus@taskforge.io', password: 'pass123' }));
                    setShowMemberSelect(false);
                  }}
                >
                  <span>Marcus Lee</span> <span style={{ opacity: 0.6, fontSize: '11px' }}>marcus@taskforge.io</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showPromptModal && (
        <div className="custom-prompt-overlay" style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div className="custom-prompt-card" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
            width: '380px',
            boxShadow: 'var(--shadow)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: promptAttempt === 3 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(232, 93, 58, 0.15)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: promptAttempt === 3 ? 'var(--danger)' : 'var(--accent)'
              }}>
                <i className={promptAttempt === 3 ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-shield-halved'}></i>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Security Verification</h3>
            </div>
            
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
              {promptMessage}
            </p>

            {promptError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '6px',
                padding: '10px',
                color: '#f87171',
                fontSize: '12px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fa-solid fa-circle-xmark"></i>
                <span>{promptError}</span>
              </div>
            )}

            <form onSubmit={handlePromptSubmit}>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>Master Security Phrase</label>
                <div className="form-input-wrap">
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter security phrase"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    required
                    autoFocus
                  />
                  <i className="fa-solid fa-key"></i>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handlePromptCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Verify Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAlertModal && (
        <div className="custom-prompt-overlay" style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(15px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
        }}>
          <div className="custom-prompt-card" style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
            width: '380px',
            boxShadow: '0 10px 30px rgba(239, 68, 68, 0.2)',
            textAlign: 'center',
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'rgba(239, 68, 68, 0.15)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              color: 'var(--danger)',
              margin: '0 auto 16px auto'
            }}>
              <i className="fa-solid fa-circle-exclamation"></i>
            </div>
            
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--danger)' }}>{alertTitle}</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
              {alertMessage}
            </p>

            <button type="button" className="btn btn-primary" style={{ width: '100%', background: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => {
              setShowAlertModal(false);
              if (alertResolveRef.current) {
                alertResolveRef.current();
                alertResolveRef.current = null;
              }
            }}>
              Acknowledge
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
