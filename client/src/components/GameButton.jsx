import { Link } from "react-router-dom";

const variantClasses = {
  primary: "farm-button-primary",
  secondary: "farm-button-secondary",
  danger: "farm-button-danger",
};

// Reusable themed button that can render as either a button or a React Router link.
function GameButton({
  children,
  className = "",
  to,
  variant = "primary",
  type = "button",
  ...props
}) {
  const buttonClass = `${variantClasses[variant] || variantClasses.primary} ${className}`;

  if (to) {
    return (
      <Link
        to={to}
        className={buttonClass}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={buttonClass}
      {...props}
    >
      {children}
    </button>
  );
}

export default GameButton;
