import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, CheckCircle, AlertCircle, Lock, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentGateway = ({ amount, orderId, onSuccess, onFailure, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay loaded');
    };
    script.onerror = () => {
      setError('Failed to load payment gateway');
      toast.error('Failed to load payment gateway');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // In production, this would call your backend to create a Razorpay order
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo_key',
        amount: amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        name: 'EventVerse',
        description: 'Event Booking Payment',
        order_id: orderId,
        image: '/logo.png',
        handler: function (response) {
          // Payment successful
          onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
          toast.success('Payment successful!');
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        notes: {
          address: '',
        },
        theme: {
          color: '#818cf8',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            if (onClose) onClose();
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        // Payment failed
        onFailure(response.error);
        setError(response.error.description);
        toast.error('Payment failed: ' + response.error.description);
        setLoading(false);
      });

      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      setError('Failed to initiate payment');
      toast.error('Failed to initiate payment');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Razorpay Payment</h3>
              <p className="text-sm text-slate-400">Secure payment gateway</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">₹{amount.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Lock className="h-4 w-4 text-green-400" />
            <span>256-bit SSL encryption</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span>PCI DSS compliant</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <RefreshCw className="h-4 w-4 text-green-400" />
            <span>Instant refund support</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <DollarSign className="h-5 w-5" />
              Pay ₹{amount.toLocaleString()}
            </>
          )}
        </button>
      </div>

      <div className="text-center text-xs text-slate-500">
        <p>Powered by Razorpay. Your payment information is secure.</p>
      </div>
    </div>
  );
};

export default PaymentGateway;
