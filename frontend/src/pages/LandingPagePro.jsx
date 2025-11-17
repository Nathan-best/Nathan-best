import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { toast } from 'sonner';
import { api } from '../App';

const LandingPagePro = ({ setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [roleData, setRoleData] = useState({
    role: 'warehouse',
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
        setShowRoleDialog(true);
        setLoading(false);
      } else {
        document.cookie = `session_token=${response.data.session_token}; path=/; secure; samesite=none`;
        setUser(response.data.user);
        toast.success('Welcome back to RobotiX Connect!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Authentication failed');
      setLoading(false);
    }
  };

  const handleLogin = () => {
    const redirectUrl = `${window.location.origin}/`;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleRoleSubmit = async () => {
    if (!roleData.location || roleData.location.length < 3) {
      toast.error('Please enter a valid location (minimum 3 characters)');
      return;
    }

    if (!roleData.phone || roleData.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    if (roleData.role === 'technician' && (!roleData.specializations || roleData.specializations.trim().length === 0)) {
      toast.error('Please enter at least one specialization');
      return;
    }

    try {
      setLoading(true);
      const specs = roleData.role === 'technician' 
        ? roleData.specializations.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : [];

      const response = await api.post('/auth/register', {
        ...roleData,
        specializations: specs
      }, {
        headers: { 'X-Session-ID': sessionId }
      });

      document.cookie = `session_token=${response.data.session_token}; path=/; secure; samesite=none`;
      setUser(response.data.user);
      toast.success(`Welcome to RobotiX Connect! Your ${roleData.role} account is ready.`);
      navigate('/dashboard');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Registration failed. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen tech-grid-bg flex items-center justify-center">
        <div className="text-center">
          <div className="tech-spinner mx-auto mb-4"></div>
          <p className="text-tech-white font-inter font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

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
            data-testid="nav-login-button"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="slide-in">
              <h1 className="text-6xl lg:text-7xl font-orbitron font-black text-tech-white leading-tight mb-6">
                ON-DEMAND
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-cyan-400">
                  ROBOTICS REPAIR
                </span>
                FOR LOCAL WAREHOUSES
              </h1>
              <p className="text-xl text-steel-gray mb-6 leading-relaxed font-inter">
                Fast, affordable maintenance and emergency repair for <span className="text-electric-blue font-semibold">AMRs, conveyors, pallet movers, and robotic arms</span> — powered by a verified network of expert technicians.
              </p>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-4 mb-8 text-sm text-steel-gray font-inter">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success-green rounded-full pulse-blue"></div>
                  <span>Serving Inglewood • Hawthorne • Compton • LA County</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-error-red rounded-full pulse-red"></div>
                  <span>24/7 Emergency Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-electric-blue rounded-full pulse-blue"></div>
                  <span>Verified Robotics Technicians</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={handleLogin}
                  className="neon-button text-lg px-10 py-4"
                  data-testid="hero-request-repair-button"
                >
                  REQUEST REPAIR
                </button>
                <button 
                  onClick={handleLogin}
                  className="neon-outline text-lg px-10 py-4"
                  data-testid="hero-join-tech-button"
                >
                  Join as Technician
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/20 to-cyan-500/20 rounded-3xl blur-3xl"></div>
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80" 
                alt="Industrial Robotics" 
                className="relative rounded-2xl border-2 border-electric-blue/30 shadow-glow-blue w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Problem Section */}
      <div className="py-20 px-6 bg-graphite/50 border-y border-electric-blue/10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl font-orbitron font-bold text-tech-white mb-6">
            WAREHOUSE ROBOTS BREAK.
            <span className="block text-error-red mt-2">DOWNTIME IS EXPENSIVE.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="metallic-panel p-6 text-left">
              <div className="text-error-red text-3xl mb-3">✗</div>
              <p className="text-tech-white font-inter">No reliable directory of local robotics technicians</p>
            </div>
            <div className="metallic-panel p-6 text-left">
              <div className="text-error-red text-3xl mb-3">✗</div>
              <p className="text-tech-white font-inter">Slow OEM response times (2–5 days)</p>
            </div>
            <div className="metallic-panel p-6 text-left">
              <div className="text-error-red text-3xl mb-3">✗</div>
              <p className="text-tech-white font-inter">Repairs cost thousands every hour they're delayed</p>
            </div>
            <div className="metallic-panel p-6 text-left">
              <div className="text-error-red text-3xl mb-3">✗</div>
              <p className="text-tech-white font-inter">Smaller warehouses don't have in-house robotics teams</p>
            </div>
          </div>
          <p className="text-2xl text-neon-yellow font-orbitron font-bold mt-12">
            You need a fast, affordable, local solution.
          </p>
        </div>
      </div>

      {/* Solution Section */}
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-orbitron font-bold text-tech-white mb-4">
              YOUR ROBOTICS MAINTENANCE
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-cyan-400 mt-2">
                BROKERAGE
              </span>
            </h2>
            <p className="text-xl text-steel-gray font-inter mt-6">
              We connect warehouses with top-tier robotics technicians in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="tech-card p-6">
              <div className="text-electric-blue text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-orbitron font-bold text-tech-white mb-3">RAPID DISPATCH</h3>
              <p className="text-steel-gray font-inter">Technician matched and dispatched within minutes, not days.</p>
            </div>
            <div className="tech-card p-6">
              <div className="text-neon-yellow text-4xl mb-4">📡</div>
              <h3 className="text-xl font-orbitron font-bold text-tech-white mb-3">LIVE TRACKING</h3>
              <p className="text-steel-gray font-inter">Real-time ETA updates and communication during repair.</p>
            </div>
            <div className="tech-card p-6">
              <div className="text-success-green text-4xl mb-4">✓</div>
              <h3 className="text-xl font-orbitron font-bold text-tech-white mb-3">VERIFIED SPECIALISTS</h3>
              <p className="text-steel-gray font-inter">AMRs, conveyors, sorting arms, pallet movers — we have experts.</p>
            </div>
            <div className="tech-card p-6">
              <div className="text-electric-blue text-4xl mb-4">💰</div>
              <h3 className="text-xl font-orbitron font-bold text-tech-white mb-3">CLEAR PRICING</h3>
              <p className="text-steel-gray font-inter">No surprise fees. Know the cost before work begins.</p>
            </div>
            <div className="tech-card p-6">
              <div className="text-neon-yellow text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-orbitron font-bold text-tech-white mb-3">PREVENTIVE PLANS</h3>
              <p className="text-steel-gray font-inter">Maintenance schedules that reduce downtime before it happens.</p>
            </div>
            <div className="tech-card p-6">
              <div className="text-success-green text-4xl mb-4">💬</div>
              <h3 className="text-xl font-orbitron font-bold text-tech-white mb-3">INSTANT COMMUNICATION</h3>
              <p className="text-steel-gray font-inter">In-app chat and voice notes for seamless coordination.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 px-6 bg-graphite/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-orbitron font-bold text-tech-white mb-4">HOW IT WORKS</h2>
            <div className="neon-divider w-32 mx-auto"></div>
            <p className="text-lg text-steel-gray font-inter mt-4">Simple. Fast. Reliable.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-electric-blue/10 border-2 border-electric-blue rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-orbitron font-bold text-electric-blue">
                1
              </div>
              <h3 className="text-xl font-orbitron font-bold text-tech-white mb-3">SUBMIT REPAIR</h3>
              <p className="text-steel-gray font-inter">Describe the issue & upload error codes and visuals.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-neon-yellow/10 border-2 border-neon-yellow rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-orbitron font-bold text-neon-yellow">
                2
              </div>
              <h3 className="text-xl font-orbitron font-bold text-tech-white mb-3">GET MATCHED</h3>
              <p className="text-steel-gray font-inter">AI system finds the ideal local robotics technician instantly.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-success-green/10 border-2 border-success-green rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-orbitron font-bold text-success-green">
                3
              </div>
              <h3 className="text-xl font-orbitron font-bold text-tech-white mb-3">TRACK LIVE</h3>
              <p className="text-steel-gray font-inter">Watch technician ETA and receive real-time status updates.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-electric-blue/10 border-2 border-electric-blue rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-orbitron font-bold text-electric-blue">
                4
              </div>
              <h3 className="text-xl font-orbitron font-bold text-tech-white mb-3">COMPLETED</h3>
              <p className="text-steel-gray font-inter">Technician uploads photos. You pay. Job archived.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl font-orbitron font-bold text-tech-white mb-4">
            TRANSPARENT PRICING.
            <span className="block text-electric-blue mt-2">NO SURPRISES.</span>
          </h2>
          <p className="text-xl text-steel-gray font-inter mb-12">Starting rates for common services</p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="metallic-panel p-8 border-electric-blue/40">
              <div className="text-5xl font-orbitron font-bold text-electric-blue mb-2">$129</div>
              <h3 className="text-xl font-orbitron font-bold text-tech-white mb-4">STANDARD REPAIR</h3>
              <p className="text-steel-gray font-inter text-sm mb-4">Next-day service</p>
              <div className="text-left space-y-2 text-sm text-steel-gray font-inter">
                <p>✓ Verified technician</p>
                <p>✓ Parts assessment</p>
                <p>✓ Digital report</p>
                <p>✓ 30-day guarantee</p>
              </div>
            </div>

            <div className="metallic-panel p-8 border-neon-yellow/60 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-neon-yellow text-charcoal px-4 py-1 rounded-full text-xs font-bold">
                POPULAR
              </div>
              <div className="text-5xl font-orbitron font-bold text-neon-yellow mb-2">$199</div>
              <h3 className="text-xl font-orbitron font-bold text-tech-white mb-4">EMERGENCY DISPATCH</h3>
              <p className="text-steel-gray font-inter text-sm mb-4">2-4 hour response</p>
              <div className="text-left space-y-2 text-sm text-steel-gray font-inter">
                <p>✓ Priority technician</p>
                <p>✓ Same-day parts sourcing</p>
                <p>✓ Live ETA tracking</p>
                <p>✓ 24/7 support</p>
              </div>
            </div>

            <div className="metallic-panel p-8 border-electric-blue/40">
              <div className="text-5xl font-orbitron font-bold text-success-green mb-2">$59</div>
              <h3 className="text-xl font-orbitron font-bold text-tech-white mb-4">DIAGNOSTICS</h3>
              <p className="text-steel-gray font-inter text-sm mb-4">Issue identification</p>
              <div className="text-left space-y-2 text-sm text-steel-gray font-inter">
                <p>✓ Error code analysis</p>
                <p>✓ Photo inspection</p>
                <p>✓ Repair estimate</p>
                <p>✓ Free with subscription</p>
              </div>
            </div>
          </div>

          <p className="text-steel-gray font-inter text-sm mt-8">
            Platform fee (10–25%) included in all quotes. Monthly maintenance plans available.
          </p>
        </div>
      </div>

      {/* Technician CTA */}
      <div className="py-20 px-6 bg-gradient-to-r from-metallic to-graphite border-y border-electric-blue/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-orbitron font-bold text-tech-white mb-6">
                TECHNICIANS:
                <span className="block text-neon-yellow mt-2">GET PAID FAST. GET BETTER JOBS.</span>
              </h2>
              <p className="text-xl text-steel-gray font-inter mb-6">
                Independent robotics techs get:
              </p>
              <div className="space-y-3 text-tech-white font-inter mb-8">
                <p className="flex items-center gap-3">
                  <span className="text-electric-blue text-xl">✓</span> Steady job flow
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-electric-blue text-xl">✓</span> Higher payouts (85% of job value)
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-electric-blue text-xl">✓</span> Flexible scheduling
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-electric-blue text-xl">✓</span> No marketing required
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-electric-blue text-xl">✓</span> Automatic invoicing & payouts
                </p>
              </div>
              <button 
                onClick={handleLogin}
                className="neon-yellow-button text-lg px-10 py-4"
              >
                JOIN AS TECHNICIAN
              </button>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1581092918484-8313e1f3e821?w=600&q=80" 
                alt="Technician at work" 
                className="rounded-2xl border-2 border-neon-yellow/30 shadow-glow-yellow"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 to-cyan-500/10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl lg:text-6xl font-orbitron font-bold text-tech-white mb-6">
            READY TO REDUCE DOWNTIME?
          </h2>
          <p className="text-2xl text-steel-gray mb-4 font-inter">
            Fast repair. Verified technicians. 24/7 availability.
          </p>
          <p className="text-xl text-electric-blue font-orbitron font-bold mb-8">
            Your robots deserve better.
          </p>
          <button 
            onClick={handleLogin}
            className="neon-button text-xl px-12 py-5"
            data-testid="cta-request-tech-button"
          >
            REQUEST A TECHNICIAN
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 bg-charcoal border-t border-electric-blue/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-orbitron font-bold text-tech-white mb-2">RobotiX Connect</h3>
            <p className="text-steel-gray font-inter">Robotics Maintenance Brokerage • Los Angeles</p>
            <p className="text-steel-gray font-inter text-sm mt-2">On-Demand Robotics Repair for Warehouses</p>
          </div>
          <div className="flex justify-center gap-8 text-sm text-steel-gray font-inter mb-6">
            <a href="#" className="hover:text-electric-blue transition-colors">Support</a>
            <a href="#" className="hover:text-electric-blue transition-colors">Terms</a>
            <a href="#" className="hover:text-electric-blue transition-colors">Privacy</a>
          </div>
          <p className="text-center text-xs text-steel-gray font-inter">
            &copy; 2025 RobotiX Connect. Industrial Tech Platform. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Role Selection Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-md bg-graphite border-2 border-electric-blue/30" data-testid="role-selection-dialog" aria-describedby="role-dialog-description">
          <DialogHeader>
            <DialogTitle className="text-2xl font-orbitron font-bold text-tech-white">ACTIVATE PROFILE</DialogTitle>
            <DialogDescription id="role-dialog-description" className="text-steel-gray font-inter">
              Configure your account type and credentials
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-tech-white font-inter font-semibold mb-2 block">ACCOUNT TYPE *</Label>
              <RadioGroup value={roleData.role} onValueChange={(val) => setRoleData({...roleData, role: val})} aria-label="Select your role">
                <div className="metallic-panel p-4 mb-3 cursor-pointer hover:border-electric-blue/50" data-testid="role-warehouse-option">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="warehouse" id="warehouse" className="border-electric-blue" />
                    <Label htmlFor="warehouse" className="flex-1 cursor-pointer">
                      <div className="font-orbitron font-bold text-tech-white">WAREHOUSE / LOGISTICS</div>
                      <div className="text-sm text-steel-gray font-inter">Request robotics maintenance services</div>
                    </Label>
                  </div>
                </div>
                <div className="metallic-panel p-4 cursor-pointer hover:border-electric-blue/50" data-testid="role-technician-option">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="technician" id="technician" className="border-electric-blue" />
                    <Label htmlFor="technician" className="flex-1 cursor-pointer">
                      <div className="font-orbitron font-bold text-tech-white">ROBOTICS TECHNICIAN</div>
                      <div className="text-sm text-steel-gray font-inter">Provide repair and maintenance services</div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="location-input" className="text-tech-white font-inter font-semibold mb-2 block">LOCATION * <span className="text-xs text-steel-gray font-normal">(City, State)</span></Label>
              <Input 
                id="location-input"
                placeholder="Inglewood, CA" 
                value={roleData.location}
                onChange={(e) => setRoleData({...roleData, location: e.target.value})}
                className="tech-input"
                data-testid="location-input"
                maxLength={200}
                aria-required="true"
              />
              <p className="text-xs text-steel-gray mt-1 font-inter">Geographic matching for faster dispatch</p>
            </div>

            <div>
              <Label htmlFor="phone-input" className="text-tech-white font-inter font-semibold mb-2 block">CONTACT NUMBER *</Label>
              <Input 
                id="phone-input"
                type="tel"
                placeholder="(555) 123-4567" 
                value={roleData.phone}
                onChange={(e) => setRoleData({...roleData, phone: e.target.value})}
                className="tech-input"
                data-testid="phone-input"
                maxLength={20}
                aria-required="true"
              />
              <p className="text-xs text-steel-gray mt-1 font-inter">Emergency dispatch notifications</p>
            </div>

            {roleData.role === 'technician' && (
              <div>
                <Label htmlFor="specializations-input" className="text-tech-white font-inter font-semibold mb-2 block">SPECIALIZATIONS *</Label>
                <Textarea 
                  id="specializations-input"
                  placeholder="AMR, Conveyor Systems, Robotic Arms, Pallet Movers, AGVs" 
                  value={roleData.specializations}
                  onChange={(e) => setRoleData({...roleData, specializations: e.target.value})}
                  className="tech-input"
                  data-testid="specializations-input"
                  rows={3}
                  maxLength={500}
                  aria-required="true"
                />
                <p className="text-xs text-steel-gray mt-1 font-inter">Comma-separated robot types you service</p>
              </div>
            )}

            {roleData.role === 'technician' && (
              <div className="emergency-alert">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-error-red mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs text-tech-white font-inter"><strong>VERIFICATION REQUIRED:</strong> Admin approval needed before accepting jobs (24-48 hours)</p>
                </div>
              </div>
            )}

            <button 
              onClick={handleRoleSubmit}
              className="neon-button w-full"
              disabled={loading}
              data-testid="complete-profile-button"
              aria-busy={loading}
            >
              {loading ? 'ACTIVATING...' : `ACTIVATE ${roleData.role.toUpperCase()} ACCOUNT`}
            </button>
            
            <p className="text-xs text-center text-steel-gray mt-2 font-inter">
              By activating, you agree to Terms of Service and Privacy Policy
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPagePro;
