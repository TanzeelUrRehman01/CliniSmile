import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../../store/authStore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const dashboardLink = () => {
    if (user?.role === 'doctor') return '/doctor/dashboard';
    if (user?.role === 'admin') return '/admin/dashboard';
    return '/patient/dashboard';
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">CliniSmile</div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/doctors" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Find Doctors
            </Link>
            <Link to="/#features" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Features
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link to="/doctors" className="text-gray-600 hover:text-primary text-sm font-medium transition-colors">Find Doctors</Link>
                <Link to={dashboardLink()} className="text-gray-600 hover:text-primary text-sm font-medium">Dashboard</Link>
                <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                  {/* Make the avatar clickable → goes to profile */}
                  <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">{user.full_name}</p>
                      <p className="text-xs text-primary capitalize">{user.role}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User size={16} className="text-primary" />
                    </div>
                  </Link>
                  <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register/patient"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 hover:text-gray-900"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/doctors"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Find Doctors
            </Link>
            <a
              href="/#features"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Features
            </a>

            <div className="border-t border-gray-200 pt-3 space-y-2">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.full_name}</p>
                      <p className="text-gray-500 text-xs capitalize">{user.role}</p>
                    </div>
                  </Link>
                  <Link
                    to={dashboardLink()}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 bg-primary text-white rounded-lg text-center font-medium"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-primary border border-primary rounded-lg text-center font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register/patient"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 bg-primary text-white rounded-lg text-center font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}