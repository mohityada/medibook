import { useState } from 'react';
import Modal from './Modal';
import StarRating from './StarRating';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointmentId: number;
    doctorName: string;
    hospitalName?: string;
    onSuccess: () => void;
}

const ReviewModal = ({ isOpen, onClose, appointmentId, doctorName, hospitalName, onSuccess }: ReviewModalProps) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hospitalRating, setHospitalRating] = useState(0);
    const [hospitalFeedback, setHospitalFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/reviews', {
                appointmentId,
                rating,
                comment: comment || null,
                hospitalRating: hospitalRating > 0 ? hospitalRating : null,
                hospitalFeedback: hospitalFeedback || null,
            });
            toast.success('Review submitted! Thank you for your feedback.');
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Leave a Review">
            <div className="space-y-5">
                {/* Doctor Rating */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rate Dr. {doctorName}
                    </label>
                    <StarRating rating={rating} onRate={setRating} size="lg" />
                    {rating > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                            {rating === 5 ? 'Excellent!' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your review (optional)
                    </label>
                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Share your experience with the doctor..."
                        maxLength={500}
                    />
                    <p className="text-xs text-gray-400 text-right">{comment.length}/500</p>
                </div>

                {/* Hospital Rating (optional) */}
                {hospitalName && (
                    <div className="border-t border-gray-100 pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rate {hospitalName} (optional)
                        </label>
                        <StarRating rating={hospitalRating} onRate={setHospitalRating} size="md" />
                        <textarea
                            value={hospitalFeedback}
                            onChange={e => setHospitalFeedback(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2"
                            rows={2}
                            placeholder="Hospital feedback (optional)..."
                            maxLength={300}
                        />
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={rating === 0 || submitting}
                        className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ReviewModal;
