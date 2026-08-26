import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="flex justify-center items-center h-screen text-soil-500 font-bold">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'Expert') return <Navigate to="/expert/dashboard" replace />;
    return <Navigate to={user.role === 'Farmer' ? '/farmer/dashboard' : '/buyer/dashboard'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
