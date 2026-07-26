import { Navigate, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { selectAuth, selectIsAuthenticated } from "../features/auth/authSelectors";

const PrivateRoute = ({ children }) => {
  const location = useLocation();

  const auth = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (auth?.loading) {
    return (
      <div className="min-h-screen bg-[#0b0e0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#f59e0b] border-t-transparent rounded-full animate-spin" />
          <p className="text-amber-200 text-lg font-medium">
            যাচাই করা হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default PrivateRoute;
