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
    const [expandedDoctorId, setExpandedDoctorId] = useState<number | null>(null);

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

    const generateSlots = () => {
        const slots: Date[] = [];
        const today = new Date();
        for (let i = 1; i <= 3; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            // 3 slots per day for demo
            const times = [9, 11, 14, 16];
            times.forEach(hour => {
                date.setHours(hour, 0, 0, 0);
                slots.push(new Date(date));
            });
        }
        return slots;
    };

    const handleBook = async (doctorId: number, timeSlot: Date) => {
        if (!user) {
            alert("Please login to book");
            return;
        }
        try {
            await api.post('/appointments', {
                doctorId,
                timeSlot: timeSlot.toISOString()
            });
            alert(`Appointment booked successfully for ${timeSlot.toLocaleString()}!`);
            setExpandedDoctorId(null);
        } catch (e: any) {
            alert(e.response?.data?.message || 'Booking failed');
        }
    };

    if (loading) return <div className="text-center py-20">Loading doctors...</div>;

    const availableSlots = generateSlots();

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

                            {expandedDoctorId === doctor.id ? (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                    <p className="font-medium mb-3 text-gray-700">Select a Slot:</p>
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        {availableSlots.map((slot, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleBook(doctor.id, slot)}
                                                className="text-xs bg-blue-50 text-blue-700 py-2 px-1 rounded hover:bg-blue-100 border border-blue-200"
                                            >
                                                {slot.toLocaleDateString()} <br /> {slot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setExpandedDoctorId(null)}
                                        className="w-full text-gray-500 text-sm hover:text-gray-700"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setExpandedDoctorId(doctor.id)}
                                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Book Appointment
                                </button>
                            )}
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
