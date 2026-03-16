import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    Calendar, Clock, CreditCard, XCircle, RefreshCw, CheckCircle,
    AlertCircle, Activity, Users, DollarSign, Filter, Star, MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import PaymentModal from '../components/PaymentModal';
import ReviewModal from '../components/ReviewModal';

interface Appointment {
    id: number;
    doctor: {
        id: number;
        speciality: string;
        fees: number;
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
    notes?: string;
    cancellationReason?: string;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: typeof CheckCircle }> = {
    CONFIRMED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
    CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Activity },
};

const Dashboard = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>(() => {
        const statusFromUrl = searchParams.get('status');
        return statusFromUrl && ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(statusFromUrl) ? statusFromUrl : 'ALL';
    });

    // Modal states
    const [cancelModal, setCancelModal] = useState<{ open: boolean; appointmentId: number | null }>({ open: false, appointmentId: null });
    const [cancelReason, setCancelReason] = useState('');
    const [rescheduleModal, setRescheduleModal] = useState<{ open: boolean; appointment: Appointment | null }>({ open: false, appointment: null });
    const [newTimeSlot, setNewTimeSlot] = useState('');
    const [paymentModal, setPaymentModal] = useState<{ open: boolean; appointment: Appointment | null }>({ open: false, appointment: null });
    const [stripeConfig, setStripeConfig] = useState<{ publishableKey: string; stripeEnabled: boolean }>({ publishableKey: '', stripeEnabled: false });
    const [reviewModal, setReviewModal] = useState<{ open: boolean; appointment: Appointment | null }>({ open: false, appointment: null });
    const [reviewedAppointments, setReviewedAppointments] = useState<Set<number>>(new Set());

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/appointments/my-appointments');
            setAppointments(response.data);
            if (!isDoctor) {
                checkReviewedAppointments(response.data);
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const fetchStripeConfig = async () => {
        try {
            const response = await api.get('/payment/config');
            setStripeConfig(response.data);
        } catch {
            // Stripe not configured, proceed with demo mode
        }
    };

    const checkReviewedAppointments = async (apts: Appointment[]) => {
        const completed = apts.filter(a => a.status === 'COMPLETED');
        const reviewed = new Set<number>();
        await Promise.all(completed.map(async (apt) => {
            try {
                const res = await api.get(`/reviews/check/${apt.id}`);
                if (res.data.reviewed) reviewed.add(apt.id);
            } catch { /* ignore */ }
        }));
        setReviewedAppointments(reviewed);
    };

    useEffect(() => {
        if (user) {
            fetchAppointments();
            fetchStripeConfig();
            // Clear URL params after reading
            if (searchParams.has('status')) {
                setSearchParams({}, { replace: true });
            }
        }
    }, [user]);

    const isDoctor = user?.roles.includes('ROLE_DOCTOR');

    // --- Action Handlers ---
    const handleCancel = async () => {
        if (!cancelModal.appointmentId) return;
        try {
            await api.put(`/appointments/${cancelModal.appointmentId}/cancel`, { reason: cancelReason });
            toast.success('Appointment cancelled');
            setCancelModal({ open: false, appointmentId: null });
            setCancelReason('');
            fetchAppointments();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to cancel');
        }
    };

    const handleReschedule = async () => {
        if (!rescheduleModal.appointment || !newTimeSlot) return;
        try {
            await api.put(`/appointments/${rescheduleModal.appointment.id}/reschedule`, { timeSlot: newTimeSlot });
            toast.success('Appointment rescheduled');
            setRescheduleModal({ open: false, appointment: null });
            setNewTimeSlot('');
            fetchAppointments();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to reschedule');
        }
    };

    const handleConfirm = async (appointmentId: number) => {
        try {
            await api.put(`/appointments/${appointmentId}/confirm`);
            toast.success('Appointment confirmed');
            fetchAppointments();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to confirm');
        }
    };

    const handleComplete = async (appointmentId: number) => {
        try {
            await api.put(`/appointments/${appointmentId}/complete`);
            toast.success('Appointment marked as completed');
            fetchAppointments();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to complete');
        }
    };

    const handlePaymentSuccess = () => {
        setPaymentModal({ open: false, appointment: null });
        fetchAppointments();
    };

    // --- Stats ---
    const stats = {
        total: appointments.length,
        upcoming: appointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').length,
        completed: appointments.filter(a => a.status === 'COMPLETED').length,
        cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
    };

    // --- Filtering ---
    const filteredAppointments = statusFilter === 'ALL'
        ? appointments
        : appointments.filter(a => a.status === statusFilter);

    // --- Generate reschedule slots ---
    const generateSlots = () => {
        const slots: string[] = [];
        const now = new Date();
        for (let i = 1; i <= 5; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() + i);
            [9, 11, 14, 16].forEach(hour => {
                date.setHours(hour, 0, 0, 0);
                slots.push(date.toISOString().slice(0, 16));
            });
        }
        return slots;
    };

    if (!user) return <div className="p-10 text-center text-gray-500">Please login to access dashboard</div>;
    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {isDoctor ? 'Doctor Dashboard' : 'My Dashboard'}
                </h1>
                <button
                    onClick={fetchAppointments}
                    className="mt-2 sm:mt-0 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                    <RefreshCw className="h-4 w-4" /> Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            <p className="text-xs text-gray-500">Total</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-100 p-2 rounded-lg">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
                            <p className="text-xs text-gray-500">Upcoming</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                            <p className="text-xs text-gray-500">Completed</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-lg">
                            <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
                            <p className="text-xs text-gray-500">Cancelled</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {isDoctor ? 'Patient Appointments' : 'My Appointments'}
                    </h2>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="p-6">
                    {filteredAppointments.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">No appointments found</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {statusFilter !== 'ALL' ? 'Try changing the filter' : 'Book your first appointment from the Find Doctors page'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredAppointments.map(apt => {
                                const statusInfo = STATUS_CONFIG[apt.status] || STATUS_CONFIG.PENDING;
                                const StatusIcon = statusInfo.icon;
                                const isPast = new Date(apt.timeSlot) < new Date();
                                const canModify = apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED';

                                return (
                                    <div
                                        key={apt.id}
                                        className={`border rounded-xl p-5 transition-all hover:shadow-md ${
                                            apt.status === 'CANCELLED' ? 'border-red-100 bg-red-50/30' :
                                            apt.status === 'COMPLETED' ? 'border-green-100 bg-green-50/30' :
                                            'border-gray-100 hover:border-blue-200'
                                        }`}
                                    >
                                        <div className="flex flex-col lg:flex-row justify-between gap-4">
                                            {/* Left: Info */}
                                            <div className="flex gap-4 items-start flex-1">
                                                <div className={`${statusInfo.bg} p-3 rounded-full shrink-0`}>
                                                    <StatusIcon className={`h-5 w-5 ${statusInfo.text}`} />
                                                </div>
                                                <div className="min-w-0">
                                                    {isDoctor ? (
                                                        <>
                                                            <h3 className="font-semibold text-gray-900">
                                                                {apt.patient.user.firstName} {apt.patient.user.lastName}
                                                            </h3>
                                                            <p className="text-sm text-gray-600 mt-0.5">
                                                                {apt.patient.gender} &bull; {apt.patient.bloodGroup} &bull; Age: {new Date().getFullYear() - new Date(apt.patient.dateOfBirth).getFullYear()}
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <h3 className="font-semibold text-gray-900">
                                                                Dr. {apt.doctor.user.firstName} {apt.doctor.user.lastName}
                                                            </h3>
                                                            <p className="text-sm text-gray-600 mt-0.5">
                                                                {apt.doctor.speciality} &bull; {apt.doctor.hospital?.name || 'Freelance'}
                                                            </p>
                                                        </>
                                                    )}
                                                    <div className="flex items-center text-sm text-gray-500 mt-2 gap-4">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {new Date(apt.timeSlot).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                            {' '}at{' '}
                                                            {new Date(apt.timeSlot).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <DollarSign className="h-3.5 w-3.5" />
                                                            ${apt.doctor.fees}
                                                        </span>
                                                    </div>
                                                    {apt.notes && (
                                                        <p className="text-sm text-gray-500 mt-2 italic">Note: {apt.notes}</p>
                                                    )}
                                                    {apt.cancellationReason && (
                                                        <p className="text-sm text-red-500 mt-2">
                                                            <AlertCircle className="h-3.5 w-3.5 inline mr-1" />
                                                            Cancelled: {apt.cancellationReason}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right: Status + Actions */}
                                            <div className="flex flex-col items-end gap-3 shrink-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
                                                        {apt.status}
                                                    </span>
                                                    {!isDoctor && apt.paymentStatus !== 'PENDING' && (
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            apt.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                                                            apt.paymentStatus === 'REFUNDED' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {apt.paymentStatus}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {/* Doctor Actions */}
                                                    {isDoctor && apt.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => handleConfirm(apt.id)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium"
                                                        >
                                                            <CheckCircle className="h-3.5 w-3.5" /> Confirm
                                                        </button>
                                                    )}
                                                    {isDoctor && (apt.status === 'CONFIRMED' || apt.status === 'PENDING') && (
                                                        <button
                                                            onClick={() => handleComplete(apt.id)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium"
                                                        >
                                                            <Activity className="h-3.5 w-3.5" /> Complete
                                                        </button>
                                                    )}

                                                    {/* Patient Actions */}
                                                    {!isDoctor && canModify && apt.paymentStatus === 'PENDING' && (
                                                        <button
                                                            onClick={() => setPaymentModal({ open: true, appointment: apt })}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium"
                                                        >
                                                            <CreditCard className="h-3.5 w-3.5" /> Pay ${apt.doctor.fees}
                                                        </button>
                                                    )}
                                                    {!isDoctor && canModify && !isPast && (
                                                        <button
                                                            onClick={() => {
                                                                setRescheduleModal({ open: true, appointment: apt });
                                                                setNewTimeSlot('');
                                                            }}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 text-xs font-medium"
                                                        >
                                                            <RefreshCw className="h-3.5 w-3.5" /> Reschedule
                                                        </button>
                                                    )}

                                                    {/* Review button for completed appointments */}
                                                    {!isDoctor && apt.status === 'COMPLETED' && !reviewedAppointments.has(apt.id) && (
                                                        <button
                                                            onClick={() => setReviewModal({ open: true, appointment: apt })}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-xs font-medium"
                                                        >
                                                            <Star className="h-3.5 w-3.5" /> Leave Review
                                                        </button>
                                                    )}
                                                    {!isDoctor && apt.status === 'COMPLETED' && reviewedAppointments.has(apt.id) && (
                                                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium">
                                                            <Star className="h-3.5 w-3.5" /> Reviewed
                                                        </span>
                                                    )}

                                                    {/* Message button - available for all statuses */}
                                                    <button
                                                        onClick={() => navigate(
                                                            isDoctor
                                                                ? `/messages?patientEmail=${encodeURIComponent(apt.patient.user.email)}`
                                                                : `/messages?doctorId=${apt.doctor.id}`
                                                        )}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 text-xs font-medium"
                                                    >
                                                        <MessageSquare className="h-3.5 w-3.5" /> Message
                                                    </button>

                                                    {/* Cancel - both doctor and patient */}
                                                    {canModify && (
                                                        <button
                                                            onClick={() => {
                                                                setCancelModal({ open: true, appointmentId: apt.id });
                                                                setCancelReason('');
                                                            }}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-xs font-medium"
                                                        >
                                                            <XCircle className="h-3.5 w-3.5" /> Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Cancel Modal */}
            <Modal
                isOpen={cancelModal.open}
                onClose={() => setCancelModal({ open: false, appointmentId: null })}
                title="Cancel Appointment"
            >
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-700">
                            <AlertCircle className="h-4 w-4 inline mr-1" />
                            This action cannot be undone. If payment was already made, it will be refunded.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for cancellation (optional)</label>
                        <textarea
                            value={cancelReason}
                            onChange={e => setCancelReason(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            rows={3}
                            placeholder="E.g., schedule conflict, no longer needed..."
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setCancelModal({ open: false, appointmentId: null })}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Keep Appointment
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                        >
                            Cancel Appointment
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Reschedule Modal */}
            <Modal
                isOpen={rescheduleModal.open}
                onClose={() => setRescheduleModal({ open: false, appointment: null })}
                title="Reschedule Appointment"
            >
                <div className="space-y-4">
                    {rescheduleModal.appointment && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-700">
                                Current: {new Date(rescheduleModal.appointment.timeSlot).toLocaleString()}
                            </p>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select new time slot</label>
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                            {generateSlots().map((slot) => (
                                <button
                                    key={slot}
                                    onClick={() => setNewTimeSlot(slot)}
                                    className={`text-xs py-2.5 px-2 rounded-lg border transition-colors ${
                                        newTimeSlot === slot
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                                >
                                    {new Date(slot).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    <br />
                                    {new Date(slot).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setRescheduleModal({ open: false, appointment: null })}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleReschedule}
                            disabled={!newTimeSlot}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Reschedule
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Payment Modal */}
            {paymentModal.open && paymentModal.appointment && (
                <PaymentModal
                    appointmentId={paymentModal.appointment.id}
                    doctorName={`${paymentModal.appointment.doctor.user.firstName} ${paymentModal.appointment.doctor.user.lastName}`}
                    amount={paymentModal.appointment.doctor.fees}
                    onClose={() => setPaymentModal({ open: false, appointment: null })}
                    onSuccess={handlePaymentSuccess}
                    stripeKey={stripeConfig.publishableKey}
                    stripeEnabled={stripeConfig.stripeEnabled}
                />
            )}

            {/* Review Modal */}
            {reviewModal.open && reviewModal.appointment && (
                <ReviewModal
                    isOpen={reviewModal.open}
                    onClose={() => setReviewModal({ open: false, appointment: null })}
                    appointmentId={reviewModal.appointment.id}
                    doctorName={`${reviewModal.appointment.doctor.user.firstName} ${reviewModal.appointment.doctor.user.lastName}`}
                    hospitalName={reviewModal.appointment.doctor.hospital?.name}
                    onSuccess={fetchAppointments}
                />
            )}
        </div>
    );
};

export default Dashboard;
