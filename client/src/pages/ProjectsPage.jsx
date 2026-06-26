import { useState } from 'react'
import Modal from '../components/Modal'
import api from '../services/api'
import './ProjectsPage.css'

export default function ProjectsPage({ user, projects, users, loading, onProjectUpdate, showToast }) {
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    members: []
  })

  const isManagerOrAdmin = true // Removed restriction temporarily so anyone can edit

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project)
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        members: project.members.map(m => m._id || m)
      })
    } else {
      setEditingProject(null)
      setFormData({
        name: '',
        description: '',
        status: 'active',
        members: []
      })
    }
    setShowModal(true)
  }

  const handleMemberToggle = (userId) => {
    setFormData(prev => {
      const isMember = prev.members.includes(userId)
      if (isMember) {
        return { ...prev, members: prev.members.filter(id => id !== userId) }
      } else {
        return { ...prev, members: [...prev.members, userId] }
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name) return showToast('Project name is required', 'error')

    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject._id}`, formData)
        showToast('Project updated successfully')
      } else {
        await api.post('/projects', formData)
        showToast('Project created successfully')
      }
      setShowModal(false)
      onProjectUpdate()
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving project', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return
    try {
      await api.delete(`/projects/${id}`)
      showToast('Project deleted successfully')
      onProjectUpdate()
    } catch (err) {
      showToast(err.response?.data?.message || 'Error deleting project', 'error')
    }
  }

  const formatStatus = (status) => {
    return status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  if (loading && !projects.length) {
    return <div className="loading"></div>
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">Collaborate with your team on combined projects</p>
          </div>
          {isManagerOrAdmin && (
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              <i className="fa-solid fa-plus"></i> New Project
            </button>
          )}
        </div>
      </div>

      <div className="projects-grid">
        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
            <i className="fa-solid fa-folder-open" style={{ fontSize: '48px', marginBottom: '16px', display: 'block', opacity: 0.5 }}></i>
            <p>No projects found. Get started by creating a new team project.</p>
          </div>
        ) : (
          projects.map(project => (
            <div key={project._id} className="project-card">
              <div className="project-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '18px' }}>{project.name}</h3>
                <span className={`status-badge status-${project.status === 'active' ? 'in-progress' : project.status === 'completed' ? 'done' : 'todo'}`}>
                  {formatStatus(project.status)}
                </span>
              </div>
              <p className="project-description" style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', flexGrow: 1 }}>
                {project.description || 'No description provided.'}
              </p>
              
              <div className="project-members" style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>
                  Team Members ({project.members.length})
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {project.members.map(member => (
                    <div 
                      key={member._id} 
                      className="task-assignee-avatar"
                      style={{ background: member.avatar || 'var(--accent)', width: '32px', height: '32px', fontSize: '14px' }}
                      title={member.name}
                    >
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {project.members.length === 0 && <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No members added yet.</span>}
                </div>
              </div>

              {isManagerOrAdmin && (
                <div style={{ display: 'flex', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <button onClick={() => handleOpenModal(project)} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    <i className="fa-solid fa-pen"></i> Edit
                  </button>
                  <button onClick={() => handleDelete(project._id)} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center', color: 'var(--danger)' }}>
                    <i className="fa-solid fa-trash"></i> Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="modal-header">
            <h3>{editingProject ? 'Edit Project' : 'Create New Project'}</h3>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Project Name</label>
              <div className="form-input-wrap">
                <input 
                  type="text" 
                  className="form-input"
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Q3 Marketing Campaign"
                  required
                />
                <i className="fa-solid fa-pen"></i>
              </div>
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <div className="form-input-wrap">
                <input 
                  type="text"
                  className="form-input"
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="What is this project about?"
                />
                <i className="fa-solid fa-align-left"></i>
              </div>
            </div>

            <div className="form-group">
              <label>Status</label>
              <div className="form-input-wrap">
                <select 
                  className="form-input"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
                <i className="fa-solid fa-flag"></i>
                <span className="select-arrow"><i className="fa-solid fa-chevron-down"></i></span>
              </div>
            </div>

            <div className="form-group">
              <label>Project Members</label>
              <div className="members-selector">
                {users.map(u => (
                  <div 
                    key={u._id} 
                    className={`member-select-item ${formData.members.includes(u._id) ? 'selected' : ''}`}
                    onClick={() => handleMemberToggle(u._id)}
                  >
                    <div className="task-assignee-avatar" style={{ background: u.avatar || 'var(--accent)', width: '24px', height: '24px', fontSize: '12px' }}>
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <span>{u.name}</span>
                    {formData.members.includes(u._id) && <i className="fa-solid fa-check check-icon" style={{ color: 'var(--accent)' }}></i>}
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                <i className={editingProject ? 'fa-solid fa-save' : 'fa-solid fa-plus'}></i>
                {editingProject ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
