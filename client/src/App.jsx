import { useState, useEffect } from 'react'
import './App.css'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import TasksPage from './pages/TasksPage'
import TeamPage from './pages/TeamPage'
import UsersPage from './pages/UsersPage'
import ProjectsPage from './pages/ProjectsPage'
import Toast from './components/Toast'
import api from './services/api'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [toast, setToast] = useState(null)
  const [sidebar, setSidebar] = useState({ isOpen: true, isMobile: false })
  const [openTaskModal, setOpenTaskModal] = useState(false)
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      setIsAuthenticated(true)
      setCurrentUser(JSON.parse(user))
      loadData()
    }
  }, [])

  // Setup background polling for real-time sync
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      loadData(true)
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setSidebar(prev => ({
        ...prev,
        isMobile: window.innerWidth < 768,
        isOpen: window.innerWidth >= 768 ? prev.isOpen : false,
      }))
    }
    
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    try {
      const [usersRes, tasksRes, statsRes, projectsRes] = await Promise.all([
        api.get('/users'),
        api.get('/tasks'),
        api.get('/tasks/stats/overview'),
        api.get('/projects'),
      ])
      setUsers(usersRes.data)
      setTasks(tasksRes.data)
      setStats(statsRes.data)
      setProjects(projectsRes.data)
    } catch (err) {
      if (!isSilent) showToast(err.response?.data?.message || 'Error loading data', 'error')
    } finally {
      if (!isSilent) setLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setIsAuthenticated(true)
    setCurrentUser(user)
    setCurrentPage('dashboard')
    loadData()
    showToast('Login successful!')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setCurrentUser(null)
    setCurrentPage('dashboard')
    showToast('Logged out successfully')
  }

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} showToast={showToast} />
  }

  return (
    <div className="app-container">
      <div className={`sidebar ${sidebar.isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <i className="fa-solid fa-rocket"></i>
            </div>
            <h2>TaskForge</h2>
          </div>
          {sidebar.isMobile && (
            <button 
              className="sidebar-toggle-close"
              onClick={() => setSidebar(prev => ({ ...prev, isOpen: false }))}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-label">MAIN</div>
          <button
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setCurrentPage('dashboard'); setSidebar(prev => ({ ...prev, isOpen: !prev.isMobile })); }}
          >
            <i className="fa-solid fa-chart-line"></i>
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-item ${currentPage === 'tasks' ? 'active' : ''}`}
            onClick={() => { setCurrentPage('tasks'); setSidebar(prev => ({ ...prev, isOpen: !prev.isMobile })); }}
          >
            <i className="fa-solid fa-list-check"></i>
            <span>Tasks</span>
          </button>
          <button
            className={`nav-item ${currentPage === 'projects' ? 'active' : ''}`}
            onClick={() => { setCurrentPage('projects'); setSidebar(prev => ({ ...prev, isOpen: !prev.isMobile })); }}
          >
            <i className="fa-solid fa-diagram-project"></i>
            <span>Projects</span>
          </button>

          <div className="sidebar-label">MANAGEMENT</div>
          <button
            className={`nav-item ${currentPage === 'team' ? 'active' : ''}`}
            onClick={() => { setCurrentPage('team'); setSidebar(prev => ({ ...prev, isOpen: !prev.isMobile })); }}
          >
            <i className="fa-solid fa-people-group"></i>
            <span>Team</span>
          </button>
          {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
            <button
              className="nav-item"
              onClick={() => { setCurrentPage('tasks'); setOpenTaskModal(true); setSidebar(prev => ({ ...prev, isOpen: !prev.isMobile })); }}
            >
              <i className="fa-solid fa-plus"></i>
              <span>New Task</span>
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <>
              <div className="sidebar-label">ADMIN</div>
              <button
                className={`nav-item ${currentPage === 'users' ? 'active' : ''}`}
                onClick={() => { setCurrentPage('users'); setSidebar(prev => ({ ...prev, isOpen: !prev.isMobile })); }}
              >
                <i className="fa-solid fa-user-gear"></i>
                <span>User Management</span>
              </button>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="user-badge" style={{ gap: '10px' }}>
              <div className="user-avatar" style={{ background: currentUser?.avatar || 'var(--accent)' }}>
                {currentUser?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div className="user-name" style={{ fontSize: '14px', lineHeight: '1.2' }}>{currentUser?.name}</div>
                <div className="user-role" style={{ fontSize: '11px', textTransform: 'capitalize' }}>{currentUser?.role}</div>
              </div>
            </div>
            <button className="sidebar-logout-btn" onClick={handleLogout} title="Logout">
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="main-content">
        {sidebar.isMobile && (
          <div className="top-bar">
            <button 
              className="sidebar-toggle"
              onClick={() => setSidebar(prev => ({ ...prev, isOpen: !prev.isOpen }))}
              style={{ display: 'block' }}
            >
              <i className="fa-solid fa-bars"></i>
            </button>
          </div>
        )}

        <div className="page-container">
          {currentPage === 'dashboard' && (
            <Dashboard 
              user={currentUser}
              stats={stats}
              users={users}
              tasks={tasks}
              loading={loading}
              onRefresh={loadData}
            />
          )}
          {currentPage === 'projects' && (
            <ProjectsPage 
              user={currentUser}
              projects={projects}
              users={users}
              loading={loading}
              onRefresh={loadData}
              showToast={showToast}
            />
          )}
          {currentPage === 'tasks' && (
            <TasksPage 
              user={currentUser} 
              tasks={tasks} 
              users={users} 
              projects={projects}
              loading={loading} 
              onTaskUpdate={loadData} 
              showToast={showToast} 
              forceOpenModal={openTaskModal} 
              onCloseModal={() => setOpenTaskModal(false)} 
            />
          )}
          {currentPage === 'team' && (
            <TeamPage 
              users={users}
              tasks={tasks}
            />
          )}
          {currentPage === 'users' && currentUser?.role === 'admin' && (
            <UsersPage 
              users={users}
              tasks={tasks}
              onUserUpdate={loadData}
              showToast={showToast}
            />
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}

export default App
