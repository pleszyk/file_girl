import { useLocation, Navigate, Outlet } from "react-router-dom"

const PrivateRoute = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const location = useLocation();

    return (
        isLoggedIn
            ? <Outlet />
            : <Navigate to="/login" state={{ from: location }} replace />
    );
};
export default PrivateRoute