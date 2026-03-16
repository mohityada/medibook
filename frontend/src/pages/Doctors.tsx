import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { MapPin, DollarSign, Briefcase, Search, Clock, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import StarRating from '../components/StarRating';

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

const SPECIALITY_FILTERS = [
    'All', 'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics',
    'Pediatrics', 'Psychiatry', 'General Medicine', 'Surgery', 'ENT',
    'Ophthalmology', 'Gynecology', 'Dentistry'
];

const Doctors = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('query') || '';
    const { user } = useAuth();
    const navigate = useNavigate();
    const [expandedDoctorId, setExpandedDoctorId] = useState<number | null>(null);
    const [localSearch, setLocalSearch] = useState(query);
    const [selectedSpeciality, setSelectedSpeciality] = useState('All');
    const [sortBy, setSortBy] = useState<'default' | 'fees-asc' | 'fees-desc' | 'experience'>('default');
    const [showFilters, setShowFilters] = useState(false);
    
    // Confirmation modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ doctorId: number; timeSlot: Date; doctorName: string } | null>(null);
    const [symptoms, setSymptoms] = useState('');
    const [bookingInProgress, setBookingInProgress] = useState(false);
    
    // Available slots per doctor
    const [availableSlots, setAvailableSlots] = useState<Record<number, any[]>>({});
    
    // Doctor ratings
    const [doctorRatings, setDoctorRatings] = useState<Record<number, { averageRating: number; totalReviews: number }>>({});

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoading(true);
                const url = query ? `/doctors/search?query=${encodeURIComponent(query)}` : '/doctors';
                const response = await api.get(url);
                setDoctors(response.data);
                // Fetch ratings for all doctors
                const ratings: Record<number, { averageRating: number; totalReviews: number }> = {};
                await Promise.all(response.data.map(async (doc: Doctor) => {
                    try {
                        const res = await api.get(`/reviews/doctor/${doc.id}/summary`);
                        ratings[doc.id] = res.data;
                    } catch { /* ignore */ }
                }));
                setDoctorRatings(ratings);
            } catch (error) {
                console.error('Failed to fetch doctors', error);
               toast.error('Failed to load doctors');
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, [query]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (localSearch.trim()) {
            setSearchParams({ query: localSearch.trim() });
        } else {
            setSearchParams({});
        }
    };

    const handleBook = async (doctorId: number, timeSlot: Date) => {
        if (!user) {
            toast.error("Please login to book an appointment");
            navigate('/login');
            return;
        }
        
        const doctor = doctors.find(d => d.id === doctorId);
        const doctorName = doctor ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}` : 'Doctor';
        
        // Show confirmation modal instead of direct booking
        setSelectedSlot({ doctorId, timeSlot, doctorName });
        setShowConfirmModal(true);
    };

    const confirmBooking = async () => {
        if (!selectedSlot) return;
        
        setBookingInProgress(true);
        try {
            await api.post('/appointments', {
                doctorId: selectedSlot.doctorId,
                timeSlot: selectedSlot.timeSlot.toISOString(),
                notes: symptoms || undefined,
            });
            toast.success(`Appointment booked for ${selectedSlot.timeSlot.toLocaleString()}!`);
            setExpandedDoctorId(null);
            setShowConfirmModal(false);
            setSymptoms('');
            setSelectedSlot(null);
        } catch (e: any) {
            toast.error(e.response?.data?.message || e.response?.data || 'Booking failed');
        } finally {
            setBookingInProgress(false);
        }
    };

    const cancelBooking = () => {
        setShowConfirmModal(false);
        setSymptoms('');
        setSelectedSlot(null);
    };

    const fetchAvailableSlots = async (doctorId: number) => {
        try {
            const response = await api.get(`/schedules/doctor/${doctorId}/available-slots?days=5`);
            setAvailableSlots(prev => ({ ...prev, [doctorId]: response.data }));
        } catch (error) {
            console.error('Failed to fetch available slots', error);
            // Fallback to empty array if no schedules
            setAvailableSlots(prev => ({ ...prev, [doctorId]: [] }));
        }
    };

    const handleExpandDoctor = (doctorId: number) => {
        setExpandedDoctorId(doctorId);
        if (!availableSlots[doctorId]) {
            fetchAvailableSlots(doctorId);
        }
    };

    // Filter & Sort
    let filteredDoctors = [...doctors];
    if (selectedSpeciality !== 'All') {
        filteredDoctors = filteredDoctors.filter(d =>
            d.speciality.toLowerCase().includes(selectedSpeciality.toLowerCase())
        );
    }
    if (sortBy === 'fees-asc') filteredDoctors.sort((a, b) => a.fees - b.fees);
    else if (sortBy === 'fees-desc') filteredDoctors.sort((a, b) => b.fees - a.fees);
    else if (sortBy === 'experience') filteredDoctors.sort((a, b) => b.experience - a.experience);

    // Group slots by date for better display
    const getGroupedSlots = (doctorId: number) => {
        const slots = availableSlots[doctorId] || [];
        const grouped: Record<string, any[]> = {};
        
        slots.forEach(slot => {
            const dateKey = slot.displayDate;
            if (!grouped[dateKey]) grouped[dateKey] = [];
            grouped[dateKey].push(slot);
        });
        
        return grouped;
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Confirmation Modal */}
            {showConfirmModal && selectedSlot && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirm Appointment</h2>
                        
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-600 mb-1">Doctor</p>
                            <p className="font-semibold text-gray-900">{selectedSlot.doctorName}</p>
                            
                            <p className="text-sm text-gray-600 mt-3 mb-1">Appointment Time</p>
                            <p className="font-semibold text-gray-900">
                                {selectedSlot.timeSlot.toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </p>
                            <p className="font-semibold text-blue-600 text-lg">
                                {selectedSlot.timeSlot.toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })}
                            </p>
                        </div>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Symptoms or Reason for Visit <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                placeholder="E.g., Persistent headache for 3 days, chest pain, fever..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Please describe your symptoms to help the doctor prepare for your consultation
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={cancelBooking}
                                disabled={bookingInProgress}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmBooking}
                                disabled={!symptoms.trim() || bookingInProgress}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {bookingInProgress ? 'Booking...' : 'Confirm Booking'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-6 text-gray-900">Find Doctors</h1>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={localSearch}
                            onChange={e => setLocalSearch(e.target.value)}
                            placeholder="Search by name, speciality, hospital, city..."
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                        />
                    </div>
                    <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
                        Search
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-3 border rounded-xl font-medium flex items-center gap-2 ${showFilters ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                        <SlidersHorizontal className="h-4 w-4" /> Filters
                    </button>
                </form>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Speciality</label>
                                <div className="flex flex-wrap gap-2">
                                    {SPECIALITY_FILTERS.map(spec => (
                                        <button
                                            key={spec}
                                            onClick={() => setSelectedSpeciality(spec)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                                selectedSpeciality === spec
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {spec}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="sm:w-48">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value as any)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="default">Default</option>
                                    <option value="fees-asc">Fees: Low to High</option>
                                    <option value="fees-desc">Fees: High to Low</option>
                                    <option value="experience">Most Experienced</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {query && (
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-gray-500">Showing results for</span>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">"{query}"</span>
                        <button
                            onClick={() => { setSearchParams({}); setLocalSearch(''); }}
                            className="text-red-500 hover:text-red-700 text-sm underline"
                        >
                            Clear
                        </button>
                    </div>
                )}
            </div>

            {/* Results Count */}
            <p className="text-sm text-gray-500 mb-4">{filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} found</p>

            {/* Doctor Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor) => (
                    <div key={doctor.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-gray-100 flex flex-col">
                        <div className="p-6 flex-1">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg">
                                        {doctor.user.firstName.charAt(0)}{doctor.user.lastName.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Dr. {doctor.user.firstName} {doctor.user.lastName}</h2>
                                        <p className="text-blue-600 text-sm font-medium">{doctor.speciality}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="space-y-2.5 text-sm text-gray-600 mb-5">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-gray-400" />
                                    <span>{doctor.degree}</span>
                                </div>
                                {doctorRatings[doctor.id] && doctorRatings[doctor.id].totalReviews > 0 ? (
                                    <StarRating
                                        rating={doctorRatings[doctor.id].averageRating}
                                        size="sm"
                                        showValue
                                        count={doctorRatings[doctor.id].totalReviews}
                                    />
                                ) : (
                                    <p className="text-xs text-gray-400 italic">No reviews yet</p>
                                )}
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span>{doctor.experience} years experience</span>
                                </div>
                                {doctor.hospital ? (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span>{doctor.hospital.name}, {doctor.hospital.city}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span className="text-green-600 font-medium">Freelance Practitioner</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-gray-900 font-semibold text-base">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <span>${doctor.fees}</span>
                                    <span className="text-xs text-gray-500 font-normal">per consultation</span>
                                </div>
                            </div>

                            {/* Expanded Booking Section */}
                            {expandedDoctorId === doctor.id ? (
                                <div className="border-t border-gray-100 pt-4">
                                    <p className="font-medium mb-3 text-gray-700 flex items-center gap-2">
                                        <Clock className="h-4 w-4" /> Select a Time Slot
                                    </p>
                                    {availableSlots[doctor.id] === undefined ? (
                                        <div className="text-center py-4">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                            <p className="text-sm text-gray-500 mt-2">Loading available slots...</p>
                                        </div>
                                    ) : availableSlots[doctor.id]?.length === 0 ? (
                                        <div className="text-center py-6">
                                            <Clock className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                            <p className="text-gray-500 text-sm">No schedules available</p>
                                            <p className="text-gray-400 text-xs mt-1">Doctor hasn't set up schedules yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 mb-4 max-h-56 overflow-y-auto">
                                            {Object.entries(getGroupedSlots(doctor.id)).map(([dateLabel, slots]) => (
                                                <div key={dateLabel}>
                                                    <p className="text-xs font-semibold text-gray-500 mb-1.5">{dateLabel}</p>
                                                    <div className="grid grid-cols-3 gap-1.5">
                                                        {slots.map((slot, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => handleBook(doctor.id, new Date(slot.dateTime))}
                                                                className="text-xs bg-blue-50 text-blue-700 py-2 px-1.5 rounded-lg hover:bg-blue-100 border border-blue-200 font-medium transition-colors"
                                                            >
                                                                {slot.displayTime}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setExpandedDoctorId(null)}
                                        className="w-full text-gray-500 text-sm hover:text-gray-700 py-2 mt-2"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleExpandDoctor(doctor.id)}
                                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                                >
                                    Book Appointment
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {filteredDoctors.length === 0 && (
                    <div className="col-span-3 text-center py-16">
                        <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No doctors found</p>
                        <p className="text-gray-400 text-sm mt-1">Try a different search term or adjust your filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Doctors;
