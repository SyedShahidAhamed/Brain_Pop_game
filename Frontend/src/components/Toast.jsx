function Toast({ message, type }) {
  if (!message) return null;

  return (
    <div className={`toast toast-${type}`} role="status">
      {message}
    </div>
  );
}

export default Toast;
