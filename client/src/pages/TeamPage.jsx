export default function TeamPage({ users, tasks }) {
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getTaskCount = (userId) => {
    return tasks.filter(t => t.assignee._id === userId).length
  }

  const getDoneCount = (userId) => {
    return tasks.filter(t => t.assignee._id === userId && t.status === 'done').length
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Team</h1>
        <p className="page-subtitle">View team members and their task statistics</p>
      </div>

      <div className="team-grid">
        {users.map(user => (
          <div key={user._id} className="team-card">
            <div className="team-avatar" style={{ background: user.avatar || '#e85d3a' }}>
              {getInitials(user.name)}
            </div>
            <h4>{user.name}</h4>
            <div className="email">{user.email}</div>
            <span className={`role-badge role-${user.role}`}>{user.role}</span>
            <div className="team-stats">
              <div>
                <strong>{getTaskCount(user._id)}</strong>
                Assigned
              </div>
              <div>
                <strong>{getDoneCount(user._id)}</strong>
                Done
              </div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
          <i className="fa-solid fa-people-group" style={{ fontSize: '48px', marginBottom: '16px', display: 'block', opacity: 0.5 }}></i>
          <p>No team members found</p>
        </div>
      )}
    </div>
  )
}
