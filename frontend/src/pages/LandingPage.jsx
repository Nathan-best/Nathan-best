import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { toast } from 'sonner';
import { api } from '../App';

const LandingPage = ({ setUser }) => {
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
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-electric-blue/10 border border-electric-blue/30 rounded-full mb-6">
                <div className="w-2 h-2 bg-success-green rounded-full pulse-blue"></div>
                <span className="text-electric-blue font-inter font-semibold text-sm">INDUSTRIAL ROBOTICS PLATFORM</span>
              </div>
              <h1 className="text-6xl font-orbitron font-black text-tech-white leading-tight mb-6">
                FAST, RELIABLE
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-cyan-400">
                  ROBOT REPAIR
                </span>
              </h1>
              <p className="text-xl text-steel-gray mb-8 leading-relaxed font-inter">
                The premier platform connecting Inglewood-area warehouses with certified robotics technicians. 
                <span className="text-electric-blue font-semibold"> Emergency dispatch available 24/7.</span>
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={handleLogin}
                  className="neon-button text-lg px-10 py-4"
                  data-testid="hero-get-started-button"
                >
                  REQUEST REPAIR
                </button>
                <button 
                  className="neon-outline text-lg px-10 py-4"
                  data-testid="hero-learn-more-button"
                >
                  Learn More
                </button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-electric-blue/20">
                <div>
                  <div className="text-4xl font-orbitron font-bold text-electric-blue">50+</div>
                  <div className="text-sm text-steel-gray mt-1 font-inter">Certified Techs</div>
                </div>
                <div>
                  <div className="text-4xl font-orbitron font-bold text-success-green">98%</div>
                  <div className="text-sm text-steel-gray mt-1 font-inter">Success Rate</div>
                </div>
                <div>
                  <div className="text-4xl font-orbitron font-bold text-neon-yellow">2-4h</div>
                  <div className="text-sm text-steel-gray mt-1 font-inter">Emergency ETA</div>
                </div>
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

      {/* Features */}
      <div className="py-20 px-6 bg-graphite/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-orbitron font-bold text-tech-white mb-4">HOW IT WORKS</h2>
            <div className="neon-divider w-32 mx-auto"></div>
            <p className="text-lg text-steel-gray font-inter mt-4">Fast, automated, and reliable robotics maintenance</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="tech-card" data-testid="feature-post-jobs-card">
              <div className="w-16 h-16 bg-electric-blue/10 border border-electric-blue/30 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 tech-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-xl font-orbitron font-bold text-tech-white mb-3">SUBMIT REQUEST</h3>
              <p className="text-steel-gray font-inter">Upload error codes, photos, and select urgency level. Our AI instantly matches you with qualified techs.</p>
            </div>

            <div className="tech-card" data-testid="feature-ai-matching-card">
              <div className="w-16 h-16 bg-neon-yellow/10 border border-neon-yellow/30 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-neon-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-orbitron font-bold text-tech-white mb-3">LIVE TRACKING</h3>
              <p className="text-steel-gray font-inter">Real-time technician location, ETA countdown, and job status updates via our industrial-grade dashboard.</p>
            </div>

            <div className="tech-card" data-testid="feature-get-paid-card">
              <div className="w-16 h-16 bg-success-green/10 border border-success-green/30 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-success-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-orbitron font-bold text-tech-white mb-3">REPAIR COMPLETE</h3>
              <p className="text-steel-gray font-inter">Automated invoicing, secure payment processing, and quality verification with detailed repair reports.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 to-cyan-500/10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl font-orbitron font-bold text-tech-white mb-6">
            READY FOR DEPLOYMENT?
          </h2>
          <p className="text-xl text-steel-gray mb-8 font-inter">
            Join the future of industrial robotics maintenance
          </p>
          <button 
            onClick={handleLogin}
            className="neon-yellow-button text-lg px-12 py-4"
            data-testid="cta-join-now-button"
          >
            ACTIVATE ACCOUNT
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 bg-charcoal border-t border-electric-blue/20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-steel-gray font-inter">&copy; 2025 RobotiX Connect. Industrial Tech Platform.</p>
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

export default LandingPage;
