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
    // Check for session_id in URL hash
    const hash = location.hash;
    if (hash && hash.includes('session_id=')) {
      const sid = hash.split('session_id=')[1].split('&')[0];
      setSessionId(sid);
      setLoading(true);
      handleSessionId(sid);
      // Clean URL
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
        // Set cookie
        document.cookie = `session_token=${response.data.session_token}; path=/; secure; samesite=none`;
        setUser(response.data.user);
        toast.success('Welcome back!');
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
    // Enhanced validation
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

      if (roleData.role === 'technician' && specs.length === 0) {
        toast.error('Please enter valid specializations');
        setLoading(false);
        return;
      }

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>RobotiX Connect</span>
          </div>
          <Button 
            onClick={handleLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
            data-testid="nav-login-button"
          >
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
                🤝 Connecting Warehouses & Robotics Experts
              </div>
              <h1 className="text-6xl font-bold text-slate-900 leading-tight mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Fast, Reliable
                <span className="block text-blue-600">Robotics Maintenance</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                The premier platform connecting Inglewood-area warehouses with verified robotics technicians. Get your equipment fixed fast or find your next job.
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={handleLogin}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-6 text-lg rounded-full"
                  data-testid="hero-get-started-button"
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-slate-300 text-slate-700 font-semibold px-8 py-6 text-lg rounded-full hover:bg-slate-50"
                  data-testid="hero-learn-more-button"
                >
                  Learn More
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-slate-200">
                <div>
                  <div className="text-3xl font-bold text-slate-900">50+</div>
                  <div className="text-sm text-slate-600 mt-1">Verified Techs</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">98%</div>
                  <div className="text-sm text-slate-600 mt-1">Success Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">24h</div>
                  <div className="text-sm text-slate-600 mt-1">Avg Response</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl opacity-20 blur-3xl"></div>
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80" 
                alt="Robotics" 
                className="relative rounded-3xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>How It Works</h2>
            <p className="text-lg text-slate-600">Simple, fast, and reliable robotics maintenance</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-slate-100 hover:border-blue-200 transition-all hover:shadow-lg" data-testid="feature-post-jobs-card">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Post Jobs</h3>
                <p className="text-slate-600">Warehouses post maintenance needs with equipment details, urgency, and budget.</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-100 hover:border-blue-200 transition-all hover:shadow-lg" data-testid="feature-ai-matching-card">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">AI Matching</h3>
                <p className="text-slate-600">Our GPT-5 powered system matches jobs with the best-fit technicians based on skills and location.</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-100 hover:border-blue-200 transition-all hover:shadow-lg" data-testid="feature-get-paid-card">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Get Paid</h3>
                <p className="text-slate-600">Complete the job, get reviewed, and receive automatic payment via Stripe.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of warehouses and technicians in the Inglewood area
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-10 py-6 text-lg rounded-full"
            data-testid="cta-join-now-button"
          >
            Join Now - It's Free
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto text-center">
          <p>&copy; 2025 RobotiX Connect. All rights reserved.</p>
        </div>
      </footer>

      {/* Role Selection Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-md" data-testid="role-selection-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Complete Your Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>I am a...</Label>
              <RadioGroup value={roleData.role} onValueChange={(val) => setRoleData({...roleData, role: val})}>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-slate-50" data-testid="role-warehouse-option">
                  <RadioGroupItem value="warehouse" id="warehouse" />
                  <Label htmlFor="warehouse" className="flex-1 cursor-pointer">
                    <div className="font-semibold">Warehouse / Logistics</div>
                    <div className="text-sm text-slate-500">I need robotics maintenance</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-slate-50" data-testid="role-technician-option">
                  <RadioGroupItem value="technician" id="technician" />
                  <Label htmlFor="technician" className="flex-1 cursor-pointer">
                    <div className="font-semibold">Robotics Technician</div>
                    <div className="text-sm text-slate-500">I repair robotics equipment</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Location *</Label>
              <Input 
                placeholder="Inglewood, CA" 
                value={roleData.location}
                onChange={(e) => setRoleData({...roleData, location: e.target.value})}
                data-testid="location-input"
              />
            </div>

            <div>
              <Label>Phone Number *</Label>
              <Input 
                placeholder="(555) 123-4567" 
                value={roleData.phone}
                onChange={(e) => setRoleData({...roleData, phone: e.target.value})}
                data-testid="phone-input"
              />
            </div>

            {roleData.role === 'technician' && (
              <div>
                <Label>Specializations * (comma-separated)</Label>
                <Textarea 
                  placeholder="e.g., Pallet movers, Conveyors, Sorting arms, AGVs" 
                  value={roleData.specializations}
                  onChange={(e) => setRoleData({...roleData, specializations: e.target.value})}
                  data-testid="specializations-input"
                />
              </div>
            )}

            <Button 
              onClick={handleRoleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
              data-testid="complete-profile-button"
            >
              {loading ? 'Creating Account...' : 'Complete Profile'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;
