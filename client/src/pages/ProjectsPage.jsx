import { useState } from 'react'
import api from '../services/api'
import Modal from '../components/Modal'
import './ProjectsPage.css'

export default function ProjectsPage({ user, projects, users, loading, onRefresh, showToast }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ongoing',
    startDate: '',
    endDate: '',
    members: [],
  })

  const [submitting, setSubmitting] = useState(false)
  const isAllowedToManage = user?.role === 'admin' || user?.role === 'manager'

  const handleOpenModal = () => {
    setIsModalOpen(true)
    setFormData({
      name: '',
      description: '',
      status: 'ongoing',
      startDate: '',
      endDate: '',
      members: [],
    })
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleMemberToggle = (userId) => {
    setFormData(prev => {
      const isSelected = prev.members.includes(userId)
      const updatedMembers = isSelected
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
      return { ...prev, members: updatedMembers }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.startDate || !formData.endDate) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/projects', formData)
      showToast('Project created successfully!', 'success')
      setIsModalOpen(false)
      onRefresh()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create project', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? Associated tasks will be unlinked.')) {
      return
    }

    try {
      await api.delete(`/projects/${projectId}`)
      showToast('Project deleted successfully', 'success')
      onRefresh()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete project', 'error')
    }
  }

  const handleStatusChange = async (project, newStatus) => {
    try {
      await api.put(`/projects/${project._id}`, { ...project, status: newStatus })
      showToast('Project status updated!', 'success')
      onRefresh()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update project status', 'error')
    }
  }

  const groupProjects = (status) => {
    return projects.filter(p => p.status === status)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getProgressStats = (projectTasks) => {
    if (!projectTasks || projectTasks.length === 0) return { total: 0, completed: 0, percent: 0 }
    const total = projectTasks.length
    const completed = projectTasks.filter(t => t.status === 'done').length
    const percent = Math.round((completed / total) * 100)
    return { total, completed, percent }
  }

  return (
    <div className="projects-page">
      <div className="projects-header">
        <div>
          <h1 className="page-title">Projects Board</h1>
          <p className="page-subtitle">Manage project pipelines, timelines, and user task allocations.</p>
        </div>
        {isAllowedToManage && (
          <button className="new-project-btn" onClick={handleOpenModal}>
            <i className="fa-solid fa-folder-plus"></i> New Project
          </button>
        )}
      </div>

      {loading && projects.length === 0 ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading projects...</p>
        </div>
      ) : (
        <div className="projects-board">
          {/* Upcoming Column */}
          <div className="projects-column upcoming">
            <div className="column-header">
              <span className="column-dot"></span>
              <h3>Upcoming</h3>
              <span className="column-count">{groupProjects('upcoming').length}</span>
            </div>
            <div className="column-cards">
              {groupProjects('upcoming').map(p => (
                <ProjectCard 
                  key={p._id} 
                  project={p} 
                  user={user}
                  onDelete={handleDeleteProject}
                  onStatusChange={handleStatusChange}
                  formatDate={formatDate}
                  getProgressStats={getProgressStats}
                  isAllowedToManage={isAllowedToManage}
                />
              ))}
              {groupProjects('upcoming').length === 0 && (
                <div className="empty-column-state">No upcoming projects</div>
              )}
            </div>
          </div>

          {/* Ongoing Column */}
          <div className="projects-column ongoing">
            <div className="column-header">
              <span className="column-dot"></span>
              <h3>Ongoing</h3>
              <span className="column-count">{groupProjects('ongoing').length}</span>
            </div>
            <div className="column-cards">
              {groupProjects('ongoing').map(p => (
                <ProjectCard 
                  key={p._id} 
                  project={p} 
                  user={user}
                  onDelete={handleDeleteProject}
                  onStatusChange={handleStatusChange}
                  formatDate={formatDate}
                  getProgressStats={getProgressStats}
                  isAllowedToManage={isAllowedToManage}
                />
              ))}
              {groupProjects('ongoing').length === 0 && (
                <div className="empty-column-state">No ongoing projects</div>
              )}
            </div>
          </div>

          {/* Completed Column */}
          <div className="projects-column completed">
            <div className="column-header">
              <span className="column-dot"></span>
              <h3>Completed</h3>
              <span className="column-count">{groupProjects('completed').length}</span>
            </div>
            <div className="column-cards">
              {groupProjects('completed').map(p => (
                <ProjectCard 
                  key={p._id} 
                  project={p} 
                  user={user}
                  onDelete={handleDeleteProject}
                  onStatusChange={handleStatusChange}
                  formatDate={formatDate}
                  getProgressStats={getProgressStats}
                  isAllowedToManage={isAllowedToManage}
                />
              ))}
              {groupProjects('completed').length === 0 && (
                <div className="empty-column-state">No completed projects</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {isModalOpen && (
        <Modal onClose={handleCloseModal} title="Create New Project">
          <form className="project-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Project Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Mobile App Launch"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe project deliverables..."
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Project Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Assign Members</label>
              <div className="members-selection">
                {users.map(u => (
                  <div 
                    key={u._id} 
                    className={`member-select-card ${formData.members.includes(u._id) ? 'selected' : ''}`}
                    onClick={() => handleMemberToggle(u._id)}
                  >
                    <div className="member-avatar" style={{ background: u.avatar }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="member-select-info">
                      <span className="member-select-name">{u.name}</span>
                      <span className="member-select-role">{u.role}</span>
                    </div>
                    <div className="member-select-checkbox">
                      {formData.members.includes(u._id) && <i className="fa-solid fa-circle-check"></i>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function ProjectCard({ project, onDelete, onStatusChange, formatDate, getProgressStats, isAllowedToManage, user }) {
  const [expanded, setExpanded] = useState(false)
  const { total, completed, percent } = getProgressStats(project.tasks)

  const displayTasks = project.tasks || [];

  return (
    <div className={`project-card ${project.status}`}>
      <div className="project-card-header">
        <h4 className="project-title">{project.name}</h4>
        {isAllowedToManage && (
          <div className="project-actions">
            <select 
              value={project.status} 
              onChange={(e) => onStatusChange(project, e.target.value)}
              className="status-select"
            >
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
            <button className="delete-proj-btn" onClick={() => onDelete(project._id)} title="Delete Project">
              <i className="fa-solid fa-trash-can"></i>
            </button>
          </div>
        )}
      </div>

      <p className="project-desc">{project.description}</p>

      <div className="project-timeline">
        <i className="fa-regular fa-calendar-days"></i>
        <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
      </div>

      <div className="project-progress-container">
        <div className="progress-label">
          <span>Task Progress</span>
          <span>{percent}% ({completed}/{total})</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
        </div>
      </div>

      <div className="project-members-avatars">
        {project.members && project.members.map(m => (
          <div 
            key={m._id} 
            className="proj-member-avatar" 
            style={{ background: m.avatar }}
            title={`${m.name} (${m.role})`}
          >
            {m.name.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>

      {/* Expandable Tasks Section */}
      <div className="project-tasks-toggle">
        <button className="toggle-tasks-btn" onClick={() => setExpanded(!expanded)}>
          <span>{expanded ? 'Hide Tasks' : 'Show Tasks'} ({displayTasks.length})</span>
          <i className={`fa-solid ${expanded ? 'fa-angle-up' : 'fa-angle-down'}`}></i>
        </button>
      </div>

      {expanded && (
        <div className="project-tasks-list">
          {displayTasks.length > 0 ? (
            displayTasks.map(t => (
              <div key={t._id} className={`proj-task-item ${t.status}`}>
                <div className="task-status-indicator">
                  {t.status === 'done' ? (
                    <i className="fa-solid fa-circle-check done-tick" title="Completed"></i>
                  ) : (
                    <i className="fa-regular fa-circle pending-circle" title={t.status}></i>
                  )}
                </div>
                <div className="task-details">
                  <div className="task-title-row">
                    <span className="task-name">{t.title}</span>
                    <span className={`priority-badge ${t.priority}`}>{t.priority}</span>
                  </div>
                  <div className="task-meta-row">
                    {t.assignee && (
                      <span className="task-assignee">
                        <i className="fa-regular fa-user"></i> {t.assignee.name}
                      </span>
                    )}
                    {t.dueDate && (
                      <span className="task-due">
                        <i className="fa-regular fa-clock"></i> {new Date(t.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-tasks-state">No tasks linked to this project</div>
          )}
        </div>
      )}
    </div>
  )
}
