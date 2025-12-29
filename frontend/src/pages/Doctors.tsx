import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { MapPin, DollarSign, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Doctor {
    id: number;
    user: {
        email: string;
        firstName: string;
        lastName: string;
        mobileNumber?: string;
    };
    speciality: string;
    degree: string;
    experience: number;
    fees: number;
    isFreelance: boolean;
    hospital?: {
        name: string;
        city: string;
    };
}

const Doctors = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const query = searchParams.get('query') || '';
    const { user } = useAuth();

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoading(true);
                const url = query ? `/doctors/search?query=${query}` : '/doctors';
                const response = await api.get(url);
                setDoctors(response.data);
            } catch (error) {
                console.error('Failed to fetch doctors', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, [query]);

    const handleBook = async (doctorId: number) => {
        if (!user) {
            alert("Please login to book");
            return;
        }
        // Simple booking confirmation for MVP
        try {
            // Find a slot logic would go here. For now, booking a slot tomorrow at 10 AM.
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(10, 0, 0, 0);

            await api.post('/appointments', {
                doctorId,
                timeSlot: tomorrow.toISOString()
            });
            alert('Appointment booked successfully for tomorrow 10 AM!');
        } catch (e: any) {
            alert(e.response?.data?.message || 'Booking failed');
        }
    };

    if (loading) return <div className="text-center py-20">Loading doctors...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold mb-8">
                {query ? `Search Results for "${query}"` : 'Find Doctors'}
            </h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doctor) => (
                    <div key={doctor.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Dr. {doctor.user.firstName} {doctor.user.lastName}</h2>
                                    <p className="text-blue-600 font-medium">{doctor.speciality}</p>
                                </div>
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                    {doctor.experience} yrs exp
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 mb-6">
                                <div className="flex items-center">
                                    <Briefcase className="h-4 w-4 mr-2" />
                                    <span>{doctor.degree}</span>
                                </div>
                                {doctor.hospital && (
                                    <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        <span>{doctor.hospital.name}, {doctor.hospital.city}</span>
                                    </div>
                                )}
                                <div className="flex items-center text-gray-900 font-medium">
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    <span>${doctor.fees} Consultation Fee</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleBook(doctor.id)}
                                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                            >
                                Book Appointment
                            </button>
                        </div>
                    </div>
                ))}
                {doctors.length === 0 && (
                    <p className="col-span-3 text-center text-gray-500 py-10">No doctors found.</p>
                )}
            </div>
        </div>
    );
};

export default Doctors;
