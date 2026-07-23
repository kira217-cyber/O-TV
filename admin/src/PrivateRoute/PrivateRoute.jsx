import { Navigate, useLocation } from "react-router";
import { useSelector } from "react-redux";
import {
  selectAuth,
  selectIsAuthenticated,
} from "../features/auth/authSelectors";

const PrivateRoute = ({ children, motherOnly = false, permKey = null }) => {
  const location = useLocation();

  const auth = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const loading = auth?.loading;
  const role = auth?.admin?.role;
  const permissions = auth?.admin?.permissions || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
          <p className="text-violet-200 text-lg font-medium">যাচাই করা হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (motherOnly) {
    return role === "mother" ? children : <Navigate to="/" replace />;
  }

  if (role === "mother") {
    return children;
  }

  if (!permKey) {
    return children;
  }

  if (!permissions.includes(permKey)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
