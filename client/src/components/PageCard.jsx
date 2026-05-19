import { Link } from "react-router-dom";

function PageCard({
  children,
  className = "",
  to,
  onClick,
  role,
  tabIndex,
  ...props
}) {
  const cardClass = `farm-card ${className}`;

  if (to) {
    return (
      <Link
        to={to}
        className={cardClass}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <div
      className={cardClass}
      onClick={onClick}
      role={role}
      tabIndex={tabIndex}
      {...props}
    >
      {children}
    </div>
  );
}

export default PageCard;
