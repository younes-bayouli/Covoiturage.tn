

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
	const { utilisateur, isLoggedIn } = useAuth();
	const location = useLocation();
	const loggingOut = localStorage.getItem("loggingout") === "true";

	if (!isLoggedIn && location.pathname !== "/login" && !loggingOut) {
		return <Navigate to="/login" replace />;
	} else if (loggingOut) {
		return <Navigate to="/" replace />;
	} else if (requiredRole && utilisateur?.role !== requiredRole) {
		console.log(utilisateur)
		return <Navigate to="/" replace />;
	}
	return <>{children}</>;
}