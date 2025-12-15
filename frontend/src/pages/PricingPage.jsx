import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../App';

const PricingPage = ({ user }) => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadPlans();
    if (user.role === 'warehouse') {
      loadCurrentSubscription();
    }
  }, [user]);

  const loadPlans = async () => {
    try {
      const response = await api.get('/subscriptions/plans');
      setPlans(response.data);
    } catch (error) {
      toast.error('Failed to load plans');
    }
  };

  const loadCurrentSubscription = async () => {
    try {
      const response = await api.get('/subscriptions/my-subscription');
      setCurrentSubscription(response.data.subscription);
    } catch (error) {
      console.error('Failed to load subscription');
    }
  };

  const handleSubscribe = async (planId) => {
    if (currentSubscription) {
      toast.error('You already have an active subscription');
      return;
    }

    try {
      setLoading(true);
      await api.post('/subscriptions/subscribe', { plan_type: planId });
      toast.success('Successfully subscribed! Enjoy your benefits.');
      loadCurrentSubscription();
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      await api.post('/subscriptions/cancel');
      toast.success('Subscription cancelled');
      setCurrentSubscription(null);
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  return (
    <div className="min-h-screen tech-grid-bg">
      {/* Header */}
      <div className="bg-charcoal/90 border-b border-electric-blue/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="neon-outline px-6 py-2"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-orbitron font-black text-tech-white mb-4">
            PRICING PLANS
          </h1>
          <p className="text-xl text-steel-gray font-inter">
            Choose the perfect plan for your warehouse operations
          </p>
        </div>

        {/* Current Subscription */}
        {currentSubscription && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="metallic-panel p-6 border-success-green">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-success-green mb-2">
                    ACTIVE: {currentSubscription.plan_type.toUpperCase()} PLAN
                  </h3>
                  <p className="text-steel-gray font-inter">
                    ${currentSubscription.price}/month • {currentSubscription.visits_per_month} visits • {currentSubscription.visits_used} used
                  </p>
                  <p className="text-sm text-steel-gray font-inter mt-2">
                    Renews: {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={handleCancelSubscription}
                  className="neon-outline px-6 py-2 text-error-red border-error-red hover:bg-error-red hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`metallic-panel p-8 relative ${
                plan.popular ? 'border-neon-yellow border-2' : 'border-electric-blue/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-neon-yellow text-charcoal px-6 py-1 rounded-full text-sm font-orbitron font-bold">
                  MOST POPULAR
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-orbitron font-bold text-tech-white mb-2">
                  {plan.name.toUpperCase()}
                </h3>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-5xl font-orbitron font-bold text-electric-blue">
                    ${plan.price}
                  </span>
                  <span className="text-steel-gray font-inter">/month</span>
                </div>
                <p className="text-steel-gray font-inter text-sm">
                  {plan.visits_per_month} preventive visit{plan.visits_per_month > 1 ? 's' : ''} per month
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-electric-blue flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-steel-gray font-inter text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {user?.role === 'warehouse' && (
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading || currentSubscription}
                  className={`w-full ${
                    plan.popular ? 'neon-yellow-button' : 'neon-button'
                  } ${currentSubscription ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {currentSubscription ? 'Already Subscribed' : loading ? 'Processing...' : 'Subscribe Now'}
                </button>
              )}

              {user?.role !== 'warehouse' && (
                <div className="text-center text-steel-gray font-inter text-sm">
                  Available for warehouse accounts only
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Value Proposition */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="metallic-panel p-8">
            <h2 className="text-3xl font-orbitron font-bold text-tech-white text-center mb-6">
              WHY SUBSCRIBE?
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-orbitron font-bold text-electric-blue mb-3">SAVE MONEY</h3>
                <p className="text-steel-gray font-inter">
                  Get discounted repair rates up to 15% off. Free diagnostics save $59 per inspection. No emergency dispatch fees on urgent repairs.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-orbitron font-bold text-electric-blue mb-3">PREVENT DOWNTIME</h3>
                <p className="text-steel-gray font-inter">
                  Regular preventive maintenance catches issues before they cause costly breakdowns. Keep your robots running 24/7.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-orbitron font-bold text-electric-blue mb-3">PRIORITY ACCESS</h3>
                <p className="text-steel-gray font-inter">
                  Subscribers get matched with technicians first. Your jobs go to the front of the queue for faster resolution.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-orbitron font-bold text-electric-blue mb-3">DETAILED REPORTING</h3>
                <p className="text-steel-gray font-inter">
                  Enterprise plans include quarterly health reports for your entire robot fleet. Track maintenance history and predict issues.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ROI Calculator */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="metallic-panel p-8 border-neon-yellow/50">
            <h3 className="text-2xl font-orbitron font-bold text-neon-yellow text-center mb-6">
              CALCULATE YOUR ROI
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-orbitron font-bold text-electric-blue mb-2">$2,500+</div>
                <p className="text-steel-gray font-inter text-sm">Average repair cost per breakdown</p>
              </div>
              <div>
                <div className="text-4xl font-orbitron font-bold text-error-red mb-2">$15K+</div>
                <p className="text-steel-gray font-inter text-sm">Cost of 24hr downtime</p>
              </div>
              <div>
                <div className="text-4xl font-orbitron font-bold text-success-green mb-2">80%</div>
                <p className="text-steel-gray font-inter text-sm">Issues prevented with maintenance</p>
              </div>
            </div>
            <p className="text-center text-tech-white font-inter mt-8">
              A $399/month Standard plan pays for itself by preventing just ONE breakdown.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
