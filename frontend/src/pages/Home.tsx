import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Shield } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-16 pb-16">
            {/* Hero Section */}
            <section className="relative bg-blue-600 text-white py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Your Health, Our Priority
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-blue-100">
                        Book appointments with the best doctors in your city instantly.
                    </p>
                    <div className="max-w-2xl mx-auto bg-white rounded-lg p-2 flex items-center shadow-lg">
                        <Search className="h-6 w-6 text-gray-400 ml-3" />
                        <input
                            type="text"
                            placeholder="Search doctors, specialities, symptoms..."
                            className="flex-1 p-3 outline-none text-gray-800"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    navigate(`/doctors?query=${e.currentTarget.value}`);
                                }
                            }}
                        />
                        <button
                            onClick={() => navigate('/doctors')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
                        <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                            <Search className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Find Doctors</h3>
                        <p className="text-gray-600">
                            Search by speciality, location, or name. Verified profiles and reviews.
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
                        <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                            <Calendar className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Book Appointments</h3>
                        <p className="text-gray-600">
                            Instant booking with confirmation. Manage your schedule easily.
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
                        <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                            <Shield className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Secure Health Records</h3>
                        <p className="text-gray-600">
                            Keep your medical history safe and accessible anytime via dashboard.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
