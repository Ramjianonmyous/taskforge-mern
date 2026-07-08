export default function Modal({ children, onClose }) {
  return (
    <div className="modal-overlay show" onMouseDown={onClose}>
      <div className="modal-content" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
