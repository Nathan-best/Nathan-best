import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { api } from '../App';

const TechnicianLanding = ({ setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [techData, setTechData] = useState({
    location: '',
    phone: '',
    specializations: ''
  });
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const hash = location.hash;
    if (hash && hash.includes('session_id=')) {
      const sid = hash.split('session_id=')[1].split('&')[0];
      setSessionId(sid);
      setLoading(true);
      handleSessionId(sid);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

  const handleSessionId = async (sid) => {
    try {
      const response = await api.post('/auth/session', {}, {
        headers: { 'X-Session-ID': sid }
      });

      if (response.data.needs_role) {
        setShowSignupDialog(true);
        setLoading(false);
      } else {
        document.cookie = `session_token=${response.data.session_token}; path=/; secure; samesite=none`;
        setUser(response.data.user);
        toast.success('Welcome to RobotiX Connect!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Authentication failed');
      setLoading(false);
    }
  };

  const handleLogin = () => {
    const redirectUrl = `${window.location.origin}/join-technician`;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleSignup = async () => {
    if (!techData.location || techData.location.length < 3) {
      toast.error('Please enter a valid location');
      return;
    }
    if (!techData.phone || techData.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    if (!techData.specializations || techData.specializations.trim().length === 0) {
      toast.error('Please enter at least one specialization');
      return;
    }

    try {
      setLoading(true);
      const specs = techData.specializations.split(',').map(s => s.trim()).filter(s => s.length > 0);

      const response = await api.post('/auth/register', {
        role: 'technician',
        ...techData,
        specializations: specs
      }, {
        headers: { 'X-Session-ID': sessionId }
      });

      document.cookie = `session_token=${response.data.session_token}; path=/; secure; samesite=none`;
      setUser(response.data.user);
      toast.success('Welcome to RobotiX Connect! Your technician account is ready.');
      navigate('/dashboard');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Registration failed. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen tech-grid-bg">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-charcoal/90 backdrop-blur-md border-b border-electric-blue/20 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-blue-600 rounded-lg flex items-center justify-center relative">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <div className="absolute inset-0 bg-electric-blue/30 rounded-lg blur-lg"></div>
            </div>
            <span className="text-2xl font-orbitron font-bold text-tech-white">RobotiX Connect</span>
          </div>
          <button 
            onClick={handleLogin}
            className="neon-button"
          >
            Sign Up Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-green/10 border border-success-green/30 rounded-full mb-6">
              <div className="w-2 h-2 bg-success-green rounded-full pulse-blue"></div>
              <span className="text-success-green font-inter font-semibold text-sm">HIRING ROBOTICS TECHNICIANS</span>
            </div>
            <h1 className="text-7xl font-orbitron font-black text-tech-white leading-tight mb-6">
              EARN MORE.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-cyan-400">
                WORK SMARTER.
              </span>
              <span className="block text-neon-yellow">GROW FASTER.</span>
            </h1>
            <p className="text-2xl text-steel-gray mb-8 leading-relaxed font-inter max-w-4xl mx-auto">
              Join the #1 robotics maintenance platform and <span className="text-electric-blue font-semibold">earn 85-90% of every job</span> without marketing, paperwork, or chasing payments.
            </p>
            <button 
              onClick={handleLogin}
              className="neon-yellow-button text-xl px-12 py-5"
            >
              START EARNING TODAY
            </button>
            <p className="text-steel-gray font-inter text-sm mt-4">
              $49 one-time verification fee • Approval in 24-48 hours
            </p>
          </div>
        </div>
      </div>

      {/* Earnings Potential */}
      <div className="py-20 px-6 bg-graphite/50 border-y border-electric-blue/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-orbitron font-bold text-tech-white mb-4">
              YOUR EARNING POTENTIAL
            </h2>
            <p className="text-xl text-steel-gray font-inter">Real numbers from active technicians on our platform</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="metallic-panel p-8 text-center border-success-green/50">
              <div className="text-6xl font-orbitron font-black text-success-green mb-2">$5,200</div>
              <p className="text-steel-gray font-inter mb-1">Average Monthly Earnings</p>
              <p className="text-xs text-steel-gray font-inter">Based on 12-15 jobs/month</p>
            </div>
            <div className="metallic-panel p-8 text-center border-neon-yellow/50">
              <div className="text-6xl font-orbitron font-black text-neon-yellow mb-2">$425</div>
              <p className="text-steel-gray font-inter mb-1">Avg Per Job (You Keep 85%)</p>
              <p className="text-xs text-steel-gray font-inter">From $500 average job value</p>
            </div>
            <div className="metallic-panel p-8 text-center border-electric-blue/50">
              <div className="text-6xl font-orbitron font-black text-electric-blue mb-2">2-3</div>
              <p className="text-steel-gray font-inter mb-1">Days to First Payout</p>
              <p className="text-xs text-steel-gray font-inter">Direct deposit after approval</p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="metallic-panel p-8">
            <h3 className="text-2xl font-orbitron font-bold text-tech-white mb-6 text-center">
              COMPARE: TRADITIONAL VS ROBOTIX CONNECT
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-orbitron font-bold text-error-red mb-4 text-lg">❌ TRADITIONAL WAY</h4>
                <div className="space-y-3 text-steel-gray font-inter">
                  <p>• Spend hours marketing yourself</p>
                  <p>• Chase clients for payment</p>
                  <p>• Handle invoicing & accounting</p>
                  <p>• Wait 30-60 days for payment</p>
                  <p>• Find your own leads</p>
                  <p>• Negotiate rates every time</p>
                  <p>• Limited to local network</p>
                </div>
              </div>
              <div>
                <h4 className="font-orbitron font-bold text-success-green mb-4 text-lg">✅ WITH ROBOTIX CONNECT</h4>
                <div className="space-y-3 text-tech-white font-inter">
                  <p>• <strong>Zero marketing</strong> - Jobs come to you</p>
                  <p>• <strong>Guaranteed payment</strong> - Escrow system</p>
                  <p>• <strong>Automatic invoicing</strong> - We handle it</p>
                  <p>• <strong>Get paid in 2-3 days</strong> - Fast payouts</p>
                  <p>• <strong>Steady job flow</strong> - AI matching</p>
                  <p>• <strong>Fair rates pre-set</strong> - No haggling</p>
                  <p>• <strong>Unlimited opportunities</strong> - Entire LA area</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Join Section */}
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-orbitron font-bold text-tech-white mb-4">
              10 REASONS TO JOIN TODAY
            </h2>
            <p className="text-xl text-steel-gray font-inter">What makes RobotiX Connect the best platform for technicians</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="tech-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-success-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-tech-white mb-2">1. HIGHER PAYOUTS</h3>
                  <p className="text-steel-gray font-inter">Keep 85-90% of job value. Industry average? 50-60%. That's up to $200 more per job in YOUR pocket.</p>
                </div>
              </div>
            </div>

            <div className="tech-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-electric-blue/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-tech-white mb-2">2. SMART JOB MATCHING</h3>
                  <p className="text-steel-gray font-inter">AI matches you with jobs based on skills, location, and ratings. No more wasting time on bad-fit jobs.</p>
                </div>
              </div>
            </div>

            <div className="tech-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-neon-yellow/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-tech-white mb-2">3. FLEXIBLE SCHEDULE</h3>
                  <p className="text-steel-gray font-inter">Work when YOU want. Toggle online/offline anytime. Accept only jobs that fit your schedule.</p>
                </div>
              </div>
            </div>

            <div className="tech-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-success-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🔒</span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-tech-white mb-2">4. GUARANTEED PAYMENT</h3>
                  <p className="text-steel-gray font-inter">Escrow system holds funds before you start. Never chase clients or worry about non-payment again.</p>
                </div>
              </div>
            </div>

            <div className="tech-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-electric-blue/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-tech-white mb-2">5. GROW YOUR BUSINESS</h3>
                  <p className="text-steel-gray font-inter">Build reputation through reviews. Top-rated techs get 3x more job offers and higher-paying clients.</p>
                </div>
              </div>
            </div>

            <div className="tech-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-neon-yellow/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🛠️</span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-tech-white mb-2">6. ZERO MARKETING COSTS</h3>
                  <p className="text-steel-gray font-inter">No need for website, ads, or business cards. We bring qualified leads directly to you daily.</p>
                </div>
              </div>
            </div>

            <div className="tech-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-success-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-tech-white mb-2">7. DIRECT COMMUNICATION</h3>
                  <p className="text-steel-gray font-inter">Chat directly with warehouses in-app. No phone tag, no middlemen. Clear communication = better results.</p>
                </div>
              </div>
            </div>

            <div className="tech-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-electric-blue/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎓</span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-tech-white mb-2">8. SKILL DEVELOPMENT</h3>
                  <p className="text-steel-gray font-inter">Work on diverse equipment (AMRs, conveyors, AGVs). Expand expertise and command higher rates.</p>
                </div>
              </div>
            </div>

            <div className="tech-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-neon-yellow/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-tech-white mb-2">9. TRANSPARENT ANALYTICS</h3>
                  <p className="text-steel-gray font-inter">Track earnings, job history, ratings, and performance. Data-driven insights to optimize your business.</p>
                </div>
              </div>
            </div>

            <div className="tech-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-success-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-tech-white mb-2">10. EMERGENCY BONUSES</h3>
                  <p className="text-steel-gray font-inter">Accept high-urgency jobs for premium pay. Emergency jobs pay 30-40% more + you get priority matching.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="py-20 px-6 bg-graphite/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-orbitron font-bold text-tech-white mb-4">
              SUCCESS STORIES
            </h2>
            <p className="text-xl text-steel-gray font-inter">Real technicians. Real results.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="metallic-panel p-6 border-success-green/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-success-green/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👨‍🔧</span>
                </div>
                <div>
                  <h4 className="font-orbitron font-bold text-tech-white">Marcus T.</h4>
                  <p className="text-xs text-steel-gray font-inter">AMR Specialist</p>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => <span key={i} className="text-neon-yellow">⭐</span>)}
              </div>
              <p className="text-steel-gray font-inter text-sm mb-4">
                "Went from 2-3 jobs/month to 15+ jobs. Earning 3x what I made before. Best decision I ever made for my business."
              </p>
              <div className="text-success-green font-orbitron font-bold text-2xl">$8,400/mo</div>
            </div>

            <div className="metallic-panel p-6 border-electric-blue/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-electric-blue/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👩‍🔧</span>
                </div>
                <div>
                  <h4 className="font-orbitron font-bold text-tech-white">Sarah K.</h4>
                  <p className="text-xs text-steel-gray font-inter">Conveyor Expert</p>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => <span key={i} className="text-neon-yellow">⭐</span>)}
              </div>
              <p className="text-steel-gray font-inter text-sm mb-4">
                "No more chasing payments! Money hits my account 2 days after completion. Platform changed my life."
              </p>
              <div className="text-electric-blue font-orbitron font-bold text-2xl">$6,800/mo</div>
            </div>

            <div className="metallic-panel p-6 border-neon-yellow/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-neon-yellow/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👨‍🔧</span>
                </div>
                <div>
                  <h4 className="font-orbitron font-bold text-tech-white">James R.</h4>
                  <p className="text-xs text-steel-gray font-inter">Robotics Generalist</p>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => <span key={i} className="text-neon-yellow">⭐</span>)}
              </div>
              <p className="text-steel-gray font-inter text-sm mb-4">
                "Started part-time, now full-time. Quit my day job after 3 months. Flexible schedule lets me pick up my kids from school."
              </p>
              <div className="text-neon-yellow font-orbitron font-bold text-2xl">$5,900/mo</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-orbitron font-bold text-tech-white mb-4">
              GET STARTED IN 3 SIMPLE STEPS
            </h2>
            <p className="text-xl text-steel-gray font-inter">From signup to first payout in under a week</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-electric-blue/10 border-4 border-electric-blue rounded-full flex items-center justify-center mx-auto mb-6 text-5xl font-orbitron font-bold text-electric-blue">
                1
              </div>
              <h3 className="text-2xl font-orbitron font-bold text-tech-white mb-3">SIGN UP</h3>
              <p className="text-steel-gray font-inter mb-4">
                Create account, add specializations, complete profile. Takes 5 minutes.
              </p>
              <div className="metallic-panel p-4 inline-block">
                <p className="text-xs text-steel-gray font-inter">$49 verification fee</p>
                <p className="text-xs text-steel-gray font-inter">Background check included</p>
              </div>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-neon-yellow/10 border-4 border-neon-yellow rounded-full flex items-center justify-center mx-auto mb-6 text-5xl font-orbitron font-bold text-neon-yellow">
                2
              </div>
              <h3 className="text-2xl font-orbitron font-bold text-tech-white mb-3">GET VERIFIED</h3>
              <p className="text-steel-gray font-inter mb-4">
                Admin reviews your credentials and certifications. Approval in 24-48 hours.
              </p>
              <div className="metallic-panel p-4 inline-block">
                <p className="text-xs text-steel-gray font-inter">Email notification sent</p>
                <p className="text-xs text-steel-gray font-inter">Instant job access</p>
              </div>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-success-green/10 border-4 border-success-green rounded-full flex items-center justify-center mx-auto mb-6 text-5xl font-orbitron font-bold text-success-green">
                3
              </div>
              <h3 className="text-2xl font-orbitron font-bold text-tech-white mb-3">START EARNING</h3>
              <p className="text-steel-gray font-inter mb-4">
                Toggle online, accept jobs, complete repairs. Get paid in 2-3 days!
              </p>
              <div className="metallic-panel p-4 inline-block">
                <p className="text-xs text-steel-gray font-inter">Direct deposit setup</p>
                <p className="text-xs text-steel-gray font-inter">Fast, secure payouts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 px-6 bg-graphite/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-orbitron font-bold text-tech-white mb-4">
              COMMON QUESTIONS
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What's the verification fee for?",
                a: "$49 covers background check, credential verification, and platform access. One-time payment, lifetime membership. Average tech makes this back on their first job."
              },
              {
                q: "How many jobs can I expect?",
                a: "Average active tech gets 12-15 job offers per month. Top performers (4.5+ stars) get 20-30+ offers. You choose which to accept based on your schedule."
              },
              {
                q: "What if I don't get paid?",
                a: "Impossible! Funds are held in escrow before you start work. Once warehouse approves completion, payment auto-releases to you within 2-3 business days. Guaranteed."
              },
              {
                q: "Can I work part-time?",
                a: "Absolutely! Toggle online/offline anytime. Many techs start part-time (weekends/evenings) and transition to full-time as business grows."
              },
              {
                q: "What equipment should I specialize in?",
                a: "AMRs, conveyors, and AGVs have highest demand. But we need all specialties: pallet movers, sorting arms, robotic welders, etc. Focus on what you know best."
              },
              {
                q: "How do I increase my earnings?",
                a: "Build 5-star rating → Get more offers → Accept emergency jobs (30% higher pay) → Respond quickly → Specialize deeply. Top techs earn $8K-$10K/month."
              }
            ].map((item, idx) => (
              <div key={idx} className="metallic-panel p-6">
                <h4 className="font-orbitron font-bold text-tech-white mb-2 text-lg">{item.q}</h4>
                <p className="text-steel-gray font-inter">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 to-cyan-500/10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-6xl font-orbitron font-bold text-tech-white mb-6">
            READY TO LEVEL UP YOUR BUSINESS?
          </h2>
          <p className="text-2xl text-steel-gray mb-4 font-inter">
            Join 150+ technicians already earning more with RobotiX Connect
          </p>
          <button 
            onClick={handleLogin}
            className="neon-yellow-button text-xl px-12 py-5 mb-6"
          >
            JOIN NOW - START EARNING
          </button>
          <p className="text-steel-gray font-inter text-sm">
            $49 verification fee • 24-48 hour approval • No contracts • Cancel anytime
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 bg-charcoal border-t border-electric-blue/20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-steel-gray font-inter">&copy; 2025 RobotiX Connect. Built for Technicians.</p>
        </div>
      </footer>

      {/* Signup Dialog */}
      <Dialog open={showSignupDialog} onOpenChange={setShowSignupDialog}>
        <DialogContent className="max-w-md bg-graphite border-2 border-electric-blue/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-orbitron font-bold text-tech-white">COMPLETE YOUR PROFILE</DialogTitle>
            <DialogDescription className="text-steel-gray font-inter">
              Just a few more details to get you started
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="tech-location" className="text-tech-white font-inter font-semibold mb-2 block">LOCATION *</Label>
              <Input 
                id="tech-location"
                placeholder="Inglewood, CA" 
                value={techData.location}
                onChange={(e) => setTechData({...techData, location: e.target.value})}
                className="tech-input"
                maxLength={200}
              />
            </div>

            <div>
              <Label htmlFor="tech-phone" className="text-tech-white font-inter font-semibold mb-2 block">CONTACT NUMBER *</Label>
              <Input 
                id="tech-phone"
                type="tel"
                placeholder="(555) 123-4567" 
                value={techData.phone}
                onChange={(e) => setTechData({...techData, phone: e.target.value})}
                className="tech-input"
                maxLength={20}
              />
            </div>

            <div>
              <Label htmlFor="tech-specializations" className="text-tech-white font-inter font-semibold mb-2 block">SPECIALIZATIONS *</Label>
              <Textarea 
                id="tech-specializations"
                placeholder="AMR, Conveyor Systems, Robotic Arms, Pallet Movers, AGVs" 
                value={techData.specializations}
                onChange={(e) => setTechData({...techData, specializations: e.target.value})}
                className="tech-input"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-steel-gray mt-1 font-inter">Comma-separated equipment types</p>
            </div>

            <div className="emergency-alert">
              <p className="text-xs text-tech-white font-inter">
                <strong>$49 verification fee</strong> required after signup. Includes background check & platform access.
              </p>
            </div>

            <button 
              onClick={handleSignup}
              className="neon-button w-full"
              disabled={loading}
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE TECHNICIAN ACCOUNT'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TechnicianLanding;
