import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, User, LogOut, Menu, X, MessageSquare } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setMobileOpen(false);
    };

    const isActive = (path: string) => location.pathname === path;

    const navLinkClass = (path: string) =>
        `px-3 py-2 rounded-md font-medium transition-colors ${isActive(path) ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'}`;

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center text-blue-600 hover:text-blue-700">
                            <Stethoscope className="h-8 w-8 mr-2" />
                            <span className="font-bold text-xl">MediBook</span>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-2">
                        <Link to="/" className={navLinkClass('/')}>Home</Link>
                        <Link to="/doctors" className={navLinkClass('/doctors')}>Find Doctors</Link>

                        {user ? (
                            <>
                                <Link to="/dashboard" className={navLinkClass('/dashboard')}>Dashboard</Link>
                                <Link to="/messages" className={`${navLinkClass('/messages')} flex items-center`}>
                                    <MessageSquare className="h-4 w-4 mr-1" /> Messages
                                </Link>
                                <NotificationBell />
                                <Link to="/profile" className={`${navLinkClass('/profile')} flex items-center`}>
                                    <User className="h-4 w-4 mr-1" /> Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-md font-medium transition-colors ml-2"
                                >
                                    <LogOut className="h-4 w-4" /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md font-medium">
                                    Login
                                </Link>
                                <Link to="/register" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
                        >
                            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white">
                    <div className="px-4 py-3 space-y-1">
                        <Link to="/" onClick={() => setMobileOpen(false)} className={`${navLinkClass('/')} block`}>Home</Link>
                        <Link to="/doctors" onClick={() => setMobileOpen(false)} className={`${navLinkClass('/doctors')} block`}>Find Doctors</Link>

                        {user ? (
                            <>
                                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className={`${navLinkClass('/dashboard')} block`}>Dashboard</Link>
                                <Link to="/messages" onClick={() => setMobileOpen(false)} className={`${navLinkClass('/messages')} flex items-center`}>
                                    <MessageSquare className="h-4 w-4 mr-1" /> Messages
                                </Link>
                                <Link to="/profile" onClick={() => setMobileOpen(false)} className={`${navLinkClass('/profile')} flex items-center`}>
                                    <User className="h-4 w-4 mr-1" /> Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-2 rounded-md font-medium w-full text-left"
                                >
                                    <LogOut className="h-4 w-4" /> Logout
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-2 pt-2">
                                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-blue-600 px-3 py-2 rounded-md font-medium">
                                    Login
                                </Link>
                                <Link to="/register" onClick={() => setMobileOpen(false)} className="bg-blue-600 text-white text-center px-4 py-2 rounded-lg font-medium">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
