import { Navigate } from "react-router-dom";

function LoggedOutRoute({ user, children }) {
  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default LoggedOutRoute;