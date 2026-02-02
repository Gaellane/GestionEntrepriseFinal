// components/routes/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { canAccessRoute } from '../config/sideBarConfig';

/**
 * Route protégée qui vérifie l'accès basé sur la config du sidebar
 */
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // 1. Vérifier l'authentification
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
/// adino le '/' fa lasa unhaurized fona
  if(location.pathname === "/"){
    return <Navigate to="/home" state={{ from: location }} replace />;
  }
  
  // 2. Vérifier si la route actuelle est accessible
  const currentPath = location.pathname;
  const hasAccess = canAccessRoute(currentPath, user);

  console.log("hasAccess: ",hasAccess);
  console.log("user: ",user);

  if (!hasAccess) {
    // Rediriger vers une page d'erreur ou le dashboard
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  
  // 3. Accès accordé
  return children;
};

export default ProtectedRoute;