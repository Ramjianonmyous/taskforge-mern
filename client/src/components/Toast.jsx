export default function Toast({ message, type = 'success' }) {
  return (
    <div className={`toast ${type}`}>
      <span className="toast-icon">
        {type === 'success' ? (
          <i className="fa-solid fa-check-circle"></i>
        ) : (
          <i className="fa-solid fa-exclamation-circle"></i>
        )}
      </span>
      <span>{message}</span>
    </div>
  )
}
