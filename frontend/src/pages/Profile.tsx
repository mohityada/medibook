import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, Phone, Mail, Activity, Briefcase, MapPin } from 'lucide-react';

interface ProfileData {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    role: string;
    profileDetails: any;
}

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/profile/me');
                setProfile(response.data);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchAppointments = async () => {
            try {
                const response = await api.get('/appointments/my-appointments');
                setAppointments(response.data);
            } catch (error) {
                console.error("Failed to fetch appointments", error);
            }
        };

        if (user) {
            fetchProfile();
            if (user) fetchAppointments();
        }
    }, [user]);

    if (!user) return <div className="p-10 text-center">Please login to view profile.</div>;
    if (loading) return <div className="p-10 text-center">Loading profile...</div>;
    if (!profile) return <div className="p-10 text-center">Profile not found.</div>;

    const renderDetails = () => {
        const details = profile.profileDetails;
        if (!details) return null;

        if (profile.role === 'PATIENT') {
            return (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-blue-500" /> Medical Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span className="text-gray-500 text-sm block">Date of Birth</span>
                            <span className="font-medium">{details.dateOfBirth || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm block">Blood Group</span>
                            <span className="font-medium">{details.bloodGroup || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm block">Gender</span>
                            <span className="font-medium">{details.gender || 'N/A'}</span>
                        </div>
                        <div className="md:col-span-2">
                            <span className="text-gray-500 text-sm block">Allergies</span>
                            <span className="font-medium">{details.allergies || 'None'}</span>
                        </div>
                    </div>
                </div>
            );
        } else if (profile.role === 'DOCTOR') {
            return (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-blue-500" /> Professional Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span className="text-gray-500 text-sm block">Speciality</span>
                            <span className="font-medium">{details.speciality}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm block">Degree</span>
                            <span className="font-medium">{details.degree}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm block">Experience</span>
                            <span className="font-medium">{details.experience} Years</span>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm block">Consultation Fees</span>
                            <span className="font-medium">${details.fees}</span>
                        </div>
                        <div className="md:col-span-2">
                            <span className="text-gray-500 text-sm block">Status</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${details.isFreelance ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                {details.isFreelance ? 'Freelance' : 'Hospital Attached'}
                            </span>
                        </div>
                    </div>
                </div>
            );
        } else if (profile.role === 'HOSPITAL') {
            return (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-blue-500" /> Hospital Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span className="text-gray-500 text-sm block">Hospital Name</span>
                            <span className="font-medium">{details.name}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm block">City</span>
                            <span className="font-medium">{details.city}</span>
                        </div>
                        <div className="md:col-span-2">
                            <span className="text-gray-500 text-sm block">Address</span>
                            <span className="font-medium">{details.address}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm block">Contact</span>
                            <span className="font-medium">{details.contact}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            {/* Header / Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-600 h-32"></div>
                <div className="px-6 pb-6 relative">
                    <div className="flex justify-between items-end -mt-12 mb-6">
                        <div className="bg-white p-1 rounded-full shadow-lg">
                            <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                                <User className="h-12 w-12" />
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-4">
                            {profile.role}
                        </span>
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h1>
                        <div className="flex flex-col sm:flex-row gap-4 mt-2 text-gray-600">
                            <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-2" />
                                {profile.email}
                            </div>
                            <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-2" />
                                {profile.mobileNumber || 'No mobile added'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Role Specific Details */}
            {renderDetails()}

            {/* Appointment History */}
            {profile.role === 'PATIENT' && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-blue-500" /> Appointment History
                    </h3>

                    {appointments.length === 0 ? (
                        <p className="text-gray-500">No appointments found.</p>
                    ) : (
                        <div className="space-y-4">
                            {appointments.map((apt: any) => (
                                <div key={apt.id} className="flex flex-col sm:flex-row justify-between items-center border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium text-gray-900">Dr. {apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName}</p>
                                        <p className="text-sm text-gray-500">{new Date(apt.timeSlot).toLocaleString()}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {apt.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Profile;
