function WoodPanel({ children, className = "" }) {
  return (
    <div className={`wood-panel ${className}`}>
      {children}
    </div>
  );
}

export default WoodPanel;
