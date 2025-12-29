import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
    const [role, setRole] = useState('patient');
    const [formData, setFormData] = useState({
        // Common
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        mobileNumber: '',
        // Patient
        dateOfBirth: '',
        bloodGroup: '',
        gender: '',
        allergies: '',
        // Doctor
        speciality: '',
        degree: '',
        experience: '',
        fees: '',
        isFreelance: false,
        // Hospital
        hospitalName: '',
        hospitalAddress: '',
        hospitalCity: '',
        hospitalContact: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            // @ts-ignore
            setFormData({ ...formData, [name]: e.target.checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        const basePayload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            mobileNumber: formData.mobileNumber
        };

        let endpoint = '';
        let finalPayload: any = { ...basePayload };

        if (role === 'patient') {
            endpoint = '/auth/signup/patient';
            finalPayload = {
                ...basePayload,
                dateOfBirth: formData.dateOfBirth,
                bloodGroup: formData.bloodGroup,
                gender: formData.gender,
                allergies: formData.allergies
            };
        } else if (role === 'doctor') {
            endpoint = '/auth/signup/doctor';
            finalPayload = {
                ...basePayload,
                speciality: formData.speciality,
                degree: formData.degree,
                experience: parseInt(formData.experience as string) || 0,
                fees: parseFloat(formData.fees as string) || 0.0,
                isFreelance: formData.isFreelance
            };
        } else if (role === 'hospital') {
            endpoint = '/auth/signup/hospital';
            finalPayload = {
                ...basePayload,
                hospitalName: formData.hospitalName,
                hospitalAddress: formData.hospitalAddress,
                hospitalCity: formData.hospitalCity,
                hospitalContact: formData.hospitalContact
            };
        }

        try {
            await api.post(endpoint, finalPayload);
            navigate('/login');
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Registration failed';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{' '}
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        sign in to your existing account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

                    {/* Role Selection Tabs */}
                    <div className="mb-6 border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 justify-center" aria-label="Tabs">
                            {['patient', 'doctor', 'hospital'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setRole(tab)}
                                    className={`${role === tab
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 rounded text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* Common Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input name="firstName" required type="text"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={formData.firstName} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input name="lastName" required type="text"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={formData.lastName} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email address</label>
                            <input name="email" required type="email"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.email} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                            <input name="mobileNumber" type="tel"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.mobileNumber} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input name="password" required type="password"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.password} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input name="confirmPassword" required type="password"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.confirmPassword} onChange={handleChange} />
                        </div>

                        {/* Patient Specific Fields */}
                        {role === 'patient' && (
                            <div className="space-y-4 border-t pt-4">
                                <h3 className="text-lg font-medium text-gray-900">Patient Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                        <input name="dateOfBirth" type="date"
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            value={formData.dateOfBirth} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                                        <select name="gender"
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            value={formData.gender} onChange={handleChange}>
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                                    <input name="bloodGroup" type="text" placeholder="e.g. O+"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={formData.bloodGroup} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Allergies (Optional)</label>
                                    <textarea name="allergies" rows={2}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={formData.allergies} onChange={handleChange} />
                                </div>
                            </div>
                        )}

                        {/* Doctor Specific Fields */}
                        {role === 'doctor' && (
                            <div className="space-y-4 border-t pt-4">
                                <h3 className="text-lg font-medium text-gray-900">Doctor Professional Details</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Speciality</label>
                                    <input name="speciality" type="text" placeholder="e.g. Cardiologist"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={formData.speciality} onChange={handleChange} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Degree</label>
                                        <input name="degree" type="text" placeholder="e.g. MBBS, MD"
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            value={formData.degree} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
                                        <input name="experience" type="number" min="0"
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            value={formData.experience} onChange={handleChange} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Consultation Fees ($)</label>
                                    <input name="fees" type="number" min="0"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={formData.fees} onChange={handleChange} />
                                </div>
                                <div className="flex items-center">
                                    <input id="isFreelance" name="isFreelance" type="checkbox"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        checked={formData.isFreelance} onChange={handleChange} />
                                    <label htmlFor="isFreelance" className="ml-2 block text-sm text-gray-900">
                                        I am a Freelancer (Not attached to a specific hospital yet)
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Hospital Specific Fields */}
                        {role === 'hospital' && (
                            <div className="space-y-4 border-t pt-4">
                                <h3 className="text-lg font-medium text-gray-900">Hospital Details</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hospital Name</label>
                                    <input name="hospitalName" type="text"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={formData.hospitalName} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <input name="hospitalAddress" type="text"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={formData.hospitalAddress} onChange={handleChange} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">City</label>
                                        <input name="hospitalCity" type="text"
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            value={formData.hospitalCity} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                                        <input name="hospitalContact" type="tel"
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            value={formData.hospitalContact} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <button type="submit" disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                                {loading ? 'Registering...' : 'Sign Up'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
