import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, User, LogOut } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center text-blue-600 hover:text-blue-700">
                            <Stethoscope className="h-8 w-8 mr-2" />
                            <span className="font-bold text-xl">MediBook</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">
                            Home
                        </Link>
                        <Link to="/doctors" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">
                            Find Doctors
                        </Link>

                        {user ? (
                            <div className="flex items-center space-x-4">
                                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                                    Dashboard
                                </Link>
                                <Link to="/profile" className="flex items-center hover:text-blue-600">
                                    <User className="h-5 w-5 mr-1" />
                                    <span className="mr-4">Profile</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center text-red-600 hover:text-red-700"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link
                                    to="/login"
                                    className="text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md font-medium transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
