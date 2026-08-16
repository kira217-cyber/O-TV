import { Navigate } from "react-router";
import { useSelector } from "react-redux";
import {
  selectPrivateAuth,
  selectIsPrivateAuthenticated,
} from "../features/privateAuth/privateAuthSelectors";

// An unauthenticated visitor to /private-video is sent straight to the
// private login page so they can sign in and land right back here.
const PrivateUserRoute = ({ children }) => {
  const { loading } = useSelector(selectPrivateAuth);
  const isAuthenticated = useSelector(selectIsPrivateAuthenticated);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111618]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#16d6dc] border-t-transparent"></div>
          <p className="text-lg font-medium text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/private-user-login" replace />;
  }

  return children;
};

export default PrivateUserRoute;
