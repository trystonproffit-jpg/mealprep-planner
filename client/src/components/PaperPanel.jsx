function PaperPanel({ children, className = "" }) {
  return (
    <div className={`paper-panel ${className}`}>
      {children}
    </div>
  );
}

export default PaperPanel;
