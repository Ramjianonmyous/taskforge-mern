import { useState, useEffect } from 'react'
import api from '../services/api'
import Modal from '../components/Modal'

export default function TasksPage({ user, tasks, users, projects = [], loading, onTaskUpdate, showToast, forceOpenModal, onCloseModal }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' or 'edit'
  const [editingTask, setEditingTask] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignee: '',
    project: '',
  })

  const filteredTasks = tasks.filter(task => {
    // If the logged-in user is a developer or member, restrict list to their own tasks
    const isDeveloperOrMember = user?.role === 'developer' || user?.role === 'member'
    if (isDeveloperOrMember) {
      const assigneeId = task.assignee?._id || task.assignee
      if (assigneeId !== user?._id) {
        return false
      }
    }

    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleOpenCreateModal = () => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    const defaultDate = d.toISOString().split('T')[0]
    
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: defaultDate,
      assignee: '',
      project: '',
    })
    setModalMode('create')
    setShowModal(true)
  }

  useEffect(() => {
    if (forceOpenModal) {
      handleOpenCreateModal()
      if (onCloseModal) onCloseModal() // reset the flag after opening
    }
  }, [forceOpenModal, onCloseModal])

  const handleOpenEditModal = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate.split('T')[0],
      assignee: task.assignee?._id || task.assignee || '',
      project: task.project?._id || task.project || '',
    })
    setModalMode('edit')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      showToast('Title is required', 'error')
      return
    }

    if (!formData.assignee) {
      showToast('Please select an assignee', 'error')
      return
    }

    try {
      const payload = {
        ...formData,
        project: formData.project || null,
      }
      if (modalMode === 'create') {
        await api.post('/tasks', {
          ...payload,
          createdBy: user._id,
          status: 'todo',
        })
        showToast('Task created successfully!')
      } else {
        await api.put(`/tasks/${editingTask._id}`, payload)
        showToast('Task updated successfully!')
      }
      setShowModal(false)
      onTaskUpdate()
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error')
    }
  }

  const handleChangeStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus })
      showToast(`Task moved to ${formatStatus(newStatus)}`)
      onTaskUpdate()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    
    try {
      await api.delete(`/tasks/${taskId}`)
      showToast('Task deleted successfully')
      onTaskUpdate()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete task', 'error')
    }
  }

  const formatStatus = (status) => {
    return status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  if (loading) {
    return <div className="loading"></div>
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">Tasks</h1>
            <p className="page-subtitle">Manage and track all your team tasks</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <button className="btn btn-primary" onClick={handleOpenCreateModal}>
              <i className="fa-solid fa-plus"></i> New Task
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'end' }}>
        <div className="search-container">
          <div className="form-input-wrap">
            <input
              type="text"
              className="form-input"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fa-solid fa-search"></i>
          </div>
        </div>
        <select 
          className="form-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: '150px' }}
        >
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="in-review">In Review</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Tasks List */}
      <div className="tasks-list">
        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
            <i className="fa-solid fa-inbox" style={{ fontSize: '48px', marginBottom: '16px', display: 'block', opacity: 0.5 }}></i>
            <p>No tasks found</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task._id} className="task-card">
              <div className="task-assignee-avatar" style={{ background: task.assignee?.avatar || '#e85d3a' }}>
                {task.assignee?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="task-body">
                <h4>{task.title}</h4>
                <div className="task-meta">
                  <span><i className="fa-solid fa-user"></i> {task.assignee?.name}</span>
                  <span><i className="fa-regular fa-calendar"></i> {new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`priority-badge priority-${task.priority}`}>
                  {task.priority}
                </span>
                <span className={`status-badge status-${task.status}`}>
                  {formatStatus(task.status)}
                </span>
              </div>
              <div className="task-actions">
                <select
                  className="form-input"
                  style={{ width: '120px', fontSize: '12px' }}
                  value={task.status}
                  onChange={(e) => handleChangeStatus(task._id, e.target.value)}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="in-review">In Review</option>
                  <option value="done">Done</option>
                </select>
                {(user?.role === 'admin' || user?.role === 'manager') && (
                  <button 
                    className="btn-icon"
                    title="Edit"
                    onClick={() => handleOpenEditModal(task)}
                  >
                    <i className="fa-solid fa-edit"></i>
                  </button>
                )}
                {(user?.role === 'admin' || user?.role === 'manager') && (
                  <button
                    className="btn-icon"
                    title="Delete"
                    onClick={() => handleDeleteTask(task._id)}
                    style={{ color: 'var(--danger)' }}
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="modal-header">
            <h3>{modalMode === 'create' ? 'Create New Task' : 'Edit Task'}</h3>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Task Title</label>
              <div className="form-input-wrap">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter task title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
                  placeholder="Brief description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
                <i className="fa-solid fa-align-left"></i>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Priority</label>
                <div className="form-input-wrap">
                  <select
                    className="form-input"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <i className="fa-solid fa-flag"></i>
                  <span className="select-arrow"><i className="fa-solid fa-chevron-down"></i></span>
                </div>
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <div className="form-input-wrap">
                  <input
                    type="date"
                    className="form-input"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    required
                  />
                  <i className="fa-regular fa-calendar"></i>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Assign To</label>
              <div className="form-input-wrap">
                <select
                  className="form-input"
                  value={formData.assignee}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
                  required
                >
                  <option value="">-- Select Member --</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
                <i className="fa-solid fa-user"></i>
                <span className="select-arrow"><i className="fa-solid fa-chevron-down"></i></span>
              </div>
            </div>

            <div className="form-group">
              <label>Project (Optional)</label>
              <div className="form-input-wrap">
                <select
                  className="form-input"
                  value={formData.project}
                  onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                >
                  <option value="">-- No Project (Ad-hoc Task) --</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <i className="fa-solid fa-diagram-project"></i>
                <span className="select-arrow"><i className="fa-solid fa-chevron-down"></i></span>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                <i className={modalMode === 'create' ? 'fa-solid fa-plus' : 'fa-solid fa-save'}></i>
                {modalMode === 'create' ? 'Create Task' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
