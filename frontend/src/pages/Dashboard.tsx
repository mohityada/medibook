import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, CreditCard } from 'lucide-react';

interface Appointment {
    id: number;
    doctor: {
        speciality: string;
        user: { email: string; firstName: string; lastName: string };
        hospital?: { name: string; city: string };
    };
    patient: {
        user: { email: string; firstName: string; lastName: string };
        gender: string;
        bloodGroup: string;
        dateOfBirth: string;
    };
    timeSlot: string;
    status: string;
    paymentStatus: string;
}

const Dashboard = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/appointments/my-appointments');
            setAppointments(response.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAppointments();
        }
    }, [user]);

    const handlePay = async (appointmentId: number) => {
        try {
            await api.post(`/payment/${appointmentId}`);
            fetchAppointments(); // Refresh
            alert('Payment Successful!');
        } catch (e) {
            alert('Payment Failed');
        }
    };

    if (!user) return <div className="p-10">Please login</div>;
    if (loading) return <div className="p-10">Loading dashboard...</div>;

    const isDoctor = user.roles.includes('ROLE_DOCTOR');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {isDoctor ? 'Scheduled Appointments' : 'Upcoming Appointments'}
                    </h2>
                </div>
                <div className="p-6">
                    {appointments.length === 0 ? (
                        <p className="text-gray-500">No appointments booked yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {appointments.map(apt => (
                                <div key={apt.id} className="flex flex-col md:flex-row justify-between items-center border border-gray-100 p-4 rounded-lg hover:bg-gray-50">
                                    <div className="flex gap-4 items-center mb-4 md:mb-0">
                                        <div className="bg-blue-100 p-3 rounded-full">
                                            <Calendar className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            {isDoctor ? (
                                                <>
                                                    <h3 className="font-semibold text-gray-900">Patient: {apt.patient.user.firstName} {apt.patient.user.lastName}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        {apt.patient.gender}, {apt.patient.bloodGroup} • Age: {new Date().getFullYear() - new Date(apt.patient.dateOfBirth).getFullYear()}
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <h3 className="font-semibold text-gray-900">Dr. {apt.doctor.user.firstName} {apt.doctor.user.lastName}</h3>
                                                    <p className="text-sm text-gray-600">{apt.doctor.speciality} • {apt.doctor.hospital?.name || 'Freelance'}</p>
                                                </>
                                            )}
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <Clock className="h-3 w-3 mr-1" />
                                                <span>{new Date(apt.timeSlot).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {apt.status}
                                        </span>

                                        {!isDoctor && (
                                            apt.paymentStatus === 'PENDING' ? (
                                                <button
                                                    onClick={() => handlePay(apt.id)}
                                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                                                >
                                                    <CreditCard className="h-4 w-4 mr-2" />
                                                    Pay Now
                                                </button>
                                            ) : (
                                                <span className="flex items-center text-green-600 text-sm font-medium">
                                                    <CreditCard className="h-4 w-4 mr-1" /> Paid
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
