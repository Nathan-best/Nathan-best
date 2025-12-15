import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { api } from '../App';

const RevenueDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    try {
      const response = await api.get('/admin/revenue-analytics');
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen tech-grid-bg flex items-center justify-center">
        <div className="tech-spinner"></div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen tech-grid-bg">
      {/* Header */}
      <div className="bg-charcoal/90 border-b border-electric-blue/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-orbitron font-bold text-tech-white">REVENUE ANALYTICS</h1>
            <button 
              onClick={() => navigate('/dashboard')}
              className="neon-outline px-6 py-2"
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Total Revenue */}
        <div className="mb-8">
          <div className="metallic-panel p-8 text-center border-success-green">
            <h2 className="text-lg font-orbitron text-steel-gray mb-2">TOTAL PLATFORM REVENUE</h2>
            <div className="text-6xl font-orbitron font-black text-success-green mb-4">
              ${analytics.total_revenue.toFixed(2)}
            </div>
            <p className="text-steel-gray font-inter">All-time earnings from platform operations</p>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="metallic-panel p-6">
            <h3 className="text-sm font-orbitron text-steel-gray mb-2">COMMISSION REVENUE</h3>
            <div className="text-3xl font-orbitron font-bold text-electric-blue">
              ${analytics.breakdown.commission_revenue.toFixed(2)}
            </div>
            <p className="text-xs text-steel-gray font-inter mt-2">From completed jobs</p>
          </div>

          <div className="metallic-panel p-6">
            <h3 className="text-sm font-orbitron text-steel-gray mb-2">EMERGENCY FEES</h3>
            <div className="text-3xl font-orbitron font-bold text-error-red">
              ${analytics.breakdown.emergency_fees.toFixed(2)}
            </div>
            <p className="text-xs text-steel-gray font-inter mt-2">High-urgency surcharges</p>
          </div>

          <div className="metallic-panel p-6">
            <h3 className="text-sm font-orbitron text-steel-gray mb-2">DIAGNOSTICS</h3>
            <div className="text-3xl font-orbitron font-bold text-neon-yellow">
              ${analytics.breakdown.diagnostics_fees.toFixed(2)}
            </div>
            <p className="text-xs text-steel-gray font-inter mt-2">Pre-repair assessments</p>
          </div>

          <div className="metallic-panel p-6">
            <h3 className="text-sm font-orbitron text-steel-gray mb-2">VERIFICATION FEES</h3>
            <div className="text-3xl font-orbitron font-bold text-electric-blue">
              ${analytics.breakdown.verification_fees.toFixed(2)}
            </div>
            <p className="text-xs text-steel-gray font-inter mt-2">Tech onboarding</p>
          </div>
        </div>

        {/* Subscription Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="metallic-panel p-6 border-neon-yellow/50">
            <h3 className="text-sm font-orbitron text-steel-gray mb-2">MONTHLY RECURRING REVENUE</h3>
            <div className="text-4xl font-orbitron font-bold text-neon-yellow">
              ${analytics.breakdown.subscription_mrr.toFixed(2)}
            </div>
            <p className="text-xs text-steel-gray font-inter mt-2">{analytics.active_subscriptions} active subscriptions</p>
          </div>

          <div className="metallic-panel p-6 border-success-green/50">
            <h3 className="text-sm font-orbitron text-steel-gray mb-2">PROJECTED ANNUAL RECURRING</h3>
            <div className="text-4xl font-orbitron font-bold text-success-green">
              ${analytics.projected_annual_recurring.toFixed(2)}
            </div>
            <p className="text-xs text-steel-gray font-inter mt-2">MRR × 12 months</p>
          </div>

          <div className="metallic-panel p-6">
            <h3 className="text-sm font-orbitron text-steel-gray mb-2">VERIFIED TECHNICIANS</h3>
            <div className="text-4xl font-orbitron font-bold text-electric-blue">
              {analytics.verified_technicians}
            </div>
            <p className="text-xs text-steel-gray font-inter mt-2">Paid verification fees</p>
          </div>
        </div>

        {/* Transaction Analysis */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="metallic-panel p-6">
            <h3 className="text-xl font-orbitron font-bold text-tech-white mb-4">TRANSACTION BREAKDOWN</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-steel-gray font-inter">Total Transactions</span>
                <span className="text-2xl font-orbitron font-bold text-electric-blue">
                  {analytics.transaction_counts.total}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-steel-gray font-inter">Low Urgency (10%)</span>
                <span className="text-xl font-orbitron font-bold text-success-green">
                  {analytics.transaction_counts.low_urgency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-steel-gray font-inter">Medium Urgency (15%)</span>
                <span className="text-xl font-orbitron font-bold text-neon-yellow">
                  {analytics.transaction_counts.medium_urgency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-steel-gray font-inter">High Urgency (25%)</span>
                <span className="text-xl font-orbitron font-bold text-error-red">
                  {analytics.transaction_counts.high_urgency}
                </span>
              </div>
            </div>
          </div>

          <div className="metallic-panel p-6 border-electric-blue/50">
            <h3 className="text-xl font-orbitron font-bold text-tech-white mb-4">REVENUE INSIGHTS</h3>
            <div className="space-y-4">
              <div className="p-4 bg-charcoal/50 rounded-lg">
                <div className="text-sm text-steel-gray font-inter mb-1">Average Commission per Job</div>
                <div className="text-2xl font-orbitron font-bold text-electric-blue">
                  ${analytics.transaction_counts.total > 0 
                    ? (analytics.breakdown.commission_revenue / analytics.transaction_counts.total).toFixed(2)
                    : '0.00'}
                </div>
              </div>
              <div className="p-4 bg-charcoal/50 rounded-lg">
                <div className="text-sm text-steel-gray font-inter mb-1">High-Urgency Conversion Rate</div>
                <div className="text-2xl font-orbitron font-bold text-error-red">
                  {analytics.transaction_counts.total > 0
                    ? ((analytics.transaction_counts.high_urgency / analytics.transaction_counts.total) * 100).toFixed(1)
                    : '0'}%
                </div>
              </div>
              <div className="p-4 bg-charcoal/50 rounded-lg">
                <div className="text-sm text-steel-gray font-inter mb-1">Revenue per Subscription</div>
                <div className="text-2xl font-orbitron font-bold text-neon-yellow">
                  ${analytics.active_subscriptions > 0
                    ? (analytics.breakdown.subscription_mrr / analytics.active_subscriptions).toFixed(2)
                    : '0.00'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Opportunities */}
        <div className="metallic-panel p-8 border-neon-yellow/50">
          <h3 className="text-2xl font-orbitron font-bold text-neon-yellow mb-6">GROWTH OPPORTUNITIES</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-orbitron font-bold text-tech-white mb-2">Subscription Growth</h4>
              <p className="text-steel-gray font-inter text-sm">
                Converting just 20 more warehouses to Standard plan ($399) = +$7,980/month MRR
              </p>
            </div>
            <div>
              <h4 className="font-orbitron font-bold text-tech-white mb-2">Emergency Upsell</h4>
              <p className="text-steel-gray font-inter text-sm">
                Promoting emergency dispatch to 30% of jobs = +${(analytics.transaction_counts.total * 0.3 * 50).toFixed(2)} potential revenue
              </p>
            </div>
            <div>
              <h4 className="font-orbitron font-bold text-tech-white mb-2">Tech Recruitment</h4>
              <p className="text-steel-gray font-inter text-sm">
                Onboarding 50 more verified techs @ $49 each = $2,450 one-time revenue
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;
