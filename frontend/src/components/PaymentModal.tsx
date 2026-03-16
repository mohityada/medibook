import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, X, Shield, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface PaymentModalProps {
    appointmentId: number;
    doctorName: string;
    amount: number;
    onClose: () => void;
    onSuccess: () => void;
}

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': { color: '#aab7c4' },
            fontFamily: 'system-ui, -apple-system, sans-serif',
        },
        invalid: { color: '#ef4444' },
    },
};

const CheckoutForm = ({ appointmentId, doctorName, amount, onClose, onSuccess }: PaymentModalProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [succeeded, setSucceeded] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setProcessing(true);

        try {
            const { data } = await api.post(`/payment/create-intent/${appointmentId}`);

            if (data.mode === 'stripe' && data.clientSecret) {
                const cardElement = elements.getElement(CardElement);
                if (!cardElement) return;

                const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
                    payment_method: { card: cardElement },
                });

                if (error) {
                    toast.error(error.message || 'Payment failed');
                    setProcessing(false);
                    return;
                }

                if (paymentIntent?.status === 'succeeded') {
                    await api.post(`/payment/confirm/${appointmentId}`, {
                        paymentIntentId: paymentIntent.id,
                    });
                    setSucceeded(true);
                    toast.success('Payment successful!');
                    setTimeout(() => onSuccess(), 1500);
                }
            } else {
                // Demo mode - direct confirmation
                await api.post(`/payment/confirm/${appointmentId}`);
                setSucceeded(true);
                toast.success('Payment successful!');
                setTimeout(() => onSuccess(), 1500);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    if (succeeded) {
        return (
            <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-gray-600">Your appointment has been confirmed.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                    <span className="text-gray-700">Consultation Fee</span>
                    <span className="text-2xl font-bold text-blue-700">${amount.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Dr. {doctorName}</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
                <div className="border border-gray-300 rounded-lg p-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                </div>
            </div>

            <div className="flex items-center text-xs text-gray-500 gap-1">
                <Shield className="h-3 w-3" />
                <span>Your payment is secured with 256-bit SSL encryption</span>
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!stripe || processing}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <CreditCard className="h-4 w-4" />
                    {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
                </button>
            </div>
        </form>
    );
};

const DemoCheckoutForm = ({ appointmentId, doctorName, amount, onClose, onSuccess }: PaymentModalProps) => {
    const [processing, setProcessing] = useState(false);
    const [succeeded, setSucceeded] = useState(false);

    const handleDemoPay = async () => {
        setProcessing(true);
        try {
            await api.post(`/payment/confirm/${appointmentId}`);
            setSucceeded(true);
            toast.success('Payment successful!');
            setTimeout(() => onSuccess(), 1500);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    if (succeeded) {
        return (
            <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-gray-600">Your appointment has been confirmed.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                    <span className="text-gray-700">Consultation Fee</span>
                    <span className="text-2xl font-bold text-blue-700">${amount.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Dr. {doctorName}</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                    <strong>Demo Mode:</strong> Stripe is not configured. Payment will be simulated.
                    Set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY environment variables to enable real payments.
                </p>
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                    Cancel
                </button>
                <button
                    onClick={handleDemoPay}
                    disabled={processing}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <CreditCard className="h-4 w-4" />
                    {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
                </button>
            </div>
        </div>
    );
};

const PaymentModal = (props: PaymentModalProps & { stripeKey?: string; stripeEnabled?: boolean }) => {
    const { stripeKey, stripeEnabled, onClose, ...rest } = props;

    const stripePromise = stripeEnabled && stripeKey ? loadStripe(stripeKey) : null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Complete Payment
                </h2>

                {stripePromise ? (
                    <Elements stripe={stripePromise}>
                        <CheckoutForm {...rest} onClose={onClose} />
                    </Elements>
                ) : (
                    <DemoCheckoutForm {...rest} onClose={onClose} />
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
