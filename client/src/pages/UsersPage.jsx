import { useState } from 'react'
import api from '../services/api'
import Modal from '../components/Modal'

export default function UsersPage({ users, tasks, onUserUpdate, showToast }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getTaskCount = (userId) => {
    return tasks.filter(t => t.assignee._id === userId).length
  }

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`)
      showToast('User removed successfully')
      setDeleteConfirm(null)
      onUserUpdate()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove user', 'error')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Users</h1>
        <p className="page-subtitle">Manage team members and their roles</p>
      </div>

      <div style={{ marginBottom: '20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
        {users.length} registered users
      </div>

      <div className="tasks-list">
        {users.map(user => (
          <div key={user._id} className="task-card" style={{ gridTemplateColumns: 'auto 1fr auto auto auto' }}>
            <div className="task-assignee-avatar" style={{ background: user.avatar || '#e85d3a', width: '40px', height: '40px', borderRadius: '10px', fontSize: '14px' }}>
              {getInitials(user.name)}
            </div>
            <div className="task-body">
              <h4>{user.name}</h4>
              <div className="task-meta">
                <span><i className="fa-solid fa-envelope"></i> {user.email}</span>
                <span><i className="fa-regular fa-calendar"></i> Joined {user.createdAt}</span>
              </div>
            </div>
            <span className={`role-badge role-${user.role}`} style={{ margin: 0 }}>
              {user.role}
            </span>
            <div style={{ textAlign: 'center', minWidth: '60px' }}>
              <div style={{ fontFamily: "'Space Grotesk'", fontWeight: '700', fontSize: '18px' }}>
                {getTaskCount(user._id)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>tasks</div>
            </div>
            <div className="task-actions">
              <button
                className="btn-icon"
                title="Delete user"
                onClick={() => setDeleteConfirm(user)}
                style={{ color: 'var(--danger)' }}
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {deleteConfirm && (
        <Modal onClose={() => setDeleteConfirm(null)}>
          <div className="modal-header">
            <h3>Remove User</h3>
            <button className="modal-close" onClick={() => setDeleteConfirm(null)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <p className="confirm-text">
            Are you sure you want to remove <strong>{deleteConfirm.name}</strong>? 
            Their assigned tasks will be unassigned. This cannot be undone.
          </p>
          <div className="modal-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </button>
            <button 
              className="btn btn-danger btn-sm"
              onClick={() => handleDeleteUser(deleteConfirm._id)}
            >
              <i className="fa-solid fa-trash-can"></i> Remove
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
