import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'
import './Dashboard.css'

export default function Dashboard({ user, stats, users, tasks, loading, onRefresh }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const barChartRef = useRef(null)
  const barChartInstance = useRef(null)

  useEffect(() => {
    if (!stats) return

    // Destroy existing charts
    if (chartInstance.current) chartInstance.current.destroy()
    if (barChartInstance.current) barChartInstance.current.destroy()

    // Create Pie Chart (Tasks by Status)
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d')
      const todo = stats.todoTasks || 0
      const inProgress = stats.inProgressTasks || 0
      const inReview = stats.inReviewTasks || 0
      const done = stats.completedTasks || 0
      
      chartInstance.current = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['To Do', 'In Progress', 'In Review', 'Done'],
          datasets: [{
            data: [todo, inProgress, inReview, done],
            backgroundColor: [
              'rgba(90, 89, 106, 0.8)',
              'rgba(96, 165, 250, 0.8)',
              'rgba(167, 139, 250, 0.8)',
              'rgba(52, 211, 153, 0.8)'
            ],
            borderColor: 'var(--bg-card)',
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#e2e8f0',
                font: { family: "'DM Sans', sans-serif", size: 12 },
                padding: 20,
              },
            },
          },
        },
      })
    }

    // Create Bar Chart (Tasks by Status)
    if (barChartRef.current) {
      const barCtx = barChartRef.current.getContext('2d')
      const todo = stats.todoTasks || 0
      const inProgress = stats.inProgressTasks || 0
      const inReview = stats.inReviewTasks || 0
      const done = stats.completedTasks || 0

      barChartInstance.current = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: ['To Do', 'In Progress', 'In Review', 'Done'],
          datasets: [{
            label: 'Tasks',
            data: [todo, inProgress, inReview, done],
            backgroundColor: [
              'rgba(90, 89, 106, 0.8)',
              'rgba(96, 165, 250, 0.8)',
              'rgba(167, 139, 250, 0.8)',
              'rgba(52, 211, 153, 0.8)'
            ],
            borderColor: [
              '#5a596a',
              '#60a5fa',
              '#a78bfa',
              '#34d399'
            ],
            borderWidth: 1,
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1, color: '#94a3b8' },
              grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            x: {
              ticks: { color: '#94a3b8' },
              grid: { display: false }
            }
          }
        }
      })
    }

    return () => {
      if (chartInstance.current) chartInstance.current.destroy()
      if (barChartInstance.current) barChartInstance.current.destroy()
    }
  }, [stats])

  if (loading) {
    return <div className="loading"></div>
  }

  const completionRate = stats?.completionRate || 0
  const totalTasks = stats?.totalTasks || 0
  const completedTasks = stats?.completedTasks || 0
  const inProgressTasks = stats?.inProgressTasks || 0
  const inReviewTasks = stats?.inReviewTasks || 0
  const todoTasks = stats?.todoTasks || 0

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name}! Here's what's happening with your tasks.</p>
      </div>

      <div className="dashboard-bento">
        {/* Total Tasks */}
        <div className="dashboard-card dashboard-card-accent col-span-3">
          <div className="dashboard-header-flex">
            <div className="dashboard-stat-label">Total Tasks</div>
            <div className="dashboard-stat-icon icon-accent">
              <i className="fa-solid fa-layer-group"></i>
            </div>
          </div>
          <div className="dashboard-stat-value">{totalTasks}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>All time tasks</div>
        </div>

        {/* Completed */}
        <div className="dashboard-card dashboard-card-success col-span-3">
          <div className="dashboard-header-flex">
            <div className="dashboard-stat-label">Completed</div>
            <div className="dashboard-stat-icon icon-success">
              <i className="fa-solid fa-circle-check"></i>
            </div>
          </div>
          <div className="dashboard-stat-value">{completedTasks}</div>
          <div style={{ fontSize: '12px', color: 'var(--success)' }}>
            <i className="fa-solid fa-arrow-up"></i> {totalTasks > 0 ? Math.round((completedTasks/totalTasks)*100) : 0}% completion
          </div>
        </div>

        {/* In Progress */}
        <div className="dashboard-card dashboard-card-info col-span-3">
          <div className="dashboard-header-flex">
            <div className="dashboard-stat-label">In Progress</div>
            <div className="dashboard-stat-icon icon-info">
              <i className="fa-solid fa-spinner"></i>
            </div>
          </div>
          <div className="dashboard-stat-value">{inProgressTasks}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Actively worked on</div>
        </div>

        {/* Completion Rate */}
        <div className="dashboard-card dashboard-card-warning col-span-3">
          <div className="dashboard-header-flex">
            <div className="dashboard-stat-label">Velocity</div>
            <div className="dashboard-stat-icon icon-warning">
              <i className="fa-solid fa-bolt"></i>
            </div>
          </div>
          <div className="dashboard-stat-value">{completionRate}%</div>
          <div className="dashboard-progress">
            <div className="dashboard-progress-bar" style={{ width: `${completionRate}%`, background: 'var(--warning)' }}></div>
          </div>
        </div>

        {/* Pie Chart (Status Breakdown) */}
        <div className="dashboard-card col-span-4">
          <h3 className="chart-title">Status Breakdown</h3>
          <div className="dashboard-chart-wrap">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

        {/* Bar Chart (Task Distribution) */}
        <div className="dashboard-card col-span-8">
          <h3 className="chart-title">Task Distribution</h3>
          <div className="dashboard-chart-wrap">
            <canvas ref={barChartRef}></canvas>
          </div>
        </div>

        {/* Team Overview */}
        <div className="dashboard-card col-span-12" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center' }}>
          <h3 className="chart-title" style={{ width: '100%', marginBottom: '24px', textAlign: 'center' }}>Team Overview</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '200px', marginBottom: '16px' }}>
            <div className="dashboard-stat-icon icon-accent">
              <i className="fa-solid fa-users"></i>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1', fontFamily: "'Space Grotesk', sans-serif" }}>{users.length}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Members</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '200px', marginBottom: '16px' }}>
            <div className="dashboard-stat-icon icon-info">
              <i className="fa-solid fa-list-check"></i>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1', fontFamily: "'Space Grotesk', sans-serif" }}>{inProgressTasks + todoTasks + inReviewTasks}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Active Tasks</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '200px', marginBottom: '16px' }}>
            <div className="dashboard-stat-icon icon-success">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1', fontFamily: "'Space Grotesk', sans-serif" }}>
                {users.length > 0 ? (totalTasks / users.length).toFixed(1) : 0}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Avg Tasks / Member</div>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="dashboard-card col-span-12">
          <h3 className="chart-title">Status Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>To Do</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>{todoTasks}</div>
            </div>
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>In Review</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--warning)', fontFamily: "'Space Grotesk', sans-serif" }}>{inReviewTasks}</div>
            </div>
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>Completed</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--success)', fontFamily: "'Space Grotesk', sans-serif" }}>{completedTasks}</div>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="dashboard-card col-span-12">
          <h3 className="chart-title">Tasks Directory</h3>
          <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '400px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-input)', zIndex: 1 }}>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Task</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Priority</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {tasks && tasks.map(task => (
                  <tr key={task._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '16px', color: 'var(--text-primary)', fontWeight: '500' }}>{task.title}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        background: task.status === 'done' ? 'var(--success-bg)' : task.status === 'in-review' ? 'var(--warning-bg)' : task.status === 'in-progress' ? 'var(--info-bg)' : 'rgba(255,255,255,0.05)',
                        color: task.status === 'done' ? 'var(--success)' : task.status === 'in-review' ? 'var(--warning)' : task.status === 'in-progress' ? 'var(--info)' : 'var(--text-secondary)',
                        fontWeight: '600'
                      }}>
                        {task.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        color: task.priority === 'high' ? 'var(--danger)' : task.priority === 'medium' ? 'var(--warning)' : 'var(--success)',
                        fontWeight: '600'
                      }}>
                        {task.priority.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!tasks || tasks.length === 0) && (
                  <tr>
                    <td colSpan="4" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>No tasks found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
