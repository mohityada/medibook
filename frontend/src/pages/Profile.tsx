import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, Phone, Mail, Activity, Briefcase, MapPin, Edit3, Save, X, DollarSign, Clock, Plus, Trash2, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

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
    const [editing, setEditing] = useState(false);
    const [editFields, setEditFields] = useState<Record<string, any>>({});
    const [saving, setSaving] = useState(false);
    
    // Doctor schedule management
    const [schedules, setSchedules] = useState<any[]>([]);
    const [showAddSchedule, setShowAddSchedule] = useState(false);
    const [newSchedule, setNewSchedule] = useState({ dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00' });
    
    // Doctor status management
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [hospitals, setHospitals] = useState<any[]>([]);

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
            if (user.role === 'DOCTOR') {
                fetchSchedules();
                fetchHospitals();
            }
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        }
    };

    const fetchSchedules = async () => {
        try {
            const response = await api.get('/schedules/my-schedules');
            setSchedules(response.data);
        } catch (error) {
            console.error('Failed to fetch schedules', error);
        }
    };

    const fetchHospitals = async () => {
        try {
            const response = await api.get('/hospitals');
            setHospitals(response.data);
        } catch (error) {
            console.error('Failed to fetch hospitals', error);
        }
    };

    const handleCreateDefaultSchedules = async () => {
        try {
            await api.post('/schedules/create-default');
            toast.success('Default schedules created successfully');
            fetchSchedules();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create default schedules');
        }
    };

    const handleAddSchedule = async () => {
        try {
            await api.post('/schedules', newSchedule);
            toast.success('Schedule added successfully');
            setShowAddSchedule(false);
            setNewSchedule({ dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00' });
            fetchSchedules();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add schedule');
        }
    };

    const handleDeleteSchedule = async (scheduleId: number) => {
        if (!confirm('Are you sure you want to delete this schedule?')) return;
        try {
            await api.delete(`/schedules/${scheduleId}`);
            toast.success('Schedule deleted successfully');
            fetchSchedules();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete schedule');
        }
    };

    const handleUpdateStatus = async (isFreelance: boolean, hospitalId?: number) => {
        try {
            await api.put('/doctors/update-status', { isFreelance, hospitalId });
            toast.success('Status updated successfully');
            setShowStatusModal(false);
            fetchProfile();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    useEffect(() => {
        if (user) {
            fetchProfile();
            fetchAppointments();
        }
    }, [user]);

    const startEditing = () => {
        if (!profile?.profileDetails) return;
        const details = profile.profileDetails;
        if (profile.role === 'DOCTOR') {
            setEditFields({
                fees: details.fees,
                speciality: details.speciality,
                degree: details.degree,
                experience: details.experience,
            });
        }
        setEditing(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (profile?.role === 'DOCTOR') {
                await api.put('/doctors/update-profile', editFields);
                toast.success('Profile updated successfully');
            }
            setEditing(false);
            fetchProfile();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (!user) return <div className="p-10 text-center">Please login to view profile.</div>;
    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
    if (!profile) return <div className="p-10 text-center">Profile not found.</div>;

    const renderDetails = () => {
        const details = profile.profileDetails;
        if (!details) return null;

        if (profile.role === 'PATIENT') {
            return (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6">
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
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                            <Briefcase className="w-5 h-5 mr-2 text-blue-500" /> Professional Details
                        </h3>
                        {!editing ? (
                            <button
                                onClick={startEditing}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium"
                            >
                                <Edit3 className="h-4 w-4" /> Edit
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditing(false)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium"
                                >
                                    <X className="h-4 w-4" /> Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span className="text-gray-500 text-sm block">Speciality</span>
                            {editing ? (
                                <input
                                    type="text"
                                    value={editFields.speciality || ''}
                                    onChange={e => setEditFields({ ...editFields, speciality: e.target.value })}
                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <span className="font-medium">{details.speciality}</span>
                            )}
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm block">Degree</span>
                            {editing ? (
                                <input
                                    type="text"
                                    value={editFields.degree || ''}
                                    onChange={e => setEditFields({ ...editFields, degree: e.target.value })}
                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <span className="font-medium">{details.degree}</span>
                            )}
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm block">Experience (Years)</span>
                            {editing ? (
                                <input
                                    type="number"
                                    value={editFields.experience || 0}
                                    onChange={e => setEditFields({ ...editFields, experience: parseInt(e.target.value) })}
                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <span className="font-medium">{details.experience} Years</span>
                            )}
                        </div>
                        <div>
                            <span className="text-gray-500 text-sm block flex items-center gap-1">
                                <DollarSign className="h-3.5 w-3.5" /> Consultation Fees
                            </span>
                            {editing ? (
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editFields.fees || 0}
                                    onChange={e => setEditFields({ ...editFields, fees: parseFloat(e.target.value) })}
                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <span className="font-medium text-green-700 text-lg">${details.fees}</span>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <span className="text-gray-500 text-sm block">Status</span>
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${details.isFreelance ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {details.isFreelance ? 'Freelance' : 'Hospital Attached'}
                                </span>
                                <button
                                    onClick={() => setShowStatusModal(true)}
                                    className="text-blue-600 hover:text-blue-700 text-xs font-medium underline"
                                >
                                    Change Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else if (profile.role === 'HOSPITAL') {
            return (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6">
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

    // Appointment statistics for the profile
    const aptStats = {
        total: appointments.length,
        upcoming: appointments.filter((a: any) => a.status === 'PENDING' || a.status === 'CONFIRMED').length,
        completed: appointments.filter((a: any) => a.status === 'COMPLETED').length,
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            {/* Header / Basic Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32"></div>
                <div className="px-6 pb-6 relative">
                    <div className="flex justify-between items-end -mt-12 mb-6">
                        <div className="bg-white p-1 rounded-full shadow-lg">
                            <div className="h-24 w-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">
                                {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
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

                    {/* Quick Stats */}
                    {appointments.length > 0 && (
                        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
                            <div className="text-center">
                                <p className="text-xl font-bold text-gray-900">{aptStats.total}</p>
                                <p className="text-xs text-gray-500">Total Appointments</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-bold text-yellow-600">{aptStats.upcoming}</p>
                                <p className="text-xs text-gray-500">Upcoming</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-bold text-green-600">{aptStats.completed}</p>
                                <p className="text-xs text-gray-500">Completed</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Role Specific Details */}
            {renderDetails()}

            {/* Doctor Schedule Management */}
            {profile.role === 'DOCTOR' && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-blue-500" /> Working Schedules
                        </h3>
                        <div className="flex gap-2">
                            {schedules.length === 0 && (
                                <button
                                    onClick={handleCreateDefaultSchedules}
                                    className="flex items-center gap-1 px-3 py-1.5 text-green-600 border border-green-600 hover:bg-green-50 rounded-lg text-sm font-medium"
                                >
                                    Create Default
                                </button>
                            )}
                            <button
                                onClick={() => setShowAddSchedule(!showAddSchedule)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                            >
                                <Plus className="h-4 w-4" /> Add Schedule
                            </button>
                        </div>
                    </div>

                    {showAddSchedule && (
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-gray-700 mb-3">Add New Schedule</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Day</label>
                                    <select
                                        value={newSchedule.dayOfWeek}
                                        onChange={e => setNewSchedule({ ...newSchedule, dayOfWeek: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="MONDAY">Monday</option>
                                        <option value="TUESDAY">Tuesday</option>
                                        <option value="WEDNESDAY">Wednesday</option>
                                        <option value="THURSDAY">Thursday</option>
                                        <option value="FRIDAY">Friday</option>
                                        <option value="SATURDAY">Saturday</option>
                                        <option value="SUNDAY">Sunday</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        value={newSchedule.startTime}
                                        onChange={e => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                                    <input
                                        type="time"
                                        value={newSchedule.endTime}
                                        onChange={e => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={handleAddSchedule}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                                >
                                    Add
                                </button>
                                <button
                                    onClick={() => setShowAddSchedule(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {schedules.length === 0 ? (
                        <div className="text-center py-8">
                            <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No schedules set up yet.</p>
                            <p className="text-gray-400 text-xs mt-1">Add schedules to let patients book appointments with you</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {schedules.filter(s => s.isActive).map((schedule) => (
                                <div key={schedule.id} className="flex justify-between items-center border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                                    <div>
                                        <p className="font-medium text-gray-900">{schedule.dayOfWeek}</p>
                                        <p className="text-sm text-gray-500">
                                            {schedule.startTime} - {schedule.endTime}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteSchedule(schedule.id)}
                                        className="text-red-600 hover:text-red-700 p-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Status Change Modal */}
            {showStatusModal && profile.role === 'DOCTOR' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Update Work Status</h2>
                        
                        <div className="space-y-3">
                            <button
                                onClick={() => handleUpdateStatus(true)}
                                className="w-full p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 text-left transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <User className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Work as Freelance</p>
                                        <p className="text-xs text-gray-500">Independent practice, manage your own schedule</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleUpdateStatus(false)}
                                className="w-full p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 text-left transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Attach to Hospital</p>
                                        <p className="text-xs text-gray-500">Work at a hospital facility</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowStatusModal(false)}
                            className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Appointment History */}
            {(profile.role === 'PATIENT' || profile.role === 'DOCTOR') && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-blue-500" /> Recent Appointments
                    </h3>

                    {appointments.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No appointments found.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {appointments.slice(0, 5).map((apt: any) => (
                                <div key={apt.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${
                                            apt.status === 'COMPLETED' ? 'bg-green-100' :
                                            apt.status === 'CANCELLED' ? 'bg-red-100' :
                                            apt.status === 'CONFIRMED' ? 'bg-blue-100' :
                                            'bg-yellow-100'
                                        }`}>
                                            <Clock className={`h-4 w-4 ${
                                                apt.status === 'COMPLETED' ? 'text-green-600' :
                                                apt.status === 'CANCELLED' ? 'text-red-600' :
                                                apt.status === 'CONFIRMED' ? 'text-blue-600' :
                                                'text-yellow-600'
                                            }`} />
                                        </div>
                                        <div>
                                            {profile.role === 'PATIENT' ? (
                                                <p className="font-medium text-gray-900">Dr. {apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName}</p>
                                            ) : (
                                                <p className="font-medium text-gray-900">{apt.patient?.user?.firstName} {apt.patient?.user?.lastName}</p>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                {new Date(apt.timeSlot).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                {' at '}
                                                {new Date(apt.timeSlot).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                            apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                            apt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                            apt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {apt.status}
                                        </span>
                                        {apt.paymentStatus === 'PAID' && (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                PAID
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {appointments.length > 5 && (
                                <p className="text-sm text-blue-600 text-center pt-2">
                                    +{appointments.length - 5} more appointments in dashboard
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Profile;
