import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, userRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Determine home link based on user role
  const getHomeLink = () => {
    if (!user) return '/';
    if (user.isAdmin) return '/admin';
    if (userRole === 'buyer') return '/buyer';
    if (userRole === 'seller') return '/seller';
    return '/role-selection';
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={getHomeLink()} className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-cyan to-primary-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">PK</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-cyan to-primary-blue bg-clip-text text-transparent">
              PlotKart
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Home link - only show for non-logged in users */}
            {!user && (
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg transition-smooth ${
                  isActive('/') 
                    ? 'bg-primary-cyan text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Home
              </Link>
            )}

            {/* Admin - Full Access to Everything */}
            {user && user.isAdmin && (
              <>
                <Link
                  to="/buyer"
                  className={`px-4 py-2 rounded-lg transition-smooth ${
                    isActive('/buyer') 
                      ? 'bg-primary-cyan text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/browse-properties"
                  className={`px-4 py-2 rounded-lg transition-smooth ${
                    isActive('/browse-properties') 
                      ? 'bg-primary-cyan text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Browse Properties
                </Link>
                <Link
                  to="/seller/upload-property"
                  className={`px-4 py-2 rounded-lg transition-smooth ${
                    isActive('/seller/upload-property') 
                      ? 'bg-primary-cyan text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Upload Property
                </Link>
                <Link
                  to="/admin"
                  className={`px-4 py-2 rounded-lg transition-smooth ${
                    isActive('/admin') 
                      ? 'bg-primary-cyan text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Admin
                </Link>
              </>
            )}

            {/* Buyer Dashboard */}
            {user && !user.isAdmin && userRole === 'buyer' && (
              <>
                <Link
                  to="/buyer"
                  className={`px-4 py-2 rounded-lg transition-smooth ${
                    isActive('/buyer') 
                      ? 'bg-primary-cyan text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/browse-properties"
                  className={`px-4 py-2 rounded-lg transition-smooth ${
                    isActive('/browse-properties') 
                      ? 'bg-primary-cyan text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Browse Properties
                </Link>
              </>
            )}

            {/* Seller Dashboard */}
            {user && !user.isAdmin && userRole === 'seller' && (
              <>
                <Link
                  to="/seller"
                  className={`px-4 py-2 rounded-lg transition-smooth ${
                    isActive('/seller') 
                      ? 'bg-primary-cyan text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/seller/upload-property"
                  className={`px-4 py-2 rounded-lg transition-smooth ${
                    isActive('/seller/upload-property') 
                      ? 'bg-primary-cyan text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Upload Property
                </Link>
              </>
            )}

            {/* Profile - Now points to Role Selection */}
            {user && (
              <Link
                to="/role-selection"
                className={`px-4 py-2 rounded-lg transition-smooth ${
                  isActive('/role-selection') 
                    ? 'bg-primary-cyan text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Profile
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-cyan to-primary-blue rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-smooth"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-primary-blue border border-primary-blue rounded-lg hover:bg-primary-blue hover:text-white transition-smooth"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-primary-cyan to-primary-blue text-white rounded-lg hover:shadow-lg transition-smooth"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
