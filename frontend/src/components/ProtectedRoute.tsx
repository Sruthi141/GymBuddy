import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    roles?: string[];
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // All users must verify email before full access (except verify-otp, reset-password, logout)
    if (!user.isEmailVerified && !location.pathname.startsWith('/verify-otp') && !location.pathname.startsWith('/reset-password')) {
        return <Navigate to={`/verify-otp?email=${encodeURIComponent(user.email)}`} replace />;
    }

    // Role check: if specific roles are required and user doesn't match
    if (roles && !roles.includes(user.role)) {
        if (user.role === 'gymOwner') {
            return <Navigate to="/owner/dashboard" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    // If no roles specified, block gymOwners from user-only routes
    if (!roles && user.role === 'gymOwner') {
        return <Navigate to="/owner/dashboard" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
