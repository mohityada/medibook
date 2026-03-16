import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Shield, Heart, Stethoscope, Brain, Eye, Bone, Baby, MessageSquare, CreditCard, Star, Clock, CheckCircle, ArrowRight } from 'lucide-react';

const specialities = [
    { name: 'Cardiology', icon: Heart, color: 'bg-red-100 text-red-600' },
    { name: 'General Medicine', icon: Stethoscope, color: 'bg-blue-100 text-blue-600' },
    { name: 'Neurology', icon: Brain, color: 'bg-purple-100 text-purple-600' },
    { name: 'Ophthalmology', icon: Eye, color: 'bg-green-100 text-green-600' },
    { name: 'Orthopedics', icon: Bone, color: 'bg-orange-100 text-orange-600' },
    { name: 'Pediatrics', icon: Baby, color: 'bg-pink-100 text-pink-600' },
];

const howItWorks = [
    { step: '1', title: 'Search a Doctor', description: 'Browse by speciality, name, or hospital and find the right doctor for you.', icon: Search },
    { step: '2', title: 'Book Appointment', description: 'Pick an available time slot that works for you and confirm instantly.', icon: Calendar },
    { step: '3', title: 'Make Payment', description: 'Pay securely online via Stripe or choose to pay at the clinic.', icon: CreditCard },
    { step: '4', title: 'Get Consultation', description: 'Chat with your doctor, get reminders, and manage everything from your dashboard.', icon: MessageSquare },
];

const Home = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
        const q = searchQuery.trim();
        navigate(q ? `/doctors?query=${encodeURIComponent(q)}` : '/doctors');
    };

    return (
        <div className="space-y-20 pb-16">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-24 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuMTA1IDAgMi0uODk1IDItMnMtLjg5NS0yLTItMi0yIC44OTUtMiAyIC44OTUgMiAyIDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 text-sm text-blue-100">
                        <CheckCircle className="h-4 w-4" />
                        Trusted by thousands of patients across the country
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Your Health, Our Priority
                    </h1>
                    <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto">
                        Book appointments with the best doctors in your city instantly. Real-time chat, secure payments, and smart reminders.
                    </p>
                    <div className="max-w-2xl mx-auto bg-white rounded-xl p-2 flex items-center shadow-2xl">
                        <Search className="h-6 w-6 text-gray-400 ml-3 flex-shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search doctors, specialities, hospitals..."
                            className="flex-1 p-3 outline-none text-gray-800"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearch();
                            }}
                        />
                        <button
                            onClick={handleSearch}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                        >
                            Search
                        </button>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-blue-200">
                        <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> Verified Doctors</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Instant Booking</span>
                        <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> Secure Payments</span>
                        <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4" /> Real-time Chat</span>
                    </div>
                </div>
            </section>

            {/* Popular Specialities */}
            <section className="max-w-7xl mx-auto px-4">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Popular Specialities</h2>
                <p className="text-gray-500 text-center mb-8">Choose from a wide range of medical specialities</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {specialities.map(spec => (
                        <button
                            key={spec.name}
                            onClick={() => navigate(`/doctors?query=${encodeURIComponent(spec.name)}`)}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all text-center group cursor-pointer"
                        >
                            <div className={`${spec.color} p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                                <spec.icon className="h-7 w-7" />
                            </div>
                            <p className="text-sm font-medium text-gray-700">{spec.name}</p>
                        </button>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">How It Works</h2>
                    <p className="text-gray-500 text-center mb-12">Get started in 4 simple steps</p>
                    <div className="grid md:grid-cols-4 gap-6">
                        {howItWorks.map((item, i) => (
                            <div key={item.step} className="relative text-center">
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full">
                                    <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                                        {item.step}
                                    </div>
                                    <item.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-sm text-gray-500">{item.description}</p>
                                </div>
                                {i < howItWorks.length - 1 && (
                                    <ArrowRight className="hidden md:block absolute top-1/2 -right-5 h-5 w-5 text-gray-300 -translate-y-1/2" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-4">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Why Choose MediBook?</h2>
                <p className="text-gray-500 text-center mb-10">Everything you need for a seamless healthcare experience</p>
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
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
                        <div className="bg-amber-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="h-8 w-8 text-amber-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Chat with Doctors</h3>
                        <p className="text-gray-600">
                            Real-time messaging powered by WebSockets. Ask questions before and after appointments.
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
                        <div className="bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                            <Clock className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Smart Reminders</h3>
                        <p className="text-gray-600">
                            Get notified 24h and 48h before your appointment. Never miss a visit again.
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
                        <div className="bg-teal-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                            <Star className="h-8 w-8 text-teal-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Ratings & Reviews</h3>
                        <p className="text-gray-600">
                            Read genuine patient reviews and ratings to choose the best doctor for your needs.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
                <div className="max-w-4xl mx-auto px-4 text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
                    <p className="text-lg text-blue-100 mb-8">
                        Join thousands of patients who trust MediBook for their healthcare needs.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/register')}
                            className="bg-white text-blue-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg"
                        >
                            Create Free Account
                        </button>
                        <button
                            onClick={() => navigate('/doctors')}
                            className="border-2 border-white/30 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                        >
                            Browse Doctors
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
