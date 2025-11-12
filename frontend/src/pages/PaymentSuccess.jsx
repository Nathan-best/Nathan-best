import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import { api } from '../App';

const PaymentSuccess = ({ user }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [attempts, setAttempts] = useState(0);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      pollPaymentStatus();
    }
  }, [sessionId]);

  const pollPaymentStatus = async () => {
    const maxAttempts = 5;
    
    if (attempts >= maxAttempts) {
      setStatus('timeout');
      toast.error('Payment verification timed out. Please check your dashboard.');
      return;
    }

    try {
      const response = await api.get(`/payments/status/${sessionId}`);
      
      if (response.data.payment_status === 'paid') {
        setStatus('success');
        toast.success('Payment completed successfully!');
      } else if (response.data.status === 'expired') {
        setStatus('failed');
        toast.error('Payment session expired');
      } else {
        // Continue polling
        setAttempts(prev => prev + 1);
        setTimeout(pollPaymentStatus, 2000);
      }
    } catch (error) {
      setStatus('error');
      toast.error('Failed to verify payment');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <Card className="max-w-md w-full" data-testid="payment-result-card">
        <CardContent className="p-8 text-center">
          {status === 'checking' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Verifying Payment</h2>
              <p className="text-slate-600">Please wait while we confirm your payment...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
              <p className="text-slate-600 mb-6">Your payment has been processed successfully. The technician will receive their payout shortly.</p>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 w-full"
                data-testid="go-to-dashboard-button"
              >
                Go to Dashboard
              </Button>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Failed</h2>
              <p className="text-slate-600 mb-6">The payment session expired or was cancelled. Please try again.</p>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 w-full"
                data-testid="go-to-dashboard-button"
              >
                Go to Dashboard
              </Button>
            </>
          )}

          {(status === 'timeout' || status === 'error') && (
            <>
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Issue</h2>
              <p className="text-slate-600 mb-6">We couldn't verify your payment status. Please check your dashboard or contact support.</p>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 w-full"
                data-testid="go-to-dashboard-button"
              >
                Go to Dashboard
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
